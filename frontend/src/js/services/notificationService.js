export class NotificationService {
  static async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  static showNotification(title, options) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  static showInAppNotification(message, type = 'info') {
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification ${type}`;
    notificationElement.textContent = message;
    
    document.body.appendChild(notificationElement);
    setTimeout(() => notificationElement.remove(), 5000);
  }
}