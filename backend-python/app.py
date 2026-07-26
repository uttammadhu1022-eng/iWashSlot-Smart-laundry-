import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash
from database import db
from models import User, Machine

from routes.auth import auth_bp
from routes.machines import machines_bp
from routes.bookings import bookings_bp
from routes.issues import issues_bp

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app, supports_credentials=True)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'laundry.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'supersecret_fallback_key_123')

db.init_app(app)

# Global Error Handlers
@app.errorhandler(400)
def bad_request(error):
    logger.warning(f"Bad Request: {request.url} - {str(error)}")
    return jsonify({'status': 'error', 'message': 'Bad Request'}), 400

@app.errorhandler(404)
def not_found(error):
    logger.warning(f"Not Found: {request.url}")
    return jsonify({'status': 'error', 'message': 'Resource not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    logger.warning(f"Method Not Allowed: {request.url}")
    return jsonify({'status': 'error', 'message': 'Method not allowed for the requested URL'}), 405

@app.errorhandler(Exception)
def handle_exception(error):
    logger.error(f"Unhandled Exception: {request.url} - {str(error)}", exc_info=True)
    return jsonify({'status': 'error', 'message': 'Internal Server Error'}), 500

@app.errorhandler(500)
def internal_server_error(error):
    logger.error(f"Internal Server Error: {request.url} - {str(error)}", exc_info=True)
    return jsonify({'status': 'error', 'message': 'Internal Server Error'}), 500

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
app.register_blueprint(machines_bp, url_prefix='/api/v1/machines')
app.register_blueprint(bookings_bp, url_prefix='/api/v1/bookings')
app.register_blueprint(issues_bp, url_prefix='/api/v1/issues')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    else:
        return app.send_static_file('index.html')


@app.route('/api/v1/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'success', 'message': 'Python backend is healthy!'})

def seed_db():
    if Machine.query.first():
        return
        
    print('Starting database seeding...')
    
    machines = [
        {'id': 'm1', 'name': 'A1', 'status': 'FREE'},
        {'id': 'm2', 'name': 'A2', 'status': 'FREE'},
        {'id': 'm3', 'name': 'A3', 'status': 'FREE'},
        {'id': 'm4', 'name': 'B1', 'status': 'FREE'},
        {'id': 'm5', 'name': 'B2', 'status': 'FREE'},
        {'id': 'm6', 'name': 'B3', 'status': 'FREE'},
    ]
    for m in machines:
        machine = Machine(id=m['id'], name=m['name'], status=m['status'])
        db.session.add(machine)
        
    students = [
        {'name': 'Alok', 'usn': '1JS25IS139', 'phone': '+917741820976', 'role': 'STUDENT', 'password': 'password'},
        {'name': 'Shreyansh Raj', 'usn': '1JS25IS119', 'phone': '+919876543210', 'role': 'STUDENT', 'password': 'password'},
        {'name': 'Srujan Rao R', 'usn': '1JS25IS124', 'phone': '+919876543211', 'role': 'STUDENT', 'password': 'password'},
        {'name': 'Tanmay Anand', 'usn': '1JS25IS130', 'phone': '+919876543212', 'role': 'STUDENT', 'password': 'password'},
        {'name': 'Uday E', 'usn': '1JS25IS133', 'phone': '+919876543213', 'role': 'STUDENT', 'password': 'password'}
    ]
    for s in students:
        hashed_password = generate_password_hash(s['password'])
        student = User(usn=s['usn'], name=s['name'], phone=s['phone'], role=s['role'], password_hash=hashed_password)
        db.session.add(student)
        
    # Add Admin User
    admin_password = generate_password_hash('password')
    admin_user = User(usn='admin', name='Super Admin', phone='+910000000000', role='ADMIN', password_hash=admin_password)
    db.session.add(admin_user)
        
    db.session.commit()
    logger.info('Database seeding completed successfully.')

def ensure_admin_exists():
    admin = User.query.filter_by(usn='admin').first()
    if not admin:
        admin_password = generate_password_hash('password')
        admin_user = User(usn='admin', name='Super Admin', phone='+910000000000', role='ADMIN', password_hash=admin_password)
        db.session.add(admin_user)
        db.session.commit()
        logger.info('Admin user verified and created.')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_db()
        ensure_admin_exists()
    
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() in ['true', '1', 'yes']
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=debug_mode)
