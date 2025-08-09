import re
from datetime import datetime, timedelta
from flask import current_app, request
from models.user import User
from models.security import SecurityLog, SuspiciousActivity

class SecurityCore:
    @staticmethod
    def is_password_strong(password):
        """Check if password meets security requirements"""
        if len(password) < 10:
            return False
        if not re.search(r'[A-Z]', password):
            return False
        if not re.search(r'[a-z]', password):
            return False
        if not re.search(r'[0-9]', password):
            return False
        if not re.search(r'[^A-Za-z0-9]', password):
            return False
        return True

    @staticmethod
    def check_login_attempt(user, success):
        """Check and log login attempts"""
        log = SecurityLog(
            user_id=user.id if user else None,
            action='login_attempt',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            status='success' if success else 'failed'
        )
        
        db.session.add(log)
        
        if not success and user:
            user.security_profile.failed_login_attempts += 1
            user.security_profile.last_failed_login = datetime.utcnow()
            
            # Check for brute force
            if user.security_profile.failed_login_attempts >= 5:
                SuspiciousActivity.record(
                    user_id=user.id,
                    activity_type='brute_force',
                    ip_address=request.remote_addr,
                    severity='high'
                )
        
        db.session.commit()

    @staticmethod
    def generate_2fa_code():
        """Generate a 6-digit 2FA code"""
        import random
        return str(random.randint(100000, 999999))

    @staticmethod
    def check_request_safety():
        """Check request for potential security issues"""
        # Check for SQLi patterns in query params
        for key, value in request.args.items():
            if re.search(r"[\s'\";-]", str(value)):
                SuspiciousActivity.record(
                    ip_address=request.remote_addr,
                    activity_type='possible_sqli',
                    severity='high',
                    details={
                        'parameter': key,
                        'value': value[:100]  # Truncate to avoid logging large values
                    }
                )
                return False
        
        return True