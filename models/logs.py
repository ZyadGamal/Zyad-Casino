from datetime import datetime
from models.base import db, BaseModel
from sqlalchemy.dialects.postgresql import JSONB

class NotificationLog(BaseModel):
    __tablename__ = "notification_logs"
    
    # الحقول من النموذج الأول
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    notification_type = db.Column(db.String(50), nullable=False)
    notification_metadata = db.Column(JSONB)
    
    # الحقول المضافة من النموذج الثاني
    status = db.Column(db.String(20), default='sent')
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # العلاقات
    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic'))

    def mark_as_read(self):
        """وضع علامة قراءة على الإشعار"""
        self.is_read = True
        return self.save()

    def __repr__(self):
        return f'<NotificationLog {self.id} - {self.notification_type}>'

    # دالة مساعدة جديدة
    @classmethod
    def create_notification(cls, user_id, title, message, notification_type, metadata=None):
        """إنشاء إشعار جديد"""
        notification = cls(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            notification_metadata=metadata or {},
            status='pending'
        )
        return notification.save()