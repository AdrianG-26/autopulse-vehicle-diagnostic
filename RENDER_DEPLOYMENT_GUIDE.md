# 🚀 Render Deployment Guide - Frontend with Supabase

## ✅ What We Did

Your frontend has been updated to connect **directly to Supabase** instead of using the Flask backend API.

## 🔧 Required: Set Environment Variables on Render

### Step 1: Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Click on your `autopulse-frontend` service
3. Go to the **Environment** tab

### Step 2: Add These TWO Environment Variables

**Variable 1:**
```
Key: REACT_APP_SUPABASE_URL
Value: https://qimiewqthuhmofjhzrrb.supabase.co
```

**Variable 2:**
```
Key: REACT_APP_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0
```

### Step 3: Trigger Manual Deploy

1. Click **"Manual Deploy"** button
2. Select **"Clear build cache & deploy"**
3. Wait ~5 minutes for build

## ✅ After Deployment

Your frontend will now show live data from your Raspberry Pi!

- 📊 Real-time sensor data
- 🔄 Updates every 1 second
- ✅ No Flask backend needed
