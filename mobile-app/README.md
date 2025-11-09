<<<<<<< HEAD

# AutoPulse Mobile App

Vehicle diagnostic mobile application built with React Native and Expo. Connects to Raspberry Pi Flask API for real-time OBD-II sensor data and ML-powered vehicle health predictions.

## Features

- **Real-time Dashboard** - Live sensor data from your vehicle
- **Emissions Monitoring** - Track O₂ sensors, catalyst temp, fuel trims, EGR
- **Engine Metrics** - RPM, coolant temp, MAF, MAP, timing advance
- **Fuel Analytics** - Fuel level, pressure, system status, efficiency
- **Health Predictions** - ML-powered maintenance alerts
- **Historical Logs** - Filter and review past sensor readings
- **Configurable API** - Change Raspberry Pi endpoint from Settings (no rebuild needed)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npx expo start
```

Then scan the QR code with:

- **Android**: Expo Go app
- **iOS**: Camera app (opens in Expo Go)
- **Web**: Press `w` to open in browser

### 3. Configure Raspberry Pi Connection

1. Open the app
2. Go to **Settings → Raspberry Pi**
3. Enter your Pi's IP address (e.g., `http://192.168.4.1:5000` for hotspot or `http://192.168.1.100:5000` for local network)
4. Tap **Save & Test** to verify connection

## Building APK for Android

### Prerequisites

1. **Create Expo account** (free): https://expo.dev/signup
2. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
3. **Login to EAS**:
   ```bash
   eas login
   ```

### Build Preview APK (for testing)

```bash
cd mobile-app
eas build --platform android --profile preview
```

- Build takes ~5-10 minutes
- Download link appears in terminal and on https://expo.dev
- Transfer APK to your phone and install
- **No Play Store needed** for preview builds

### Build Production APK/AAB

```bash
eas build --platform android --profile production
```

- Creates optimized production build
- Can upload AAB to Google Play Store
- APK version works for direct distribution

### First Build Setup

On your first `eas build`, you'll be prompted to:

1. Generate a new Android keystore (press Y)
2. Choose a package name (default: `com.adriang26.autopulse`)

EAS handles signing and stores your keystore securely.

## Project Structure

```
mobile-app/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Dashboard
│   │   └── log.tsx          # Historical logs
│   ├── emissions.tsx        # Emissions monitoring
│   ├── engine.tsx           # Engine metrics
│   ├── fuel.tsx             # Fuel analytics
│   ├── predictHealth.tsx    # ML predictions
│   └── settings/            # Settings screens
│       └── raspberry.tsx    # Pi connection config
├── components/              # Reusable UI components
├── hooks/
│   └── useVehicleData.ts   # Real-time data hook
├── lib/
│   └── rpiApi.ts           # Raspberry Pi API client
├── constants/              # App constants
├── app.json               # Expo config
├── eas.json              # EAS build profiles
└── package.json
```

## API Configuration

The app uses AsyncStorage to persist your Raspberry Pi API URL. Default is `http://192.168.1.100:5000`.

**To change at runtime:**

1. Settings → Raspberry Pi
2. Edit endpoint field
3. Save & Test

**To change default** (before building):
Edit `mobile-app/lib/rpiApi.ts`:

```typescript
const DEFAULT_API_URL = "http://YOUR_PI_IP:5000";
```

## Testing on Physical Device

### Option 1: Expo Go (Development)

1. Install Expo Go from Play Store/App Store
2. Run `npx expo start`
3. Scan QR code
4. Edit code and see live updates

### Option 2: APK Build (Production-like)

1. Build preview APK: `eas build --platform android --profile preview`
2. Download APK from build link
3. Transfer to phone via USB/Drive/AirDrop
4. Install APK (enable "Install from unknown sources")
5. Configure Pi IP in Settings

## Troubleshooting

### "Could not connect to Raspberry Pi"

- Verify Pi Flask server is running (`python web_server.py`)
- Check Pi IP address matches Settings endpoint
- Ensure phone and Pi are on same network (or Pi hotspot is active)
- Test connection: Settings → Raspberry Pi → Save & Test

### EAS Build Fails

- Run `eas whoami` to verify login
- Check `app.json` has valid `slug` and `version`
- Ensure `eas.json` exists with build profiles
- Review build logs at https://expo.dev

### TypeScript Errors in IDE

- Expected for React Native/Expo projects
- Run `npm install` to ensure types are installed
- Errors don't block builds unless critical

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [React Native](https://reactnative.dev/)

## License

MIT

=======

# thesis-autopulse

> > > > > > > cbb5b26991b212565a312571e389e4e990209bb3
