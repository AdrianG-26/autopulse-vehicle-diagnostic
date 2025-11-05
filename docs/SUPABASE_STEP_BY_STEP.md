# 📝 Step-by-Step Supabase Setup Guide

## If Your Groupmate Already Has a Supabase Project

### Step 1: Get Access to the Supabase Project (5 minutes)

**Ask your groupmate for:**
1. Invite you to the Supabase project as a collaborator
   - They go to: Supabase Dashboard → Project → Settings → Team
   - Click "Invite" and add your email

OR

2. Share these credentials with you:
   - **Project URL** (format: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

**To get these if your groupmate doesn't know:**
- Login to Supabase → Select Project
- Go to **Settings** (⚙️ icon on left sidebar)
- Click **API** section
- Copy:
  - **Project URL**
  - **Project API keys** → `anon` `public` key

---

### Step 2: Check if Database Schema is Already Set Up (2 minutes)

1. Login to Supabase Dashboard
2. Go to **Table Editor** (database icon on left sidebar)
3. Check if these tables exist:
   - ✅ `vehicle_profiles`
   - ✅ `sensor_data`
   - ✅ `sensor_data_realtime`
   - ✅ `vehicle_statistics`
   - ✅ `users`

**If tables DON'T exist:**
- Go to **SQL Editor** (</> icon on left sidebar)
- Click **New Query**
- Copy entire content from `/src/supabase_schema.sql` file
- Paste into SQL Editor
- Click **Run** (or press Ctrl+Enter)
- Wait for "Success" message
- Go back to **Table Editor** to verify tables created

**If tables ALREADY exist:**
- ✅ Skip to Step 3!

---

### Step 3: Check if Test Vehicle Exists (1 minute)

1. In Supabase Dashboard → **Table Editor**
2. Click on `vehicle_profiles` table
3. Look for a row with `id = 1`

**If vehicle exists:**
- ✅ Note the `id` number (usually 1)
- ✅ Skip to Step 4!

**If NO vehicle exists:**
- Click **Insert row** button
- Fill in:
  - `id`: 1
  - `car_identifier`: `TEST_CAR_001`
  - `car_display_name`: `Toyota Veloz 2023`
  - `make`: `Toyota`
  - `model`: `Veloz`
  - `year`: `2023`
  - `is_active`: `true` (checkbox)
- Click **Save**

---

### Step 4: Configure Website Environment Variables (3 minutes)

1. Open terminal in your project:
   ```bash
   cd ~/vehicle_diagnostic_system/website
   ```

2. Check if `.env` file exists:
   ```bash
   ls -la .env
   ```

3. **If `.env` exists** - Edit it:
   ```bash
   nano .env
   ```
   
4. **If `.env` does NOT exist** - Create it:
   ```bash
   nano .env
   ```

5. Add/update these lines (replace with your actual values):
   ```bash
   REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```

6. Save and exit:
   - Press `Ctrl + X`
   - Press `Y` to confirm
   - Press `Enter`

7. **Restart your website development server:**
   ```bash
   npm start
   # or if it's already running, stop it (Ctrl+C) and restart
   ```

---

### Step 5: Configure Mobile App Environment Variables (3 minutes)

1. Open terminal in mobile-app folder:
   ```bash
   cd ~/vehicle_diagnostic_system/mobile-app
   ```

2. Create `.env` file:
   ```bash
   nano .env
   ```

3. Add these lines (replace with your actual values):
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
   ```

4. Save and exit:
   - Press `Ctrl + X`
   - Press `Y`
   - Press `Enter`

5. **Restart Expo with cache clear:**
   ```bash
   npx expo start -c
   # The -c flag clears cache to load new env variables
   ```

---

### Step 6: Insert Test Data to Verify Connection (5 minutes)

**Go to Supabase Dashboard:**

1. Click **Table Editor** → `sensor_data_realtime` table
2. Click **Insert row** button
3. Fill in test data:

   ```
   vehicle_id: 1
   timestamp: (click "now()" button)
   rpm: 2000
   speed: 60
   coolant_temp: 85
   engine_load: 45
   throttle_pos: 30
   fuel_level: 75
   intake_temp: 25
   maf: 15.5
   timing_advance: 12
   o2_sensor_1: 0.8
   o2_sensor_2: 0.75
   ml_health_score: 95
   ml_status: NORMAL
   ml_alerts: [] (leave empty or delete)
   data_quality_score: 100
   ```

4. Click **Save**

---

### Step 7: Test Website (2 minutes)

1. Open your website in browser (usually `http://localhost:3000`)
2. **Check browser console** (F12 → Console tab):
   - Look for "✅ Started polling Supabase"
   - Should see NO errors about Supabase
   
3. **Check Dashboard page:**
   - Should show RPM: 2000
   - Should show Speed: 60 km/h
   - Should show ML Health Score: 95%
   - Should show Status: NORMAL

**If you see "N/A" or no data:**
- Check browser console for errors
- Verify `.env` file has correct credentials
- Restart development server

---

### Step 8: Test Mobile App (2 minutes)

1. Open mobile app on your device/simulator
2. Pull down to refresh (pull-to-refresh gesture)
3. **Check if data appears:**
   - Home screen should show RPM: 2000
   - Should show ML Health Score: 95%
   - Should show Status: NORMAL
   
4. **Check all tabs:**
   - Engine tab
   - Fuel tab
   - Emissions tab
   - Logs tab

**If you see "N/A" or "Waiting for data":**
- Check Metro bundler console for errors
- Restart Expo: `npx expo start -c`
- Check device has internet connection

---

### Step 9: Test Real-Time Sync (3 minutes)

**This proves both apps are connected to same database:**

1. Open **both** website and mobile app side-by-side
2. Go to Supabase Dashboard → **Table Editor** → `sensor_data_realtime`
3. Click the row you created earlier
4. **Edit** the values:
   - Change `rpm` to `3000`
   - Change `coolant_temp` to `90`
   - Click **Save**

5. **Watch both apps:**
   - Within 2-3 seconds, BOTH should update
   - Website shows new RPM: 3000, Temp: 90°C
   - Mobile shows new RPM: 3000, Temp: 90°C

**✅ If both update = SUCCESS! Real-time sync is working!**

---

### Step 10: Set Up Continuous Data from Raspberry Pi (Optional)

**If you want live data from your car sensor:**

1. Check if sync script exists:
   ```bash
   ls ~/vehicle_diagnostic_system/src/sync_to_supabase.py
   ```

2. Edit the script to add Supabase credentials:
   ```bash
   nano ~/vehicle_diagnostic_system/src/sync_to_supabase.py
   ```

3. Add your Supabase URL and key at the top of the file

4. Run the sync script:
   ```bash
   cd ~/vehicle_diagnostic_system/src
   python3 sync_to_supabase.py
   ```

**This will continuously push Raspberry Pi sensor data to Supabase,**
**which then appears on both website and mobile app automatically!**

---

## 🎯 Quick Checklist

Before thesis demo, verify:

- [ ] Supabase credentials added to website `.env`
- [ ] Supabase credentials added to mobile-app `.env`
- [ ] Test vehicle (id=1) exists in `vehicle_profiles` table
- [ ] Test data exists in `sensor_data_realtime` table
- [ ] Website shows live data (not N/A)
- [ ] Mobile app shows live data (not N/A)
- [ ] Real-time sync works (edit in Supabase → both apps update)
- [ ] All tabs working on both platforms
- [ ] Internet connection stable

---

## 🆘 Common Issues & Solutions

### "Supabase is not configured"
**Solution:** 
- Check `.env` file exists
- Verify credentials are correct
- Restart development server

### "No data available"
**Solution:**
- Insert test data in Supabase Table Editor
- Check vehicle_id = 1 matches
- Verify RLS policies allow SELECT

### "Real-time not updating"
**Solution:**
- Go to Supabase → Database → Replication
- Enable Realtime for `sensor_data_realtime` table
- Refresh both apps

### Mobile app shows errors
**Solution:**
```bash
cd mobile-app
npx expo start -c
# Clear cache and restart
```

---

## 📞 Getting Credentials from Your Groupmate

**Send this message to your groupmate:**

> Hey! Can you share the Supabase credentials for our project? I need:
> 
> 1. Project URL (Settings → API → Project URL)
> 2. Anon/Public Key (Settings → API → Project API keys → anon public)
> 
> Or invite me to the project:
> Settings → Team → Invite → [my email]
> 
> Thanks!

---

**That's it! Your apps are now connected to Supabase! 🎉**

