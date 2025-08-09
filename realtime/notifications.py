from flask_socketio import SocketIO, emit, join_room
from flask import request
from models.user import User
from extensions import socketio, db

@socketio.on('connect')
def handle_connect():
    """معالجة اتصال العميل الجديد"""
    user_id = request.args.get('user_id')
    if user_id:
        join_room(f'user_{user_id}')
        emit('connection_status', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """معالجة انفصال العميل"""
    user_id = request.args.get('user_id')
    if user_id:
        emit('connection_status', {'status': 'disconnected'}, room=f'user_{user_id}')

def send_notification(user_id, message, notification_type='info'):
    """إرسال إشعار إلى مستخدم معين"""
    notification = Notification(
        user_id=user_id,
        message=message,
        notification_type=notification_type
    )
    db.session.add(notification)
    db.session.commit()
    
    socketio.emit('new_notification', {
        'id': notification.id,
        'message': message,
        'type': notification_type,
        'timestamp': notification.timestamp.isoformat()
    }, room=f'user_{user_id}')

def broadcast_admin_alert(message, severity='warning'):
    """بث تنبيه إلى جميع المشرفين"""
    socketio.emit('admin_alert', {
        'message': message,
        'severity': severity,
        'timestamp': datetime.utcnow().isoformat()
    }, room='admin_room')