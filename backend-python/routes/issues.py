from flask import Blueprint, request, jsonify
from models import IssueReport, User, Machine
from database import db
from decorators import token_required, admin_required
import random
import string
import logging

logger = logging.getLogger(__name__)

issues_bp = Blueprint('issues', __name__)

@issues_bp.route('', methods=['GET'])
@token_required
def get_issues(current_user):
    issues_with_users = db.session.query(IssueReport, User).join(User, IssueReport.userUsn == User.usn).all()
    
    result = []
    for i, u in issues_with_users:
        result.append({
            'id': i.id,
            'machineId': i.machineId,
            'userUsn': i.userUsn,
            'userName': u.name,
            'description': i.description,
            'type': i.type,
            'status': i.status,
            'createdAt': int(i.createdAt.timestamp() * 1000) if i.createdAt else 0
        })
    return jsonify({'status': 'success', 'data': {'issues': result}})

@issues_bp.route('', methods=['POST'])
@token_required
def report_issue(current_user):
    if not request.is_json:
        return jsonify({'status': 'error', 'message': 'Request must be JSON.'}), 400
        
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'message': 'Empty request.'}), 400
        
    machine_id = data.get('machineId')
    description = data.get('description')
    type = data.get('type')
    
    if not machine_id or not description or not type:
        return jsonify({'status': 'error', 'message': 'Machine ID, description, and type are required.'}), 400
        
    if type not in ['POWER', 'WATER', 'MECHANICAL', 'OTHER']:
        return jsonify({'status': 'error', 'message': 'Invalid issue type.'}), 400
        
    user_usn = current_user.get('usn') if isinstance(current_user, dict) else current_user.usn
    
    issue_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=7))
    issue = IssueReport(
        id=issue_id,
        machineId=machine_id,
        userUsn=user_usn,
        description=description,
        type=type,
        status='OPEN'
    )
    try:
        db.session.add(issue)
        db.session.commit()
        logger.info(f"Issue {issue_id} reported for machine {machine_id} by {user_usn}")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to report issue due to DB error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'An error occurred while reporting the issue.'}), 500
    
    issue_dict = {
        'id': issue.id,
        'machineId': issue.machineId,
        'userUsn': issue.userUsn,
        'description': issue.description,
        'type': issue.type,
        'status': issue.status,
        'createdAt': int(issue.createdAt.timestamp() * 1000)
    }
    
    return jsonify({'status': 'success', 'data': {'issue': issue_dict}}), 201

@issues_bp.route('/<id>/approve', methods=['POST'])
@token_required
@admin_required
def approve_issue(current_user, id):
    issue = IssueReport.query.get(id)
    if not issue:
        return jsonify({'status': 'error', 'message': 'Issue report not found.'}), 404
        
    try:
        issue.status = 'APPROVED'
        machine = Machine.query.get(issue.machineId)
        if machine:
            machine.status = 'OUT_OF_SERVICE'
            
        db.session.commit()
        logger.info(f"Issue {id} approved. Machine {issue.machineId} is OUT_OF_SERVICE.")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to approve issue due to DB error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'An error occurred while approving the issue.'}), 500
    
    issue_dict = {
        'id': issue.id,
        'machineId': issue.machineId,
        'userUsn': issue.userUsn,
        'description': issue.description,
        'type': issue.type,
        'status': issue.status,
        'createdAt': int(issue.createdAt.timestamp() * 1000)
    }
    return jsonify({'status': 'success', 'data': {'issue': issue_dict}})

@issues_bp.route('/<id>/resolve', methods=['POST'])
@token_required
@admin_required
def resolve_issue(current_user, id):
    issue = IssueReport.query.get(id)
    if not issue:
        return jsonify({'status': 'error', 'message': 'Issue report not found.'}), 404
        
    try:
        issue.status = 'RESOLVED'
        machine = Machine.query.get(issue.machineId)
        # Assuming resolving an issue might free the machine if it was OUT_OF_SERVICE
        if machine and machine.status == 'OUT_OF_SERVICE':
            machine.status = 'FREE'
        db.session.commit()
        logger.info(f"Issue {id} resolved. Machine {issue.machineId} is FREE.")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to resolve issue due to DB error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'An error occurred while resolving the issue.'}), 500
    
    return jsonify({'status': 'success', 'message': 'Issue resolved successfully.'})

@issues_bp.route('/<id>', methods=['DELETE'])
@token_required
def delete_issue(current_user, id):
    issue = IssueReport.query.get(id)
    if not issue:
        return jsonify({'status': 'error', 'message': 'Issue report not found.'}), 404
        
    user_usn = current_user.get('usn') if isinstance(current_user, dict) else current_user.usn
    
    is_admin = current_user.get('role') == 'ADMIN' if isinstance(current_user, dict) else getattr(current_user, 'role', None) == 'ADMIN'
    
    if issue.userUsn != user_usn and not is_admin:
        return jsonify({'status': 'error', 'message': 'Unauthorized to delete this issue.'}), 403
        
    try:
        db.session.delete(issue)
        db.session.commit()
        logger.info(f"Issue {id} deleted by {user_usn}")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to delete issue due to DB error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'An error occurred while deleting the issue.'}), 500
    
    return jsonify({'status': 'success', 'message': 'Issue deleted successfully.'})
