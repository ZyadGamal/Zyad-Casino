import os
from pathlib import Path
from datetime import timedelta
import dj_database_url

# الإعدادات الأساسية
DEBUG = os.getenv('DEBUG', 'True') == 'True'
SECRET_KEY = os.getenv('SECRET_KEY', 'zyadzz')
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,0.0.0.0').split(',')
BASE_DIR = Path(__file__).resolve().parent.parent

# قاعدة البيانات
DATABASES = {
    'default': dj_database_url.parse(
        os.getenv('DATABASE_URL', 'postgresql://postgres:zyadzz@localhost:5432/zyadcasino'),
        conn_max_age=600
    )
}

# إعدادات الأمان
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 3600 if not DEBUG else 0

# إعدادات JWT
JWT_AUTH = {
    'JWT_SECRET_KEY': os.getenv('JWT_SECRET'),
    'JWT_ALGORITHM': 'HS256',
    'JWT_EXPIRATION_DELTA': timedelta(days=7),
    'JWT_REFRESH_EXPIRATION_DELTA': timedelta(days=30),
}

# إعدادات الدفع
PAYPAL_CLIENT_ID = os.getenv('PAYPAL_CLIENT_ID')
VODAFONE_CASH_MERCHANT_ID = os.getenv('VODAFONE_MERCHANT_ID')

# إعدادات API
RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY')
SPORTS_API_URL = 'https://api-football-v1.p.rapidapi.com/v3/'

# إعدادات Telegram
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
ADMIN_CHAT_ID = os.getenv('ADMIN_CHAT_ID')

# التطبيقات المثبتة
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'drf_yasg',
    'accounts',
    'payments',
    'games',
    'sports',
    'notifications',
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://zyadcasino.com",
]

# ملفات Static
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# ملفات Media
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# القوالب
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Internationalization
LANGUAGE_CODE = 'ar'
TIME_ZONE = 'Africa/Cairo'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# ملفات Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'level': 'DEBUG' if DEBUG else 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'debug.log'),
        },
        'telegram': {
            'level': 'ERROR',
            'class': 'notifications.handlers.TelegramLogHandler',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'DEBUG' if DEBUG else 'INFO',
    },
}