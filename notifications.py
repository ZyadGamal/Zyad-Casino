import os
import requests
from flask import current_app
from models import db, NotificationLog, ErrorLog
import logging

logger = logging.getLogger(__name__)

def notify_admin(message: str) -> bool:
    """
    إرسال إشعار إلى المدير عبر Telegram وتسجيله في قاعدة البيانات.
    """
    try:
        token = current_app.config.get('TELEGRAM_BOT_TOKEN') or os.getenv('TELEGRAM_BOT_TOKEN')
        chat_id = current_app.config.get('ADMIN_CHAT_ID') or os.getenv('ADMIN_CHAT_ID')

        if not token or not chat_id:
            raise ValueError("TELEGRAM_BOT_TOKEN or ADMIN_CHAT_ID is not set.")

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }

        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()

        db.session.add(NotificationLog(message=message))
        db.session.commit()

        return True

    except Exception as e:
        logger.error(f"Notify admin failed: {e}", exc_info=True)
        try:
            db.session.add(ErrorLog(error_message=str(e)))
            db.session.commit()
        except Exception as log_error:
            logger.critical(f"Failed to log error to database: {log_error}", exc_info=True)
        return False
