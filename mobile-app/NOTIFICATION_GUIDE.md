# Push Notification Guide

## Overview
The AutoPulse mobile app now includes push notifications that alert you when your vehicle's health status changes to **Warning** or **Critical**.

## Features

### Automatic Health Monitoring
- The app fetches vehicle data every 5 seconds from Supabase
- When the health status changes to Warning (2) or Critical (3), a push notification is sent
- Notifications are only sent when the status **changes** to avoid spam

### Health Status Levels
1. **Normal (0)** - No notification
2. **Advisory (1)** - No notification  
3. **Warning (2)** - ⚠️ Push notification sent
4. **Critical (3)** - 🚨 Push notification sent with high priority

### Notification Content

#### Warning Notification
- **Title:** ⚠️ Vehicle Warning
- **Body:** Your vehicle status is now Warning. Please check the dashboard for details.
- **Priority:** High

#### Critical Notification  
- **Title:** 🚨 Vehicle Critical Alert
- **Body:** URGENT: Your vehicle status is Critical! Immediate attention required.
- **Priority:** Maximum (Android)
- **Features:** Vibration, sound, and badge

## Setup & Permissions

### First Launch
1. On first launch, the app will request notification permissions
2. Tap **Allow** to enable push notifications
3. You can change this later in your device settings

### Android
- Notifications use the "Vehicle Alerts" channel
- Maximum importance with vibration pattern
- Red light color indicator

### iOS
- Background notification support enabled
- Notifications work even when app is in background

## Implementation Details

### Files Modified
1. **`lib/notificationService.ts`** - Notification service handler
2. **`hooks/useVehicleData.ts`** - Added health status monitoring
3. **`app.json`** - Added expo-notifications plugin configuration

### How It Works
```typescript
// The hook monitors health status every 5 seconds
useVehicleData() {
  // Fetches latest vehicle data
  // Compares current health_status with previous
  // If status changed to 2 or 3, sends notification
}
```

### Smart Notification Logic
- Tracks previous health status using React ref
- Only sends notification if status **changes**
- Ignores initial load to avoid false alerts
- Logs all notification events to console

## Testing

### Method 1: Update Database
1. Open your Supabase dashboard
2. Go to `sensor_data` table
3. Update the latest record's `health_status` to:
   - `2` for Warning notification
   - `3` for Critical notification
4. Wait up to 5 seconds for the app to fetch the update
5. Notification should appear

### Method 2: Simulate in Code
For testing, you can temporarily modify the threshold in the Python data collector to trigger warning/critical states.

### Debugging
- Check console logs for notification events
- Look for messages like:
  - `✅ Notification permissions granted`
  - `🚨 Health status changed to Warning (2) - sending notification`
  - `📱 Notification sent: ...`

## Troubleshooting

### Notifications Not Appearing?
1. **Check Permissions:** Go to device Settings → Apps → AutoPulse → Notifications
2. **Check Console:** Look for permission denied messages
3. **Restart App:** Sometimes permissions need app restart
4. **Android:** Check Do Not Disturb mode
5. **iOS:** Check Focus/Do Not Disturb settings

### Getting Multiple Notifications?
- The app should prevent duplicate notifications
- If this occurs, check console logs for the previous status tracking

### No Permission Prompt?
- iOS: Clear app data and reinstall
- Android: Clear app data in Settings → Apps → AutoPulse → Storage

## Future Enhancements
- [ ] Configurable notification settings in app
- [ ] Custom notification sounds
- [ ] Notification history
- [ ] Push notifications when app is closed (requires backend)
- [ ] Remote push notifications via Expo Push Notification Service

## Technical Notes

### Package Used
- `expo-notifications` - Official Expo notification library
- Version: Latest (installed with npm)

### Notification Channel (Android)
- **ID:** `vehicle-alerts`
- **Name:** Vehicle Alerts
- **Importance:** MAX
- **Vibration:** [0, 250, 250, 250]
- **Light Color:** Red (#FF0000)

### Platform Support
- ✅ Android - Full support
- ✅ iOS - Full support  
- ❌ Web - Not supported (web browsers handle notifications differently)

## Code Examples

### Manually Send Notification
```typescript
import { notificationService } from '@/lib/notificationService';

// Send a test notification
notificationService.sendHealthStatusNotification(3, 'Critical');
```

### Listen to Notification Events
```typescript
import { addNotificationReceivedListener } from '@/lib/notificationService';

// In your component
useEffect(() => {
  const subscription = addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
  });
  
  return () => subscription.remove();
}, []);
```

## Resources
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
- [iOS Local Notifications](https://developer.apple.com/documentation/usernotifications)

