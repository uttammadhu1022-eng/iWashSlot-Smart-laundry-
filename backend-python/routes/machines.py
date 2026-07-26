from flask import Blueprint, request, jsonify
from models import Machine
from database import db
from decorators import token_required, admin_required
import logging

logger = logging.getLogger(__name__)

machines_bp = Blueprint('machines', __name__)

@machines_bp.route('', methods=['GET'])
@token_required
def get_machines(current_user):
    machines = Machine.query.all()
    result = []
    for m in machines:
        result.append({
            'id': m.id,
            'name': m.name,
            'status': m.status
        })
    return jsonify({'status': 'success', 'data': {'machines': result}})

@machines_bp.route('/<id>/status', methods=['PATCH'])
@token_required
@admin_required
def update_machine_status(current_user, id):
    if not request.is_json:
        return jsonify({'status': 'error', 'message': 'Request must be JSON.'}), 400
        
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'message': 'Empty request.'}), 400
    status = data.get('status')
    
    if not status or status not in ['FREE', 'IN_USE', 'OUT_OF_SERVICE']:
        return jsonify({'status': 'error', 'message': 'Invalid status.'}), 400
        
    machine = Machine.query.get(id)
    if not machine:
        return jsonify({'status': 'error', 'message': 'Machine not found.'}), 404
        
    try:
        machine.status = status
        db.session.commit()
        logger.info(f"Machine {id} status updated to {status}")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to update machine status due to DB error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'An error occurred while updating machine status.'}), 500
    
    return jsonify({'status': 'success', 'message': 'Machine status updated.'})
