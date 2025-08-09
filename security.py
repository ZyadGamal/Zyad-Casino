import re
from flask import request, g
from datetime import datetime, timedelta
import logging
from functools import wraps

# قائمة سوداء لـ IPs (يمكن استبدالها بقاعدة بيانات)
IP_BLACKLIST = {
    '123.456.789.1': 'Known attacker',
    '987.654.321.0': 'DDoS source'
}

# أنماط هجوم معروفة
ATTACK_PATTERNS = {
    'sql_injection': r"([';]+\s*--|/\*.*\*/|union\s+select)",
    'xss': r"(<script|javascript:)",
    'path_traversal': r"(\.\./|\.\\|~/|etc/passwd)"
}

def get_blacklisted_ips():
    """الحصول على القائمة السوداء لـ IPs (يمكن جلبها من قاعدة بيانات)"""
    return IP_BLACKLIST

def is_malicious_input(input_str):
    """الكشف عن محاولات اختراق في المدخلات"""
    if not isinstance(input_str, str):
        return False
        
    input_str = input_str.lower()
    for pattern in ATTACK_PATTERNS.values():
        if re.search(pattern, input_str, re.IGNORECASE):
            return True
    return False

def log_security_event(event_type, details):
    """تسجيل الأحداث الأمنية"""
    logging.warning(f"SECURITY EVENT [{event_type}]: {details} - IP: {request.remote_addr}")

def rate_limit_by_user():
    """تحديد معدل الطلبات حسب المستخدم (لحماية API)"""
    user_id = getattr(g, 'user_id', None)
    if user_id:
        return f"user:{user_id}"
    return get_remote_address()

def validate_game_result(game_id, user_id, result):
    """التحقق من سلامة نتائج الألعاب"""
    # هنا يمكنك إضافة منطق التحقق من:
    # - تطابق النتائج مع الخوارزمية
    # - عدم التلاعب في القيم
    # - التسلسل الزمني للطلبات
    return True

def fraud_detection_middleware(f):
    """ميدلوير للكشف عن التلاعب"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # تحليل User-Agent
        user_agent = request.headers.get('User-Agent', '').lower()
        suspicious_agents = ['curl', 'wget', 'sqlmap', 'hydra']
        if any(agent in user_agent for agent in suspicious_agents):
            log_security_event('SUSPICIOUS_USER_AGENT', user_agent)
            return {'error': 'Access denied'}, 403

        # تحليل IP
        if request.remote_addr in get_blacklisted_ips():
            log_security_event('BLACKLISTED_IP', request.remote_addr)
            return {'error': 'IP blocked'}, 403

        return f(*args, **kwargs)
    return decorated_function

def generate_anti_cheat_token(user_id):
    """إنشاء توكن لمنع الغش في الألعاب"""
    # يمكن استخدام JWT أو آلية مشفرة أخرى
    return f"secure-token-{user_id}-{datetime.now().timestamp()}"

def verify_anti_cheat_token(token, user_id):
    """التحقق من صحة التوكن"""
    try:
        parts = token.split('-')
        if len(parts) != 4:
            return False
        return parts[2] == str(user_id)
    except:
        return False