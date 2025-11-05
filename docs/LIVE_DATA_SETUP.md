# 🚗 Live OBD Data Setup Guide

## How to Get LIVE Car Data into Your Apps

Currently, your website and mobile app are connected to Supabase, but there's **no live car data** flowing yet.

Here's what you need to do:

---

## Option 1: Manual Test Data (For Demo/Testing)

### Quick Test (5 minutes)

1. Go to your Supabase Dashboard
2. Open **Table Editor** → `sensor_data_realtime`
3. Click **Insert row**
4. Fill in sample values:
   - `vehicle_id`: 1
   - `rpm`: 2500
   - `speed`: 80
   - `coolant_temp`: 88
   - `ml_health_score`: 92
   - `ml_status`: NORMAL
5. Click **Save**
6. Open your website and mobile app → Data appears!

**Update the data:**
- Edit the row in Supabase
- Change RPM to 3000
- Both apps update within 2-3 seconds!

✅ **Use this for thesis demos without needing the actual car**

---

## Option 2: Live OBD Data from Your Car

### Prerequisites

- ✅ OBD scanner connected to car
- ✅ Raspberry Pi with OBD collector running
- ✅ Local SQLite database has car data
- ✅ Supabase credentials (you already have these!)

### Step-by-Step Setup

#### Step 1: Configure Sync Script (5 minutes)

Create environment variables file:

```bash
cd ~/vehicle_diagnostic_system/src
nano .env
```

Add these lines (use YOUR Supabase credentials):

```bash
SUPABASE_URL=https://qimiewqthuhmofjhzrrb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0
USER_ID=your-user-uuid-here
```

Save and exit (`Ctrl+X`, `Y`, `Enter`)

#### Step 2: Install Required Package

```bash
pip3 install supabase
```

#### Step 3: Test the Sync Script

Run a one-time sync:

```bash
cd ~/vehicle_diagnostic_system/src
export $(cat .env | xargs)
python3 sync_to_supabase.py --incremental
```

You should see:
```
✅ Connected to Supabase
✅ Syncing data...
✅ Synced XX records
```

#### Step 4: Run Continuous Sync (For Live Data)

This keeps running and syncs data every few seconds:

```bash
python3 sync_to_supabase.py --continuous
```

Or run in background:

```bash
nohup python3 sync_to_supabase.py --continuous > sync.log 2>&1 &
```

---

## Complete Data Flow (After Setup)

```
┌─────────────┐
│  Your Car   │
│  (OBD Port) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ OBD Scanner │ (Bluetooth/USB)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Raspberry Pi    │
│ OBD Collector    │ ← Already collecting data
│ (SQLite DB)      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Sync Script     │ ← You just set this up!
│ sync_to_supabase │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│    Supabase      │ ← Cloud database
│  (Real-time DB)  │
└──────┬───────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────┐      ┌──────────┐     ┌──────────┐
│ Website  │      │ Mobile   │     │  Other   │
│ (Live!)  │      │  App     │     │ Devices  │
│          │      │ (Live!)  │     │          │
└──────────┘      └──────────┘     └──────────┘
```

---

## Current Status Check

### Check if OBD collector is running:

```bash
# Check if collector daemon is running
ps aux | grep automated_car_collector

# Check local database
ls -lh ~/vehicle_diagnostic_system/data/*.db
```

### Check if data exists locally:

```bash
sqlite3 ~/vehicle_diagnostic_system/data/vehicle_data.db "SELECT COUNT(*) FROM sensor_data;"
```

If you see a number > 0, you have local data ready to sync!

---

## Recommended Setup for Thesis Demo

### Before Demo Day:

1. **Test with Manual Data First**
   - Insert test data in Supabase
   - Verify website and mobile sync
   - Practice your demo script

2. **Then Add Live Car Data** (Optional)
   - Set up sync script
   - Drive around to collect real data
   - Show live updates during demo

### During Demo:

**Option A: Safe Demo (Recommended)**
- Use pre-recorded data in Supabase
- Update values manually to show real-time sync
- No dependency on car/OBD connection

**Option B: Live Demo (Advanced)**
- Have car running with OBD connected
- Sync script running on RPi
- Real-time data from actual car
- **Risk**: What if OBD disconnects?

**Option C: Hybrid (Best)**
- Start with manual data
- Show that you CAN connect to real car
- Have backup test data ready

---

## Troubleshooting

### "No data in apps"
**Check:**
1. Is there data in Supabase? (Table Editor → sensor_data_realtime)
2. Is vehicle_id = 1?
3. Are both apps using correct Supabase credentials?

### "Sync script not working"
**Check:**
1. Are environment variables set? (`echo $SUPABASE_URL`)
2. Is supabase package installed? (`pip3 list | grep supabase`)
3. Is there data in local SQLite? (see "Current Status Check" above)

### "Real-time not updating"
**Check:**
1. Supabase → Database → Replication → Enable for sensor_data_realtime
2. Refresh both apps
3. Check browser/mobile console for errors

---

## Summary

**For Thesis Demo:**
- ✅ Manual test data = Safest, most reliable
- ✅ Live car data = Impressive, but risky
- ✅ Hybrid approach = Best of both worlds

**Current Setup:**
- ✅ Website connected to Supabase
- ✅ Mobile app connected to Supabase  
- ⏳ Sync script ready (needs configuration)
- ⏳ Choose: Manual test data OR live car data

**You're 90% done! Just decide which approach for your demo.**

