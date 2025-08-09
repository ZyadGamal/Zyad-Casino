import time
from datetime import datetime, timedelta
from flask import request, current_app
from models.user import User
from models.security import SuspiciousActivity
from extensions import db

class UserBehaviorAnalyzer:
    def __init__(self):
        self.suspicious_patterns = {
            'rapid_requests': {'count': 10, 'timeframe': 60},
            'unusual_hours': {'start': 2, 'end': 6},
            'multiple_accounts': {'threshold': 3}
        }

    def track_user_activity(self, user_id, action):
        """تسجيل نشاط المستخدم وتحليله"""
        try:
            now = datetime.utcnow()
            user = User.query.get(user_id)
            
            # التحقق من الأنماط المشبوهة
            self._check_rapid_requests(user_id, now)
            self._check_unusual_hours(user, now)
            self._check_geolocation(user, request)
            
            # تسجيل النشاط
            activity = UserActivity(
                user_id=user_id,
                action=action,
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent'),
                timestamp=now
            )
            db.session.add(activity)
            db.session.commit()
            
        except Exception as e:
            current_app.logger.error(f"Behavior analysis error: {str(e)}")

    def _check_rapid_requests(self, user_id, timestamp):
        """الكشف عن الطلبات السريعة المتكررة"""
        timeframe = timestamp - timedelta(seconds=self.suspicious_patterns['rapid_requests']['timeframe'])
        recent_activities = UserActivity.query.filter(
            UserActivity.user_id == user_id,
            UserActivity.timestamp >= timeframe
        ).count()
        
        if recent_activities >= self.suspicious_patterns['rapid_requests']['count']:
            self._flag_suspicious_activity(
                user_id=user_id,
                activity_type='rapid_requests',
                severity='high'
            )

    def _check_unusual_hours(self, user, timestamp):
        """الكشف عن النشاط في أوقات غير معتادة"""
        user_tz = pytz.timezone(user.timezone) if user.timezone else pytz.utc
        local_time = timestamp.astimezone(user_tz)
        
        if self.suspicious_patterns['unusual_hours']['start'] <= local_time.hour <= self.suspicious_patterns['unusual_hours']['end']:
            if not user.is_night_owl:  # إذا لم يكن معروفًا عن المستخدم أنه ينشط ليلاً
                self._flag_suspicious_activity(
                    user_id=user.id,
                    activity_type='unusual_hours',
                    severity='medium'
                )

    def _check_geolocation(self, user, request):
        """الكشف عن التغيرات في الموقع الجغرافي"""
        current_ip = request.remote_addr
        if user.last_ip and user.last_ip != current_ip:
            # هنا يمكن إضافة خدمة للتحقق من الموقع الجغرافي للعنوان IP
            self._flag_suspicious_activity(
                user_id=user.id,
                activity_type='ip_change',
                severity='low',
                details=f"From {user.last_ip} to {current_ip}"
            )

    def _flag_suspicious_activity(self, user_id, activity_type, severity, details=None):
        """تسجيل نشاط مشبوه"""
        activity = SuspiciousActivity(
            user_id=user_id,
            activity_type=activity_type,
            severity=severity,
            details=details,
            timestamp=datetime.utcnow()
        )
        db.session.add(activity)
        db.session.commit()
        
        # إرسال تنبيه للمشرف إذا كانت الخطورة عالية
        if severity == 'high':
            from tasks import notify_admin
            notify_admin.delay(
                f"Suspicious activity detected for user {user_id}",
                f"Type: {activity_type}\nDetails: {details}"
            )