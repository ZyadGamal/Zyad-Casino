class RealtimeClient {
    constructor(userId, token) {
        this.userId = userId;
        this.token = token;
        this.socket = null;
        this.connect();
    }

    connect() {
        // Connect to WebSocket server
        this.socket = io(window.location.origin, {
            query: {
                user_id: this.userId,
                token: this.token
            },
            transports: ['websocket']
        });

        // Setup event handlers
        this.socket.on('connect', () => {
            console.log('Connected to realtime server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from realtime server');
        });

        this.socket.on('new_notification', (data) => {
            this.showNotification(data);
        });

        this.socket.on('admin_alert', (data) => {
            if (this.isAdmin) {
                this.showAdminAlert(data);
            }
        });

        this.socket.on('connection_error', (data) => {
            console.error('Connection error:', data.message);
        });
    }

    showNotification(data) {
        // Display notification to user
        const notification = new Notification(data.message, {
            icon: '/static/images/logo.png',
            body: `Type: ${data.type}`
        });

        // Also update UI if needed
        if (window.updateNotificationsUI) {
            window.updateNotificationsUI(data);
        }
    }

    showAdminAlert(data) {
        // Display admin alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `admin-alert ${data.severity}`;
        alertDiv.innerHTML = `
            <span class="alert-message">${data.message}</span>
            <span class="alert-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
            <button class="close-alert">&times;</button>
        `;
        
        document.querySelector('.admin-alerts-container').prepend(alertDiv);
        
        alertDiv.querySelector('.close-alert').addEventListener('click', () => {
            alertDiv.remove();
        });
    }

    sendMessage(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Initialize client when page loads
document.addEventListener('DOMContentLoaded', () => {
    const userId = document.body.dataset.userId;
    const token = document.body.dataset.wsToken;
    
    if (userId && token) {
        window.realtimeClient = new RealtimeClient(userId, token);
    }
});