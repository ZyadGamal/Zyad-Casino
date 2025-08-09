from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from redis import Redis
from celery import Celery

# Database
db = SQLAlchemy()
migrate = Migrate()

# Security
bcrypt = Bcrypt()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address, storage_uri="redis://localhost:6379/0")
talisman = Talisman()

# Realtime
socketio = SocketIO(cors_allowed_origins=[])

# Redis
redis_store = Redis(host='localhost', port=6379, db=0)

# Celery
celery = Celery(__name__, broker='redis://localhost:6379/1')

def init_extensions(app):
    """Initialize all extensions with the app"""
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    talisman.init_app(app)
    socketio.init_app(app)
    
    # Configure Celery
    celery.conf.update(app.config)
    
    # Register realtime events
    from realtime.events import init_realtime_events
    init_realtime_events()