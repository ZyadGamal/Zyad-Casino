import os
import requests
from flask import current_app
from datetime import datetime
from models.base import db
from models.logs import NotificationLog
from typing import Optional, Dict, Any

class TelegramNotifier:
    def __init__(self):
        self._token = None
        self._chat_id = None

    @property
    def config_ready(self) -> bool:
        """تحقق من توفر إعدادات التلغرام"""
        self._load_config()
        return all([self._token, self._chat_id])

    def _load_config(self):
        """تحميل الإعدادات من التطبيق أو متغيرات البيئة"""
        if not self._token:
            try:
                self._token = current_app.config.get('TELEGRAM_BOT_TOKEN')
            except RuntimeError:
                self._token = os.getenv("TELEGRAM_BOT_TOKEN")

        if not self._chat_id:
            try:
                self._chat_id = current_app.config.get('TELEGRAM_CHAT_ID')
            except RuntimeError:
                self._chat_id = os.getenv("TELEGRAM_CHAT_ID")

    def _send_telegram_message(self, message: str) -> bool:
        """إرسال الرسالة فعليًا عبر API التلغرام"""
        url = f"https://api.telegram.org/bot{self._token}/sendMessage"
        payload = {
            "chat_id": self._chat_id,
            "text": message,
            "parse_mode": "Markdown",
            "disable_web_page_preview": True
        }

        try:
            response = requests.post(
                url,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"فشل إرسال رسالة التلغرام: {str(e)}")
            return False

    def _create_notification_log(
        self,
        user_id: int,
        message: str,
        status: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """إنشاء سجل للإشعار في قاعدة البيانات"""
        try:
            notification = NotificationLog(
                user_id=user_id,
                title="Telegram Notification",
                message=message,
                notification_type="telegram",
                status=status,
                notification_metadata=metadata or {},
                is_read=False
            )
            db.session.add(notification)
            db.session.commit()
            return True
        except Exception as e:
            current_app.logger.error(f"فشل إنشاء سجل الإشعار: {str(e)}")
            db.session.rollback()
            return False

    def notify_admin(
        self,
        message: str,
        user_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        إرسال إشعار للمسؤول عبر التلغرام مع التسجيل في قاعدة البيانات
        
        Args:
            message: نص الرسالة المراد إرسالها
            user_id: معرف المستخدم المرتبط بالإشعار (اختياري)
            metadata: بيانات إضافية لتخزينها (اختياري)
        
        Returns:
            bool: True إذا نجح الإرسال والتسجيل، False إذا فشل
        """
        if not self.config_ready:
            current_app.logger.error("إعدادات التلغرام غير مكتملة")
            return False

        # إرسال الرسالة عبر التلغرام
        send_status = self._send_telegram_message(message)
        
        # تحديد حالة الإشعار
        status = "sent" if send_status else "failed"
        
        # تسجيل الإشعار في قاعدة البيانات
        log_status = self._create_notification_log(
            user_id=user_id or 0,  # 0 للنظام إذا لم يكن مرتبطًا بمستخدم
            message=message,
            status=status,
            metadata=metadata
        )
        
        return all([send_status, log_status])

# إنشاء نسخة عامة للاستخدام
telegram_notifier = TelegramNotifier()

# دالة الاختصار للتوافق مع الكود القديم
def notify_admin(message: str, user_id: Optional[int] = None) -> bool:
    """واجهة مختصرة للتوافق مع الإصدارات السابقة"""
    return telegram_notifier.notify_admin(message, user_id)