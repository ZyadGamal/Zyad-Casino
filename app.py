import os
import re
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from datetime import timedelta
from security.behavior_analysis import UserBehaviorAnalyzer
from scaling.auto_scaler import AutoScaler
import pytz
from middleware.auth import auth_required
from db.backup_manager import BackupManager
from middleware.performance import track_performance

# تحميل متغيرات البيئة
load_dotenv()

def create_app():
    
    # تكوين التطبيق الأساسي
    app = Flask(__name__)

     # تهيئة الأنظمة الجديدة
    app.behavior_analyzer = UserBehaviorAnalyzer()
    app.auto_scaler = AutoScaler(app)
    app.backup_manager = BackupManager(app)

      # بدء الأنظمة الخلفية
    if not app.config['TESTING']:
        app.auto_scaler.start()
        app.backup_manager.start_scheduled_backups()
        
        # تهيئة WebSocket
        from realtime.notifications import socketio
        socketio.init_app(app)
    
    # تهيئة تسجيل الدخول
    configure_app(app)
    configure_logging(app)
    
    # تهيئة قاعدة البيانات
    from models.base import db
    db.init_app(app)
    
    # تهيئة Flask-Migrate
    migrate = Migrate(app, db)
    
    # تهيئة Bcrypt لتشفير كلمات المرور
    bcrypt = Bcrypt(app)
    
    # تهيئة JWT
    configure_jwt(app)
    
    # تسجيل الامتدادات والوحدات
    register_extensions(app)
    register_blueprints(app)
    setup_security_middlewares(app)
    
    # إضافة معالجات للغة العربية
    configure_arabic_support(app)
    
    return app

def configure_app(app):
    """تهيئة إعدادات التطبيق الأساسية"""
    app.config.update(
        # إعدادات الأمان
        SECRET_KEY=os.getenv("SECRET_KEY", os.urandom(32)),
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        PERMANENT_SESSION_LIFETIME=3600,
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB
        
        # إعدادات قاعدة البيانات
        SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL', 'postgresql://postgres:zyadzz@localhost:5432/zyadcasino'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ENGINE_OPTIONS={'pool_pre_ping': True},
        
        # إعدادات JSON
        JSON_AS_ASCII=False,  # دعم الأحرف العربية في JSON
        JSON_SORT_KEYS=False,  # عدم فرز المفاتيح في JSON
        JSONIFY_PRETTYPRINT_REGULAR=True,  # تنسيق JSON بشكل جميل
        JSONIFY_MIMETYPE='application/json; charset=utf-8',  # تعيين نوع MIME لـ JSON
        
        # إعدادات التطبيق
        DEBUG=os.getenv('DEBUG', 'False').lower() == 'true',
        TESTING=os.getenv('TESTING', 'False').lower() == 'true',
        HOST=os.getenv('HOST', '0.0.0.0'),
        PORT=int(os.getenv('PORT', 5000)),
        SSL_ENABLED=os.getenv('SSL_ENABLED', 'False').lower() == 'true',
        SSL_CERT_PATH=os.getenv('SSL_CERT_PATH', 'cert.pem'),
        SSL_KEY_PATH=os.getenv('SSL_KEY_PATH', 'key.pem'),
        ALLOWED_ORIGINS=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(','),
        TIMEZONE=os.getenv('TIMEZONE', 'Asia/Riyadh'),
        
        # إعدادات JWT
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', os.urandom(32)),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=1),
        JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=30),
        JWT_TOKEN_LOCATION=['headers', 'cookies'],
        JWT_COOKIE_SECURE=True,
        JWT_COOKIE_CSRF_PROTECT=True,
        JWT_CSRF_CHECK_FORM=True,
    )
    
    # تعيين المنطقة الزمنية
    try:
        tz = pytz.timezone(app.config['TIMEZONE'])
        os.environ['TZ'] = app.config['TIMEZONE']
    except pytz.exceptions.UnknownTimeZoneError:
        app.logger.warning(f"Invalid timezone {app.config['TIMEZONE']}, defaulting to UTC")
        os.environ['TZ'] = 'UTC'

def configure_jwt(app):
    """تهيئة نظام JWT للمصادقة"""
    jwt = JWTManager(app)
    
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return user.id
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        from models.user import User
        identity = jwt_data["sub"]
        return User.query.filter_by(id=identity).one_or_none()
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({
            "status": False,
            "message": "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى",
            "code": 401
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "status": False,
            "message": "رمز الدخول غير صالح",
            "code": 401
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            "status": False,
            "message": "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
            "code": 401
        }), 401

def register_extensions(app):
    """تسجيل جميع الامتدادات"""
    # CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['ALLOWED_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "supports_credentials": True,
            "max_age": 86400,
        }
    })

    # Talisman للأمان
    configure_talisman(app)
    
    # Rate Limiter
    Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["500 per minute", "50 per second"],
        storage_uri="memory://",
        strategy="fixed-window",
        headers_enabled=True,
    )

def configure_talisman(app):
    """تهيئة Talisman للحماية"""
    csp = {
        "default-src": "'self'",
        "script-src": [
            "'self'", 
            "'unsafe-inline'", 
            "https://cdn.jsdelivr.net",
            "https://code.jquery.com"
        ],
        "style-src": [
            "'self'", 
            "'unsafe-inline'", 
            "https://fonts.googleapis.com",
            "https://cdn.jsdelivr.net"
        ],
        "img-src": [
            "'self'", 
            "data:", 
            "https://*.stripe.com",
            "https://*.googleapis.com"
        ],
        "font-src": [
            "'self'", 
            "https://fonts.gstatic.com",
            "https://cdn.jsdelivr.net"
        ],
        "connect-src": [
            "'self'",
            "https://api.stripe.com"
        ],
        "frame-src": [
            "'self'",
            "https://js.stripe.com"
        ]
    }
    
    Talisman(
        app,
        force_https=app.config['SSL_ENABLED'],
        strict_transport_security=True,
        content_security_policy=csp,
        frame_options="DENY",
        x_content_type_options=True,
        x_xss_protection=True,
        referrer_policy="strict-origin-when-cross-origin",
        feature_policy={
            "geolocation": "'none'",
            "camera": "'none'",
            "microphone": "'none'"
        }
    )

def register_blueprints(app):
    """تسجيل جميع البلوبيرنتات"""
    from modules.wallet import wallet_bp
    from modules.auth import auth_bp
    from modules.admin import admin_bp
    
    app.register_blueprint(wallet_bp, url_prefix='/api/wallet')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

def configure_logging(app):
    """تهيئة نظام التسجيل"""
    if not os.path.exists("logs"):
        os.mkdir("logs")
    
    # تسجيل عام للتطبيق
    file_handler = RotatingFileHandler(
        "logs/zyadcasino.log", 
        maxBytes=1024000, 
        backupCount=10,
        encoding='utf-8'
    )
    file_handler.setFormatter(logging.Formatter(
        "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
    ))
    file_handler.setLevel(logging.INFO)
    
    # إزالة أي معالجات موجودة مسبقًا
    for handler in app.logger.handlers[:]:
        app.logger.removeHandler(handler)
    
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info("Zyad Casino Application Initialized")

def setup_security_middlewares(app):
    """تهيئة وسائط الأمان"""
    # إصلاح البروكسي العكسي
    app.wsgi_app = ProxyFix(
        app.wsgi_app, 
        x_for=1, 
        x_proto=1, 
        x_host=1, 
        x_prefix=1,
        x_port=1
    )
    
    # مراقبة الأداء
    app.before_request(track_performance)
    
    # كشف الاحتيال
    app.before_request(fraud_detection)
    
    # تنظيف المدخلات
    app.before_request(sanitize_inputs)
    
    # معالجات الأخطاء
    register_error_handlers(app)

def fraud_detection():
    """كشف محاولات الاحتيال"""
    if request.endpoint and request.endpoint.startswith("api."):
        check_suspicious_user_agent()
        check_request_payload_size()
        check_suspicious_ips()

def sanitize_inputs():
    """تنظيف المدخلات"""
    validate_request_inputs()

def check_suspicious_user_agent():
    """فحص User-Agent المشبوه"""
    user_agent = request.headers.get("User-Agent", "").lower()
    suspicious_agents = [
        "curl", "wget", "python-requests", 
        "hydra", "sqlmap", "nikto", "metasploit"
    ]
    if any(agent in user_agent for agent in suspicious_agents):
        current_app.logger.warning(
            f"Suspicious User-Agent from {request.remote_addr}: {user_agent}"
        )
        return jsonify({
            "status": False,
            "message": "تم رفض الوصول",
            "code": 403
        }), 403

def check_suspicious_ips():
    """فحص عناوين IP المشبوهة"""
    suspicious_ips = os.getenv('SUSPICIOUS_IPS', '').split(',')
    if request.remote_addr in suspicious_ips:
        current_app.logger.warning(
            f"Suspicious IP detected: {request.remote_addr}"
        )
        return jsonify({
            "status": False,
            "message": "تم رفض الوصول",
            "code": 403
        }), 403

def check_request_payload_size():
    """فحص حجم الطلب"""
    max_size = current_app.config['MAX_CONTENT_LENGTH']
    if len(request.data) > max_size:
        current_app.logger.warning(
            f"Large payload from {request.remote_addr}"
        )
        return jsonify({
            "status": False,
            "message": "حجم البيانات المرسلة كبير جدًا",
            "code": 413
        }), 413

def validate_request_inputs():
    """التحقق من صحة المدخلات"""
    # التحقق من معاملات URL
    for key, value in request.args.items():
        if re.search(r"[\s'\";-]", str(value)):
            current_app.logger.warning(
                f"Possible SQLi attempt in args from {request.remote_addr}: {value}"
            )
            return jsonify({
                "status": False,
                "message": "مدخلات غير صالحة",
                "code": 400
            }), 400

    # التحقق من بيانات JSON
    if request.json:
        for key, value in request.json.items():
            if isinstance(value, str) and re.search(r"[\s'\";-]", value):
                current_app.logger.warning(
                    f"Possible SQLi attempt in JSON from {request.remote_addr}: {value}"
                )
                return jsonify({
                    "status": False,
                    "message": "مدخلات غير صالحة",
                    "code": 400
                }), 400

def register_error_handlers(app):
    """تسجيل معالجات الأخطاء"""
    @app.errorhandler(400)
    def bad_request(error):
        app.logger.error(f"Bad request from {request.remote_addr}: {error}")
        return jsonify({
            "status": False,
            "message": "طلب غير صالح",
            "code": 400
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "status": False,
            "message": "غير مصرح بالوصول",
            "code": 401
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        app.logger.warning(f"Forbidden access from {request.remote_addr}")
        return jsonify({
            "status": False,
            "message": "ممنوع الوصول",
            "code": 403
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": False,
            "message": "الصفحة غير موجودة",
            "code": 404
        }), 404

    @app.errorhandler(413)
    def payload_too_large(error):
        return jsonify({
            "status": False,
            "message": "حجم البيانات كبير جدًا",
            "code": 413
        }), 413

    @app.errorhandler(429)
    def too_many_requests(error):
        return jsonify({
            "status": False,
            "message": "عدد الطلبات كبير جدًا",
            "wait": f"{error.description.split(' ')[-2]} ثانية",
            "code": 429
        }), 429

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Server error: {error}")
        return jsonify({
            "status": False,
            "message": "خطأ داخلي في الخادم",
            "code": 500
        }), 500

def configure_arabic_support(app):
    """تهيئة دعم اللغة العربية"""
    @app.after_request
    def add_charset(response):
        if response.content_type.startswith('application/json'):
            response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response

    @app.context_processor
    def inject_arabic():
        return dict(
            arabic_dir=lambda: 'rtl' if request.accept_languages.best_match(['ar', 'en']) == 'ar' else 'ltr',
            arabic_font=lambda: 'Tahoma, Arial, sans-serif' if request.accept_languages.best_match(['ar', 'en']) == 'ar' else 'Arial, sans-serif'
        )

# تشغيل التطبيق
if __name__ == "__main__":
    app = create_app()
    
    ssl_context = None
    if app.config['SSL_ENABLED']:
        ssl_context = (
            app.config['SSL_CERT_PATH'],
            app.config['SSL_KEY_PATH'],
        )

    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG'],
        ssl_context=ssl_context,
        threaded=True,
    )