from datetime import datetime, timedelta
from models.base import db, BaseModel
from sqlalchemy import event, and_

class SecurityLog(BaseModel):
    __tablename__ = 'security_logs'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(50))  # login_attempt/password_change/etc
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.Text)
    status = db.Column(db.String(20))  # success/failed/suspicious
    details = db.Column(db.JSON)
    severity = db.Column(db.String(20), default='low')  # low/medium/high/critical
    resolved = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref='security_logs')

    def __repr__(self):
        return f'<SecurityLog {self.action} - {self.status}>'

class SuspiciousActivity(BaseModel):
    __tablename__ = 'suspicious_activities'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    activity_type = db.Column(db.String(50))  # brute_force/unusual_location/etc
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.Text)
    severity = db.Column(db.String(20), default='medium')
    details = db.Column(db.JSON)
    resolved = db.Column(db.Boolean, default=False)
    resolved_at = db.Column(db.DateTime, nullable=True)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    user = db.relationship('User', foreign_keys=[user_id], backref='suspicious_activities')
    resolver = db.relationship('User', foreign_keys=[resolved_by])

    def resolve(self, resolved_by_user):
        self.resolved = True
        self.resolved_at = datetime.utcnow()
        self.resolved_by = resolved_by_user.id
        db.session.commit()

class IPBlacklist(BaseModel):
    __tablename__ = 'ip_blacklist'
    
    ip_address = db.Column(db.String(50), unique=True)
    reason = db.Column(db.String(255))
    banned_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    expires_at = db.Column(db.DateTime, nullable=True)  # None for permanent ban
    
    banned_by_user = db.relationship('User', backref='banned_ips')

class UserSecurityProfile(BaseModel):
    __tablename__ = 'user_security_profiles'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    last_password_change = db.Column(db.DateTime)
    failed_login_attempts = db.Column(db.Integer, default=0)
    last_failed_login = db.Column(db.DateTime, nullable=True)
    two_factor_enabled = db.Column(db.Boolean, default=False)
    security_questions = db.Column(db.JSON)  # {question1: answer1, ...}
    
    user = db.relationship('User', backref='security_profile')

# Event listeners for security logging
@event.listens_for(db.session, 'before_flush')
def check_suspicious_activity(session, flush_context, instances):
    for instance in session.new:
        if isinstance(instance, SecurityLog) and instance.status == 'failed':
            # Check for multiple failed attempts
            if instance.action == 'login_attempt':
                failed_attempts = session.query(SecurityLog).filter(
                    and_(
                        SecurityLog.user_id == instance.user_id,
                        SecurityLog.action == 'login_attempt',
                        SecurityLog.status == 'failed',
                        SecurityLog.created_at >= datetime.utcnow() - timedelta(minutes=15)
                    )
                ).count()
                
                if failed_attempts >= 5:
                    suspicious = SuspiciousActivity(
                        user_id=instance.user_id,
                        activity_type='brute_force',
                        ip_address=instance.ip_address,
                        user_agent=instance.user_agent,
                        severity='high',
                        details={
                            'attempts': failed_attempts,
                            'time_window': '15 minutes'
                        }
                    )
                    session.add(suspicious)
                    instance.severity = 'high'  # Update the log severity