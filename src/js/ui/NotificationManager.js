export class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 4000;
        this.isEnabled = true;
    }

    async initialize() {
        this.container = document.getElementById('notifications-container');
        console.log('🔔 Notification Manager initialized');
    }

    show(message, type = 'info', duration = this.defaultDuration) {
        if (!this.isEnabled || !this.container) return;

        const notification = this.createNotification(message, type, duration);
        this.addNotification(notification);
    }

    createNotification(message, type, duration) {
        const id = Date.now() + Math.random();
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="window.game.notificationManager.remove('${id}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Auto-remove after duration
        setTimeout(() => {
            this.remove(id);
        }, duration);

        return notification;
    }

    addNotification(notification) {
        // Remove oldest notification if at max capacity
        if (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            if (oldest && oldest.parentNode) {
                oldest.remove();
            }
        }

        this.notifications.push(notification);
        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('animate__animated', 'animate__slideInRight');
        }, 10);
    }

    remove(id) {
        const notification = this.container.querySelector(`[data-id="${id}"]`);
        if (!notification) return;

        notification.classList.add('animate__animated', 'animate__slideOutRight');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
            this.notifications = this.notifications.filter(n => n !== notification);
        }, 300);
    }

    clear() {
        this.notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.remove();
            }
        });
        this.notifications = [];
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }

    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Preset notification types
    showSuccess(message, duration) {
        this.show(message, 'success', duration);
    }

    showError(message, duration) {
        this.show(message, 'error', duration);
    }

    showWarning(message, duration) {
        this.show(message, 'warning', duration);
    }

    showInfo(message, duration) {
        this.show(message, 'info', duration);
    }

    // Achievement notification with special styling
    showAchievement(achievementName) {
        const message = `🏆 Achievement Unlocked: ${achievementName}!`;
        const notification = this.createNotification(message, 'success', 6000);
        notification.classList.add('achievement-notification');
        this.addNotification(notification);
    }
}