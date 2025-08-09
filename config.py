import os
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv()

class Config:
    # إعدادات الأمان
    SECURITY_LOG_FILE = 'logs/security.log'
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_TIME = 15  # دقائق
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///zyadcasino.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    # إعدادات الأمان
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-change-me")
    
    # إعدادات التلجرام
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID")
    
    # إعدادات API
    RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
    
    # إعدادات التطبيق
    DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    host = os.getenv('host', '127.0.0.1')
    port = int(os.getenv('port', 5000))


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True  # لطباعة استعلامات SQL في وضع التطوير


class ProductionConfig(Config):
    SESSION_COOKIE_DOMAIN = '.yourdomain.com'
    PREFERRED_URL_SCHEME = 'https'
    SERVER_NAME = 'api.yourdomain.com'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    DEBUG = False
    PROPAGATE_EXCEPTIONS = True  # لإظهار الأخطاء في السجلات دون تفاصيل للمستخدمين


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'