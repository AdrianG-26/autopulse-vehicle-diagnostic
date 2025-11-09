# Supabase Realtime Setup Guide

## ✅ Migration Complete: Polling → REST API + Realtime

The website has been migrated from HTTP polling to **Supabase REST API + Realtime subscriptions**.

## What Changed

1. **Removed**: `setInterval` polling every 2 seconds
2. **Added**: Supabase Realtime subscriptions for instant updates
3. **Kept**: REST API for initial data fetch and fallback

## Benefits

- ✅ **No more polling** - Uses Supabase Realtime for instant updates
- ✅ **Lower server load** - No constant HTTP requests
- ✅ **Real-time updates** - Data appears instantly when inserted/updated
- ✅ **Works with Vercel** - Supabase handles WebSocket connections
- ✅ **Automatic fallback** - Falls back to periodic REST API calls if Realtime fails

## Required Setup in Supabase

### Step 1: Enable Realtime for `sensor_data` table

1. Go to your **Supabase Dashboard**
2. Navigate to **Database** → **Replication**
3. Find the `sensor_data` table
4. Toggle **Realtime** to **ON**

### Step 2: Or run this SQL in Supabase SQL Editor

```sql
-- Enable Realtime for sensor_data table
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;
```

### Step 3: Verify Realtime is enabled

After enabling, you should see the `sensor_data` table listed under **Replication** with Realtime enabled.

## How It Works

1. **Initial Load**: Uses REST API to fetch latest data when page loads
2. **Real-time Updates**: Supabase Realtime subscription listens for INSERT/UPDATE events
3. **On Change**: When new data is inserted/updated, automatically fetches latest data via REST API
4. **Fallback**: If Realtime fails, automatically falls back to periodic REST API calls (every 5 seconds)

## Testing

1. Open browser console
2. Look for these messages:
   - `✅ Successfully subscribed to real-time updates for vehicle 1`
   - `📡 Real-time update received:` (when data changes)

## Troubleshooting

### Realtime not working?

1. **Check Realtime is enabled** in Supabase Dashboard → Database → Replication
2. **Check browser console** for error messages
3. **Check RLS policies** - Make sure your RLS policies allow SELECT on `sensor_data` table
4. **Fallback mode** - If Realtime fails, the system automatically falls back to periodic REST API calls

### Still seeing polling?

- The fallback mechanism uses periodic REST API calls if Realtime fails
- This is intentional to ensure data still updates even if Realtime is unavailable
- Check console logs to see if Realtime subscription succeeded

## Architecture

```
Frontend (Vercel)
    ↓
Supabase REST API (Initial fetch)
    ↓
Supabase Realtime (WebSocket for updates)
    ↓
PostgreSQL (sensor_data table)
```

## Files Modified

- `website/src/services/sensorData.js` - Replaced polling with Realtime
- `website/src/pages/Dashboard.jsx` - Removed interval parameter
- `website/src/pages/Engine.jsx` - Removed interval parameter
- `website/src/pages/Fuel.jsx` - Removed interval parameter
- `website/src/pages/Emissions.jsx` - Removed interval parameter
- `website/src/App.js` - Removed global polling service

