from flask import Blueprint, render_template, jsonify, request
from flask_jwt_extended import jwt_required
from middleware.auth import admin_required
from models.user import User
from models.security import SuspiciousActivity
from models.payment import Transaction
from models.system import ServerMetrics
from utils.pagination import Pagination

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/dashboard')
@jwt_required()
@admin_required
def admin_dashboard():
    """لوحة تحكم المشرف"""
    try:
        stats = {
            'total_users': User.query.count(),
            'active_users': User.query.filter_by(is_active=True).count(),
            'suspicious_activities': SuspiciousActivity.query.filter_by(resolved=False).count(),
            'recent_transactions': Transaction.query.order_by(Transaction.timestamp.desc()).limit(10).all(),
            'cpu_usage': ServerMetrics.get_current_cpu_usage(),
            'memory_usage': ServerMetrics.get_current_memory_usage()
        }
        return render_template('admin/dashboard.html', stats=stats)
    except Exception as e:
        current_app.logger.error(f"Dashboard error: {str(e)}")
        return render_template('admin/error.html', message="حدث خطأ في جلب بيانات لوحة التحكم"), 500

@admin_bp.route('/users')
@jwt_required()
@admin_required
def manage_users():
    """إدارة المستخدمين"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = 20
        users = User.query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page)
        return render_template('admin/users.html', users=users)
    except Exception as e:
        current_app.logger.error(f"Users management error: {str(e)}")
        return render_template('admin/error.html', message="حدث خطأ في جلب بيانات المستخدمين"), 500

@admin_bp.route('/security/alerts')
@jwt_required()
@admin_required
def security_alerts():
    """تنبيهات الأمان"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = 20
        alerts = SuspiciousActivity.query.order_by(
            SuspiciousActivity.timestamp.desc()
        ).paginate(page=page, per_page=per_page)
        return render_template('admin/security_alerts.html', alerts=alerts)
    except Exception as e:
        current_app.logger.error(f"Security alerts error: {str(e)}")
        return render_template('admin/error.html', message="حدث خطأ في جلب تنبيهات الأمان"), 500

@admin_bp.route('/system/performance')
@jwt_required()
@admin_required
def system_performance():
    """أداء النظام"""
    try:
        metrics = ServerMetrics.query.order_by(
            ServerMetrics.timestamp.desc()
        ).limit(120).all()
        return render_template('admin/performance.html', metrics=metrics)
    except Exception as e:
        current_app.logger.error(f"System performance error: {str(e)}")
        return render_template('admin/error.html', message="حدث خطأ في جلب بيانات الأداء"), 500