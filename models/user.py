from enum import Enum
from datetime import datetime
from models.base import db
from models.base import db, BaseModel
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import JSONB

class UserRole(Enum):
    USER = 'user'
    ADMIN = 'admin'
    MODERATOR = 'moderator'
    SUPPORT = 'support'

class User(BaseModel):
    __tablename__ = 'users'
    
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), unique=True)
    password_hash = db.Column(db.String(128))
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    role = db.Column(db.Enum(UserRole), default=UserRole.USER)
    profile_data = db.Column(JSONB)  # Additional user profile information
    
    wallet = db.relationship('Wallet', back_populates='user', uselist=False, cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', back_populates='user', cascade='all, delete-orphan')
    bets = db.relationship('Bet', back_populates='user', cascade='all, delete-orphan')
    notifications = db.relationship('NotificationLog', back_populates='user', cascade='all, delete-orphan')

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    def has_role(self, required_role):
        return self.role == required_role

    def __repr__(self):
        return f'<User {self.id}: {self.username}>'