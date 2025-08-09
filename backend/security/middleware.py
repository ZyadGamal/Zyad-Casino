from django.http import HttpResponseForbidden
from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # إضافة رؤوس الأمان
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        
        if not request.path.startswith('/admin/'):
            response['Content-Security-Policy'] = "default-src 'self'"
        
        return response

class IPWhitelistMiddleware(MiddlewareMixin):
    def process_request(self, request):
        allowed_ips = ['127.0.0.1', '0.0.0.0']
        client_ip = request.META.get('REMOTE_ADDR')
        
        if client_ip not in allowed_ips and not any(
            request.path.startswith(path) for path in ['/api/', '/static/', '/media/']
        ):
            logger.warning(f'Attempted access from unauthorized IP: {client_ip}')
            return HttpResponseForbidden()
        
        return None