from flask import request, g
from functools import wraps

def security_headers(f):
    """Middleware to add security headers to responses"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = f(*args, **kwargs)
        
        # Add security headers
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = "geolocation 'none'; camera 'none'"
        
        # CSP Header (adjust as needed)
        csp = (
            "default-src 'self'; "
            "script-src 'self' https://cdn.jsdelivr.net; "
            "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; "
            "img-src 'self' data: https://*.stripe.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "connect-src 'self' https://api.stripe.com; "
            "frame-src 'self' https://js.stripe.com"
        )
        response.headers['Content-Security-Policy'] = csp
        
        return response
    return decorated_function

def log_request_info():
    """Log request information for security analysis"""
    g.request_start_time = time.time()
    g.request_ip = request.remote_addr
    g.user_agent = request.headers.get('User-Agent')
    
    # Add to security log if user is authenticated
    if hasattr(g, 'user'):
        from models.security import SecurityLog
        log = SecurityLog(
            user_id=g.user.id,
            action='request',
            ip_address=g.request_ip,
            user_agent=g.user_agent,
            status='success',
            details={
                'method': request.method,
                'path': request.path,
                'params': dict(request.args)
            }
        )
        db.session.add(log)
        db.session.commit()