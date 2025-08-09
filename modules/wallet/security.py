from models.base import db, BaseModel
import logging

class SecurityLog(BaseModel):
    __tablename__ = 'security_logs'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(50))  # login_attempt/password_change/etc
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.Text)
    status = db.Column(db.String(20))  # success/failed
    details = db.Column(db.JSON)
    
    user = db.relationship('User', backref='security_logs')

    def __repr__(self):
        return f'<SecurityLog {self.action} - {self.status}>'

def setup_security_logging():
    """تهيئة نظام تسجيل أحداث الأمان"""
    security_logger = logging.getLogger('security')
    security_logger.setLevel(logging.WARNING)
    
    handler = logging.FileHandler('security.log')
    handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    
    security_logger.addHandler(handler)