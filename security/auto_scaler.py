import psutil
from threading import Thread
from time import sleep
from flask import current_app
from models.server import ServerMetrics

class AutoScaler:
    def __init__(self, app):
        self.app = app
        self.scaling_enabled = True
        self.metrics_interval = 60  # ثانية
        self.scaling_thresholds = {
            'cpu': 80,
            'memory': 75,
            'requests': 1000
        }
        
    def start(self):
        """بدء مراقبة الأداء والتكيف التلقائي"""
        monitor_thread = Thread(target=self._monitor_performance)
        monitor_thread.daemon = True
        monitor_thread.start()

    def _monitor_performance(self):
        """مراقبة أداء الخادم بشكل مستمر"""
        while self.scaling_enabled:
            try:
                metrics = self._collect_metrics()
                self._store_metrics(metrics)
                
                if self._needs_scaling(metrics):
                    self._scale_resources(metrics)
                    
                sleep(self.metrics_interval)
                
            except Exception as e:
                current_app.logger.error(f"Auto-scaling error: {str(e)}")

    def _collect_metrics(self):
        """جمع مقاييس أداء النظام"""
        return {
            'cpu': psutil.cpu_percent(interval=1),
            'memory': psutil.virtual_memory().percent,
            'requests': self._get_current_requests(),
            'timestamp': datetime.utcnow()
        }

    def _get_current_requests(self):
        """الحصول على عدد الطلبات الحالية (يمكن استبداله بآلية مراقبة حقيقية)"""
        from extensions import redis_store
        return redis_store.get('current_requests') or 0

    def _store_metrics(self, metrics):
        """تخزين المقاييس للتحليل التاريخي"""
        record = ServerMetrics(**metrics)
        db.session.add(record)
        db.session.commit()

    def _needs_scaling(self, metrics):
        """تحديد ما إذا كان النظام يحتاج إلى توسيع"""
        return (metrics['cpu'] > self.scaling_thresholds['cpu'] or
                metrics['memory'] > self.scaling_thresholds['memory'] or
                metrics['requests'] > self.scaling_thresholds['requests'])

    def _scale_resources(self, metrics):
        """تنفيذ عملية التوسيع"""
        current_app.logger.info(f"Initiating scaling due to high load: {metrics}")
        
        # 1. زيادة موارد الخادم الحالي (Vertical Scaling)
        self._adjust_server_resources()
        
        # 2. تفعيل خوادم إضافية (Horizontal Scaling)
        if metrics['requests'] > self.scaling_thresholds['requests']:
            self._activate_backup_servers()
        
        # 3. ضبط معدل الحد من الطلبات
        from extensions import limiter
        limiter.enabled = True

    def _adjust_server_resources(self):
        """ضبط موارد الخادم (يتطلب صلاحيات النظام)"""
        # تنفيذ أوامر النظام لضبط الموارد
        pass

    def _activate_backup_servers(self):
        """تفعيل خوادم احتياطية"""
        from tasks import spin_up_server
        spin_up_server.delay('worker')