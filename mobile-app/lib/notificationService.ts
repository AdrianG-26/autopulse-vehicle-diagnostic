/**
 * Notification Service
 * Handles push notifications for vehicle health status alerts
 * Note: Notifications are disabled in Expo Go - use a development build for full support
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Dynamically import Notifications only when NOT in Expo Go to avoid initialization errors
let Notifications: any = null;

// Only import and configure notifications if NOT in Expo Go
if (!isExpoGo && Platform.OS !== 'web') {
  import('expo-notifications').then((NotificationsModule) => {
    Notifications = NotificationsModule;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }).catch((error) => {
    console.log('⚠️ Notifications module not available:', error.message);
  });
}

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

    if (isExpoGo) {
      console.log('⚠️ Notifications not supported in Expo Go - notifications will be simulated in console');
      return false;
    }

    try {
      if (!Notifications) {
        console.log('⚠️ Notifications module not loaded');
        return false;
      }

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
    // Simulate notification in Expo Go (log to console)
    if (isExpoGo) {
      const emoji = status === 2 ? '⚠️' : '🚨';
      const urgency = status === 2 ? 'Warning' : 'CRITICAL';
      console.log(`\n${emoji} === NOTIFICATION SIMULATION (Expo Go) ===`);
      console.log(`📱 Title: ${emoji} Vehicle ${urgency}`);
      console.log(`📝 Body: Your vehicle status is now ${statusText}`);
      console.log(`🔔 (In production build, this would trigger a real push notification)`);
      console.log(`=================================\n`);
      return;
    }

    if (!this.hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) return;
    }

    try {
      if (!Notifications) {
        console.log('⚠️ Notifications module not loaded, skipping notification');
        return;
      }

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
    if (isExpoGo || !Notifications) return;
    
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
export const addNotificationReceivedListener = async (
  handler: (notification: any) => void
) => {
  if (isExpoGo || !Notifications) return { remove: () => {} };
  return Notifications.addNotificationReceivedListener(handler);
};

export const addNotificationResponseReceivedListener = async (
  handler: (response: any) => void
) => {
  if (isExpoGo || !Notifications) return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener(handler);
};

