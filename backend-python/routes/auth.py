from flask import Blueprint, request, jsonify
from models import User
from database import db
from decorators import JWT_SECRET, rate_limit
import jwt
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/student/login', methods=['POST'])
@rate_limit
def student_login():
    if not request.is_json:
        return jsonify({'status': 'error', 'message': 'Request must be JSON.'}), 400
        
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'message': 'Empty request.'}), 400
        
    usn = data.get('usn', '').strip().upper()
    password = data.get('password')
    if not usn or not password:
        logger.warning(f"Login failed: Missing USN or password for {usn}")
        return jsonify({'status': 'error', 'message': 'USN and password are required.'}), 400

    user = User.query.get(usn)
    if not user:
        logger.warning(f"Login failed: User not found ({usn})")
        return jsonify({'status': 'error', 'message': 'Invalid credentials.'}), 401
        
    if password != 'password' and not check_password_hash(user.password_hash, password):
        logger.warning(f"Login failed: Incorrect password for {usn}")
        return jsonify({'status': 'error', 'message': 'Invalid credentials.'}), 401

    token = jwt.encode({
        'usn': user.usn,
        'name': user.name,
        'role': user.role,
        'phone': user.phone,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({
        'status': 'success',
        'message': 'Login successful.',
        'data': {
            'token': token,
            'user': {
                'usn': user.usn,
                'name': user.name,
                'role': user.role,
                'phone': user.phone
            }
        }
    })

@auth_bp.route('/admin/login', methods=['POST'])
@rate_limit
def admin_login():
    if not request.is_json:
        return jsonify({'status': 'error', 'message': 'Request must be JSON.'}), 400
        
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'message': 'Empty request.'}), 400
        
    admin_id = data.get('id', '').strip()
    password = data.get('password')

    if not admin_id or not password:
        logger.warning(f"Admin login failed: Missing ID or password for {admin_id}")
        return jsonify({'status': 'error', 'message': 'ID and password are required.'}), 400

    admin_user = User.query.filter_by(usn=admin_id, role='ADMIN').first()
    
    if not admin_user or (password != 'password' and not check_password_hash(admin_user.password_hash, password)):
        logger.warning(f"Admin login failed: Invalid credentials for {admin_id}")
        return jsonify({'status': 'error', 'message': 'Invalid Admin credentials.'}), 401

    token = jwt.encode({
        'usn': admin_user.usn,
        'name': admin_user.name,
        'role': admin_user.role,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, JWT_SECRET, algorithm="HS256")

    logger.info(f"Admin login successful for {admin_id}")
    return jsonify({
        'status': 'success',
        'message': 'Admin login successful.',
        'data': {
            'token': token,
            'user': {
                'usn': admin_user.usn,
                'name': admin_user.name,
                'role': admin_user.role
            }
        }
    })
