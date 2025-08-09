import os
import subprocess
from datetime import datetime
from flask import current_app
from apscheduler.schedulers.background import BackgroundScheduler

class BackupManager:
    def __init__(self, app):
        self.app = app
        self.scheduler = BackgroundScheduler()
        self.backup_dir = app.config.get('BACKUP_DIR', 'backups')
        self.retention_days = app.config.get('BACKUP_RETENTION', 7)
        
        if not os.path.exists(self.backup_dir):
            os.makedirs(self.backup_dir)

    def start_scheduled_backups(self):
        """بدء النسخ الاحتياطي المجدول"""
        # نسخ احتياطي يومي في 2 صباحًا
        self.scheduler.add_job(
            self.create_backup,
            'cron',
            hour=2,
            minute=0,
            args=['daily']
        )
        
        # نسخ احتياطي أسبوعي يوم الأحد
        self.scheduler.add_job(
            self.create_backup,
            'cron',
            day_of_week='sun',
            hour=3,
            args=['weekly']
        )
        
        self.scheduler.start()

    def create_backup(self, backup_type='manual'):
        """إنشاء نسخة احتياطية جديدة"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{backup_type}_backup_{timestamp}.dump"
        filepath = os.path.join(self.backup_dir, filename)
        
        try:
            # نسخ احتياطي لـ PostgreSQL
            db_url = current_app.config['SQLALCHEMY_DATABASE_URI']
            cmd = [
                'pg_dump',
                '-Fc',  # تنسيق مخصص لـ PostgreSQL
                '-f', filepath,
                db_url
            ]
            
            result = subprocess.run(cmd, check=True, capture_output=True)
            
            if result.returncode == 0:
                current_app.logger.info(f"Backup created successfully: {filename}")
                
                # ضغط الملف (اختياري)
                self._compress_backup(filepath)
                
                # تنظيف النسخ القديمة
                self._cleanup_old_backups()
                
                return True
                
        except subprocess.CalledProcessError as e:
            current_app.logger.error(f"Backup failed: {e.stderr}")
            return False

    def _compress_backup(self, filepath):
        """ضغط ملف النسخ الاحتياطي"""
        # يمكن استخدام gzip أو أي أداة أخرى
        pass

    def _cleanup_old_backups(self):
        """حذف النسخ الاحتياطية القديمة"""
        now = datetime.now()
        for filename in os.listdir(self.backup_dir):
            filepath = os.path.join(self.backup_dir, filename)
            file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
            
            if (now - file_time).days > self.retention_days:
                os.remove(filepath)
                current_app.logger.info(f"Deleted old backup: {filename}")

    def restore_backup(self, backup_file):
        """استعادة نسخة احتياطية"""
        try:
            db_url = current_app.config['SQLALCHEMY_DATABASE_URI']
            cmd = [
                'pg_restore',
                '-d', db_url,
                '--clean',
                '--if-exists',
                backup_file
            ]
            
            result = subprocess.run(cmd, check=True, capture_output=True)
            
            if result.returncode == 0:
                current_app.logger.info("Backup restored successfully")
                return True
                
        except subprocess.CalledProcessError as e:
            current_app.logger.error(f"Restore failed: {e.stderr}")
            return False