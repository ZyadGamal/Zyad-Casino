from __future__ import absolute_import
import os
from celery import Celery
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    logger.debug(f'Executing task: {self.request.id}')

@app.task
def send_telegram_notification(message, chat_id=None):
    import requests
    chat_id = chat_id or settings.ADMIN_CHAT_ID
    
    try:
        response = requests.post(
            f'https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': message,
                'parse_mode': 'HTML'
            }
        )
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f'Failed to send Telegram notification: {str(e)}')
        return False