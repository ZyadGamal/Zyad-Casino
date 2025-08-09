from celery import Celery
from datetime import datetime
import subprocess
import os
from extensions import db
from models.backup import Backup
from flask import current_app

celery = Celery(__name__, broker='redis://localhost:6379/0')

@celery.task
def create_database_backup(backup_type='scheduled'):
    """Celery task for creating database backups"""
    try:
        backup_dir = current_app.config['BACKUP_DIR']
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{backup_type}_backup_{timestamp}.dump"
        filepath = os.path.join(backup_dir, filename)
        
        # Create backup directory if not exists
        os.makedirs(backup_dir, exist_ok=True)
        
        # PostgreSQL backup command
        db_url = current_app.config['SQLALCHEMY_DATABASE_URI']
        cmd = [
            'pg_dump',
            '-Fc',
            '-f', filepath,
            db_url
        ]
        
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            # Record backup in database
            backup = Backup(
                filename=filename,
                path=filepath,
                backup_type=backup_type,
                size=os.path.getsize(filepath)
            )
            db.session.add(backup)
            db.session.commit()
            
            return {
                'status': 'success',
                'filename': filename,
                'path': filepath,
                'size': backup.size
            }
    
    except subprocess.CalledProcessError as e:
        current_app.logger.error(f"Backup failed: {e.stderr}")
        return {
            'status': 'error',
            'message': e.stderr
        }
    
    except Exception as e:
        current_app.logger.error(f"Backup error: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }

@celery.task
def spin_up_worker():
    """Spin up additional worker instance"""
    try:
        # This would use your deployment system (Docker, Kubernetes, etc.)
        # Example for Docker:
        subprocess.run([
            'docker', 'run', '-d',
            '--env', 'APP_MODE=worker',
            'your-app-image'
        ], check=True)
        return {'status': 'success'}
    except Exception as e:
        current_app.logger.error(f"Failed to spin up worker: {str(e)}")
        return {'status': 'error', 'message': str(e)}