from datetime import datetime
from models.base import db, BaseModel

class FingerprintLog(BaseModel):
    __tablename__ = 'fingerprint_logs'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    fingerprint = db.Column(db.String(255), nullable=False, index=True)
    ip_address = db.Column(db.String(100), nullable=False)
    user_agent = db.Column(db.Text, nullable=False)
    device_info = db.Column(db.JSON)
    location = db.Column(db.String(100))
    is_vpn = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref=db.backref('fingerprints', lazy='dynamic', cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<FingerprintLog {self.id} - User {self.user_id}>'