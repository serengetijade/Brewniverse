import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
    constructor() {
        this.isNative = Capacitor.isNativePlatform();
        this.initialized = false;
        this.permissionGranted = false;
    }

    async initialize() {
        if (!this.isNative || this.initialized) {
            return;
        }

        try {
            // Request permissions
            const permissionStatus = await LocalNotifications.requestPermissions();
            this.permissionGranted = permissionStatus.display === 'granted';
            this.initialized = true;

            if (!this.permissionGranted) {
                console.warn('Notification permissions not granted');
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    }

    async checkPermissions() {
        if (!this.isNative) {
            return false;
        }

        try {
            const result = await LocalNotifications.checkPermissions();
            this.permissionGranted = result.display === 'granted';
            return this.permissionGranted;
        } catch (error) {
            console.error('Error checking permissions:', error);
            return false;
        }
    }

    async scheduleAlert(alert, settings = {}) {
        if (settings.disableNotifications) {
            return false;
        }

        if (!this.isNative || !this.permissionGranted) {
            return false;
        }

        try {
            const alertDate = new Date(alert.date);
            const now = new Date();

            // Don't schedule notifications for past dates
            if (alertDate <= now) {
                console.log('Alert date is in the past, skipping notification');
                return false;
            }

            const notification = {
                title: alert.name || 'Brewniverse Alert',
                body: alert.description || 'You have a brewing alert',
                id: parseInt(alert.id.replace(/\D/g, '').slice(0, 8)) || Math.floor(Math.random() * 100000000),
                schedule: { at: alertDate },
                sound: 'default',
                actionTypeId: '',
                extra: {
                    alertId: alert.id,
                    brewLogId: alert.brewLogId || null,
                    priority: alert.priority || 'medium'
                }
            };

            // Handle recurring alerts
            if (alert.isRecurring) {
                const schedule = this.getRecurringSchedule(alert);
                if (schedule) {
                    notification.schedule = schedule;
                }
            }

            await LocalNotifications.schedule({
                notifications: [notification]
            });

            console.log('Notification scheduled:', notification);
            return true;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return false;
        }
    }

    getRecurringSchedule(alert) {
        const startDate = new Date(alert.date);
        const endDate = alert.endDate ? new Date(alert.endDate) : null;
        const interval = alert.recurringInterval || 1;

        const schedule = {
            at: startDate,
            every: this.getRecurringUnit(alert.recurringType),
            count: endDate ? this.getOccurrenceCount(startDate, endDate, alert.recurringType, interval) : undefined
        };

        return schedule;
    }

    getRecurringUnit(recurringType) {
        const units = {
            'daily': 'day',
            'weekly': 'week',
            'monthly': 'month',
            'yearly': 'year'
        };
        return units[recurringType] || 'day';
    }

    getOccurrenceCount(startDate, endDate, recurringType, interval) {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (recurringType) {
            case 'daily':
                return Math.floor(diffDays / interval);
            case 'weekly':
                return Math.floor(diffDays / (7 * interval));
            case 'monthly':
                return Math.floor(diffDays / (30 * interval)); // Approximate
            case 'yearly':
                return Math.floor(diffDays / (365 * interval)); // Approximate
            default:
                return 1;
        }
    }

    async cancelAlert(alertId) {
        if (!this.isNative) {
            return false;
        }

        try {
            const notificationId = parseInt(alertId.replace(/\D/g, '').slice(0, 8)) || 0;
            
            await LocalNotifications.cancel({
                notifications: [{ id: notificationId }]
            });

            console.log('Notification cancelled:', notificationId);
            return true;
        } catch (error) {
            console.error('Error cancelling notification:', error);
            return false;
        }
    }

    async cancelAllAlerts() {
        if (!this.isNative) {
            return false;
        }

        try {
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel({ notifications: pending.notifications });
            }
            console.log('All notifications cancelled');
            return true;
        } catch (error) {
            console.error('Error cancelling all notifications:', error);
            return false;
        }
    }

    async rescheduleAllAlerts(alerts, settings = {}) {
        if (!this.isNative || settings.disableNotifications) {
            return;
        }

        try {
            // Cancel all existing notifications first
            await this.cancelAllAlerts();

            // Schedule all active, future alerts
            const now = new Date();
            const futureAlerts = alerts.filter(alert => 
                !alert.isCompleted && new Date(alert.date) > now
            );

            for (const alert of futureAlerts) {
                await this.scheduleAlert(alert, settings);
            }

            console.log(`Rescheduled ${futureAlerts.length} alerts`);
        } catch (error) {
            console.error('Error rescheduling alerts:', error);
        }
    }

    async getPendingNotifications() {
        if (!this.isNative) {
            return [];
        }

        try {
            const result = await LocalNotifications.getPending();
            return result.notifications || [];
        } catch (error) {
            console.error('Error getting pending notifications:', error);
            return [];
        }
    }

    async testNotification() {
        if (!this.isNative || !this.permissionGranted) {
            console.log('Test notification skipped - not native or no permission');
            return false;
        }

        try {
            const now = new Date();
            now.setSeconds(now.getSeconds() + 5); // 5 seconds from now

            await LocalNotifications.schedule({
                notifications: [{
                    title: 'Test Notification',
                    body: 'Your Brewniverse notifications are working!',
                    id: 999999,
                    schedule: { at: now },
                    sound: 'default'
                }]
            });

            console.log('Test notification scheduled for 5 seconds from now');
            return true;
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }
}

export default new NotificationService();

