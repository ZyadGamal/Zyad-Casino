from flask_socketio import emit, join_room
from flask import request
from models.user import User
from models.notification import Notification
from extensions import socketio, db

def init_realtime_events():
    """Initialize all realtime event handlers"""
    
    @socketio.on('connect')
    def handle_connect():
        """Handle new client connection"""
        user_id = request.args.get('user_id')
        token = request.args.get('token')
        
        if user_id and token:
            # Verify token (simplified example)
            user = User.query.get(user_id)
            if user and user.verify_ws_token(token):
                join_room(f'user_{user_id}')
                if user.is_admin:
                    join_room('admin_room')
                emit('connection_established', {'status': 'success'})
            else:
                emit('connection_error', {'message': 'Invalid credentials'})
                return False
        else:
            emit('connection_error', {'message': 'Missing credentials'})
            return False

    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnect"""
        user_id = request.args.get('user_id')
        if user_id:
            emit('user_disconnected', {'user_id': user_id}, room='admin_room')

    @socketio.on('admin_message')
    def handle_admin_message(data):
        """Handle admin broadcast messages"""
        user_id = request.args.get('user_id')
        user = User.query.get(user_id)
        
        if user and user.is_admin:
            message = data.get('message')
            if message:
                emit('admin_broadcast', {
                    'message': message,
                    'from': user.username,
                    'timestamp': datetime.utcnow().isoformat()
                }, room='admin_room')

def send_user_notification(user_id, message, notification_type='info'):
    """Send realtime notification to a specific user"""
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
        'timestamp': notification.created_at.isoformat()
    }, room=f'user_{user_id}')

def broadcast_admin_alert(message, severity='warning'):
    """Broadcast alert to all admin users"""
    socketio.emit('admin_alert', {
        'message': message,
        'severity': severity,
        'timestamp': datetime.utcnow().isoformat()
    }, room='admin_room')