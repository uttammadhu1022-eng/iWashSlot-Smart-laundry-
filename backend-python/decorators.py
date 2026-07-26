from functools import wraps
from flask import request, jsonify
import jwt
import os
import time
import logging

logger = logging.getLogger(__name__)

# Security: Ensure JWT_SECRET is loaded from env. Warn if using fallback in production.
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    logger.warning("WARNING: JWT_SECRET environment variable not set! Using default secret. DO NOT use in production.")
    JWT_SECRET = 'supersecret_for_dev'

# Simple In-Memory Rate Limiter (IP based)
RATE_LIMIT_WINDOW = 60 # seconds
RATE_LIMIT_MAX_REQUESTS = 5

ip_requests = {}

def rate_limit(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        client_ip = request.remote_addr
        current_time = time.time()
        
        # Clean up old requests
        if client_ip in ip_requests:
            ip_requests[client_ip] = [req_time for req_time in ip_requests[client_ip] if current_time - req_time < RATE_LIMIT_WINDOW]
        else:
            ip_requests[client_ip] = []
            
        if len(ip_requests[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
            logger.warning(f"Rate limit exceeded for IP {client_ip}")
            return jsonify({'status': 'error', 'message': 'Too many requests. Please try again later.'}), 429
            
        ip_requests[client_ip].append(current_time)
        return f(*args, **kwargs)
    return decorated

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
                
        if not token:
            return jsonify({'status': 'error', 'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'status': 'error', 'message': 'Token has expired!'}), 401
        except Exception as e:
            return jsonify({'status': 'error', 'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        role = current_user.get('role') if isinstance(current_user, dict) else getattr(current_user, 'role', None)
        if role != 'ADMIN':
            return jsonify({'status': 'error', 'message': 'Unauthorized: Admin access required.'}), 403
        return f(current_user, *args, **kwargs)
    return decorated
