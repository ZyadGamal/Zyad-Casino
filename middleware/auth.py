from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user import User

def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        if not current_user:
            return jsonify({
                "status": False,
                "message": "المستخدم غير موجود",
                "code": 401
            }), 401
        return fn(*args, **kwargs)
    return wrapper

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        if not current_user or not current_user.is_admin:
            return jsonify({
                "status": False,
                "message": "غير مصرح بالوصول",
                "code": 403
            }), 403
        return fn(*args, **kwargs)
    return wrapper