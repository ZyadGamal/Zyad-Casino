import psutil
import platform
from threading import Thread
from time import sleep
from datetime import datetime
from flask import current_app
from models.server_metrics import ServerMetrics
from extensions import db

class AutoScaler:
    def __init__(self, app):
        self.app = app
        self.scaling_enabled = True
        self.metrics_interval = 60  # seconds
        self.scaling_thresholds = {
            'cpu': 80,    # %
            'memory': 75, # %
            'requests': 1000  # requests per minute
        }
        self.server_info = {
            'os': platform.system(),
            'cores': psutil.cpu_count(),
            'total_memory': round(psutil.virtual_memory().total / (1024**3),  # GB
        }

    def start(self):
        """Start performance monitoring thread"""
        if not current_app.config.get('TESTING'):
            monitor_thread = Thread(target=self._monitor_performance)
            monitor_thread.daemon = True
            monitor_thread.start()
            current_app.logger.info("AutoScaler started")

    def _monitor_performance(self):
        """Continuous performance monitoring"""
        while self.scaling_enabled:
            try:
                metrics = self._collect_metrics()
                self._store_metrics(metrics)
                
                if self._needs_scaling(metrics):
                    self._scale_resources(metrics)
                
                sleep(self.metrics_interval)
            except Exception as e:
                current_app.logger.error(f"AutoScaler error: {str(e)}")
                sleep(10)  # Wait before retrying

    def _collect_metrics(self):
        """Collect system performance metrics"""
        return {
            'cpu': psutil.cpu_percent(interval=1),
            'memory': psutil.virtual_memory().percent,
            'requests': self._get_current_requests(),
            'timestamp': datetime.utcnow(),
            'disk': psutil.disk_usage('/').percent,
            'network': psutil.net_io_counters().bytes_sent + 
                      psutil.net_io_counters().bytes_recv
        }

    def _get_current_requests(self):
        """Get current request count from Redis"""
        try:
            from extensions import redis_store
            return int(redis_store.get('current_requests') or 0)
        except:
            return 0

    def _store_metrics(self, metrics):
        """Store metrics in database"""
        try:
            record = ServerMetrics(
                cpu=metrics['cpu'],
                memory=metrics['memory'],
                requests=metrics['requests'],
                disk=metrics['disk'],
                network=metrics['network']
            )
            db.session.add(record)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to store metrics: {str(e)}")

    def _needs_scaling(self, metrics):
        """Check if scaling is needed"""
        return (metrics['cpu'] > self.scaling_thresholds['cpu'] or
                metrics['memory'] > self.scaling_thresholds['memory'] or
                metrics['requests'] > self.scaling_thresholds['requests'])

    def _scale_resources(self, metrics):
        """Execute scaling actions"""
        current_app.logger.warning(
            f"High load detected! CPU: {metrics['cpu']}%, "
            f"Memory: {metrics['memory']}%, "
            f"Requests: {metrics['requests']}"
        )
        
        # 1. Adjust rate limiting
        self._adjust_rate_limiting(metrics)
        
        # 2. Send alert to admin
        self._send_admin_alert(metrics)
        
        # 3. Scale horizontally if needed
        if metrics['requests'] > self.scaling_thresholds['requests']:
            self._scale_horizontally()

    def _adjust_rate_limiting(self, metrics):
        """Dynamically adjust rate limiting"""
        from extensions import limiter
        if metrics['cpu'] > 90 or metrics['memory'] > 85:
            limiter.limit("100 per minute")
            current_app.logger.info("Strict rate limiting applied")

    def _send_admin_alert(self, metrics):
        """Send alert to admin dashboard"""
        from realtime.events import broadcast_admin_alert
        message = (
            f"High server load detected\n"
            f"CPU: {metrics['cpu']}%\n"
            f"Memory: {metrics['memory']}%\n"
            f"Requests: {metrics['requests']}"
        )
        broadcast_admin_alert(message, severity='critical')

    def _scale_horizontally(self):
        """Spin up additional worker instances"""
        try:
            from tasks.backup_tasks import spin_up_worker
            spin_up_worker.delay()
            current_app.logger.info("Initiated horizontal scaling")
        except Exception as e:
            current_app.logger.error(f"Failed to scale horizontally: {str(e)}")