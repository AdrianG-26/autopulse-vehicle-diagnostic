# Testing in Expo Go - Quick Guide

## ✅ What Was Changed

The app has been configured to work with **Expo Go** for local testing without building a native APK.

### Notification Behavior in Expo Go

Since Expo Go doesn't support push notifications (SDK 53+), the app now:
- ✅ **Detects when running in Expo Go** automatically
- ✅ **Simulates notifications** by logging to console
- ✅ **Works normally** in all other aspects
- ✅ **Will show real notifications** once you build a production APK

## 📱 How to Test Now

### 1. Open Expo Go App
Download and install **Expo Go** from:
- **Android:** Google Play Store
- **iOS:** App Store

### 2. Scan the QR Code
- Open Expo Go app
- Tap "Scan QR code"
- Point camera at the QR code in your terminal
- App will load! 🎉

### 3. Test the App
Navigate through the app normally:
- ✅ Dashboard shows vehicle data
- ✅ Auto-refresh every 5 seconds
- ✅ All screens work

### 4. Test Notification Logic

When vehicle status changes to Warning (2) or Critical (3):

**What happens in Expo Go:**
```
⚠️ === NOTIFICATION SIMULATION (Expo Go) ===
📱 Title: ⚠️ Vehicle Warning
📝 Body: Your vehicle status is now Warning
🔔 (In production build, this would trigger a real push notification)
=================================
```

**Check the console logs** in your terminal/Metro bundler to see the simulated notifications!

## 🧪 How to Trigger a Test Notification

1. Open your **Supabase dashboard**
2. Go to **Table Editor** → `sensor_data`
3. Find the latest record
4. Edit `health_status` column:
   - Set to `2` for Warning notification
   - Set to `3` for Critical notification
5. Save the change
6. Wait **5 seconds** (auto-refresh interval)
7. **Check your terminal** - you should see the notification simulation!

## 🔄 Current Flow

```
Supabase (health_status = 2 or 3)
    ↓ (5 second auto-refresh)
Mobile App fetches data
    ↓
useVehicleData hook detects status change
    ↓
notificationService.sendHealthStatusNotification()
    ↓
[Expo Go] → Console log simulation ✅
[Production APK] → Real push notification 🔔
```

## 📊 Console Output to Watch For

When testing, look for these logs:

**On App Start:**
```
⚠️ Notifications not supported in Expo Go - notifications will be simulated in console
🚀 Auto-refresh initialized - fetching every 5 seconds
```

**On Warning/Critical Status:**
```
⚠️ === NOTIFICATION SIMULATION (Expo Go) ===
📱 Title: ⚠️ Vehicle Warning
📝 Body: Your vehicle status is now Warning
```

## 🎯 Next Steps for Production

When you're ready to build the production version with **real notifications**:

### Option 1: Build APK Locally
```bash
cd mobile-app
npx expo prebuild
npx expo run:android
```

### Option 2: Build with EAS (Cloud)
```bash
cd mobile-app
eas build --profile production --platform android
```

The production build will:
- ✅ Show real push notifications
- ✅ Work with notification sounds & vibration
- ✅ Use Android notification channels
- ✅ Support high/max priority alerts

## 🐛 Troubleshooting

### App won't load in Expo Go?
- Make sure you're on the same WiFi network
- Try clearing Expo Go cache: Settings → Clear cache
- Restart Metro: Press `r` in terminal

### Not seeing notification simulations?
- Check the terminal where `npm start` is running
- Verify health_status in Supabase is 2 or 3
- Wait 5 seconds for auto-refresh
- Check console logs for errors

### Want to test on web?
Press `w` in the terminal to open in browser (notifications won't work on web either)

## 📝 Summary

**For Local Testing (Now):**
- Use Expo Go app
- Notifications = console logs
- Perfect for development & testing app logic

**For Production (Later):**
- Build native APK/IPA
- Notifications = real push notifications
- Deploy to users

---

**Current Status:** ✅ Ready for Expo Go testing!

Scan the QR code and start testing! 🚀

