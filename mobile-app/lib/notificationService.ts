/**
 * Notification Service
 * Handles push notifications for vehicle health status alerts
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private hasPermission: boolean = false;

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('⚠️ Notifications not supported on web');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied');
        this.hasPermission = false;
        return false;
      }

      this.hasPermission = true;
      console.log('✅ Notification permission granted');

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('vehicle-alerts', {
          name: 'Vehicle Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Send a local notification for vehicle health status
   */
  async sendHealthStatusNotification(
    status: number,
    statusText: string
  ): Promise<void> {
    if (!this.hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) return;
    }

    try {
      let title = '';
      let body = '';
      let priority = Notifications.AndroidNotificationPriority.DEFAULT;

      if (status === 2) {
        // Warning status
        title = '⚠️ Vehicle Warning';
        body = `Your vehicle status is now ${statusText}. Please check the dashboard for details.`;
        priority = Notifications.AndroidNotificationPriority.HIGH;
      } else if (status === 3) {
        // Critical status
        title = '🚨 Vehicle Critical Alert';
        body = `URGENT: Your vehicle status is ${statusText}! Immediate attention required.`;
        priority = Notifications.AndroidNotificationPriority.MAX;
      }

      if (title && body) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            priority: priority,
            vibrate: [0, 250, 250, 250],
            badge: 1,
            data: { status, statusText },
          },
          trigger: null, // Send immediately
        });

        console.log(`📱 Notification sent: ${title}`);
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🔕 All notifications cancelled');
    } catch (error) {
      console.error('❌ Error cancelling notifications:', error);
    }
  }

  /**
   * Check if notifications are enabled
   */
  getPermissionStatus(): boolean {
    return this.hasPermission;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export notification listener hooks
export const addNotificationReceivedListener = (
  handler: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(handler);
};

export const addNotificationResponseReceivedListener = (
  handler: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};

