from flask import Blueprint, request, jsonify
from models import Booking, Machine, User
from database import db
from decorators import token_required
import random
import string
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('', methods=['GET'])
@token_required
def get_bookings(current_user):
    # Fix N+1 Query by joining User table
    bookings_with_users = db.session.query(Booking, User).join(User, Booking.userUsn == User.usn).all()
    
    result = []
    for b, u in bookings_with_users:
        result.append({
            'id': b.id,
            'machineId': b.machineId,
            'userUsn': b.userUsn,
            'userName': u.name,
            'date': b.date,
            'slot': b.slot,
            'status': b.status,
            'createdAt': int(b.createdAt.timestamp() * 1000) if b.createdAt else 0
        })
    return jsonify({'status': 'success', 'data': {'bookings': result}})

@bookings_bp.route('', methods=['POST'])
@token_required
def create_booking(current_user):
    if not request.is_json:
        return jsonify({'status': 'error', 'message': 'Request must be JSON.'}), 400
        
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'message': 'Empty request.'}), 400
        
    machine_id = data.get('machineId')
    date = data.get('date')
    slot = data.get('slot')
    
    if not machine_id or not date or not slot:
        return jsonify({'status': 'error', 'message': 'Missing required fields.'}), 400
        
    # Validate date format YYYY-MM-DD
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({'status': 'error', 'message': 'Invalid date format. Expected YYYY-MM-DD.'}), 400
        
    # Validate date is today
    today = datetime.now().date().isoformat()
    if date != today:
        logger.warning(f"Booking failed: User attempted to book for {date}, today is {today}")
        return jsonify({'status': 'error', 'message': 'Bookings are only allowed for today.'}), 400
        
    user_usn = current_user.get('usn') if isinstance(current_user, dict) else current_user.usn
    
    booking_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=7))
    
    # Use database transaction for concurrency
    try:
        machine = Machine.query.get(machine_id)
        if not machine or machine.status == 'OUT_OF_SERVICE':
            return jsonify({'status': 'error', 'message': 'Machine unavailable.'}), 400
            
        # Check if slot is taken for this machine
        existing_machine_booking = Booking.query.filter_by(machineId=machine_id, date=date, slot=slot).filter(Booking.status.in_(['PENDING', 'CHECKED_IN'])).first()
        if existing_machine_booking:
            logger.warning(f"Booking failed: Machine {machine_id} already booked for {date} {slot}")
            return jsonify({'status': 'error', 'message': 'Slot already booked.'}), 400
            
        # Check if user already has a booking for the same date and slot
        existing_user_booking = Booking.query.filter_by(userUsn=user_usn, date=date, slot=slot).filter(Booking.status.in_(['PENDING', 'CHECKED_IN'])).first()
        if existing_user_booking:
            logger.warning(f"Booking failed: User {user_usn} already has a booking for {date} {slot}")
            return jsonify({'status': 'error', 'message': 'You have already booked a machine for this time slot.'}), 400
            
        booking = Booking(
            id=booking_id,
            machineId=machine_id,
            userUsn=user_usn,
            date=date,
            slot=slot,
            status='PENDING'
        )
        db.session.add(booking)
        db.session.commit()
        logger.info(f"Booking created: {booking_id} for user {user_usn} on machine {machine_id} at {date} {slot}")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Booking failed due to DB error: {str(e)}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'An error occurred while creating the booking.'}), 500
    
    booking_dict = {
        'id': booking.id,
        'machineId': booking.machineId,
        'userUsn': booking.userUsn,
        'date': booking.date,
        'slot': booking.slot,
        'status': booking.status,
        'createdAt': int(booking.createdAt.timestamp() * 1000)
    }
    
    return jsonify({'status': 'success', 'data': {'booking': booking_dict}}), 201

@bookings_bp.route('/<id>/check-in', methods=['POST'])
@token_required
def check_in(current_user, id):
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({'status': 'error', 'message': 'Booking not found.'}), 404
        
    user_usn = current_user.get('usn') if isinstance(current_user, dict) else current_user.usn
    if booking.userUsn != user_usn:
        return jsonify({'status': 'error', 'message': 'Unauthorized.'}), 403
        
    booking.status = 'CHECKED_IN'
    
    machine = Machine.query.get(booking.machineId)
    if machine:
        machine.status = 'IN_USE'
        
    try:
        db.session.commit()
        logger.info(f"Booking {id} checked in. Machine {machine.id} is now IN_USE.")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Check-in failed due to DB error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'An error occurred during check-in.'}), 500
    return jsonify({'status': 'success', 'message': 'Checked in successfully.'})

@bookings_bp.route('/<id>/cancel', methods=['DELETE'])
@token_required
def cancel_booking(current_user, id):
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({'status': 'error', 'message': 'Booking not found.'}), 404
        
    user_usn = current_user.get('usn') if isinstance(current_user, dict) else current_user.usn
    if booking.userUsn != user_usn:
        return jsonify({'status': 'error', 'message': 'Unauthorized.'}), 403
        
    if booking.status == 'CHECKED_IN':
        booking.status = 'COMPLETED'
        machine = Machine.query.get(booking.machineId)
        if machine:
            machine.status = 'FREE'
    else:
        booking.status = 'CANCELLED'
        
    try:
        db.session.commit()
        logger.info(f"Booking {id} cancelled/completed.")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Cancellation failed due to DB error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'An error occurred during cancellation.'}), 500
    return jsonify({'status': 'success', 'message': 'Booking cancelled/completed.'})
