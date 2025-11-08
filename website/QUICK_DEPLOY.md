# 🚀 Quick Deployment Guide - FOLLOW THESE STEPS

## Step 1: Deploy to Vercel (Do this NOW!)

### Open a new terminal and run:

```bash
cd /home/rocketeers/vehicle_diagnostic_system/website
vercel
```

### You'll see prompts - answer them like this:

1. **"Set up and deploy?"** → Press **Y** (Yes)

2. **"Which scope?"** → Select your account (use arrow keys, press Enter)

3. **"Link to existing project?"** → Press **N** (No, create new)

4. **"What's your project's name?"** → Type: **autopulse** (or your choice)

5. **"In which directory is your code located?"** → Press **Enter** (uses current directory)

6. **"Want to override the settings?"** → Press **N** (No)

7. **Wait for build...** (2-3 minutes)

8. **🎉 You'll get a URL!** Copy it!

---

## Step 2: Add Environment Variables

After deployment, run these commands ONE BY ONE:

```bash
# Add Supabase URL
vercel env add REACT_APP_SUPABASE_URL production
```

When prompted, paste: `https://qimiewqthuhmofjhzrrb.supabase.co`

```bash
# Add Supabase Key
vercel env add REACT_APP_SUPABASE_ANON_KEY production
```

When prompted, paste: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0`

```bash
# Add API URL (for now, use localhost - we'll update later)
vercel env add REACT_APP_API_URL production
```

When prompted, paste: `http://localhost:5000`

---

## Step 3: Redeploy with Environment Variables

```bash
vercel --prod
```

This will rebuild with the environment variables and give you your **FINAL PRODUCTION URL**!

---

## 🌐 Your Website Will Be Live At:

**https://autopulse-XXXXX.vercel.app** (or custom name you chose)

---

## 📱 Next Steps After Website is Deployed:

1. ✅ **Test your website** - Visit the URL, check if it loads
2. ✅ **Set up Cloudflare Tunnel** - To expose your Raspberry Pi API online
3. ✅ **Update API URL** - Point website to your tunnel URL
4. ✅ **Build Mobile APK** - With the same API URL
5. ✅ **Ready for thesis defense!** 🎓

---

## 🔧 Need to Expose Raspberry Pi API?

### Quick Cloudflare Tunnel Setup:

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb

# Quick tunnel (no account needed)
cloudflared tunnel --url http://localhost:5000
```

This gives you a temporary public URL like: `https://abc-def-123.trycloudflare.com`

Then update your Vercel environment:

```bash
vercel env rm REACT_APP_API_URL production
vercel env add REACT_APP_API_URL production
# Paste the Cloudflare URL
vercel --prod
```

---

## 📞 Need Help?

If you get stuck:

1. Make sure you're in the `/home/rocketeers/vehicle_diagnostic_system/website` directory
2. Make sure you have internet connection
3. Read the prompts carefully and answer as shown above
4. Check the full DEPLOYMENT.md guide for troubleshooting

---

**Ready? Open a terminal and start with Step 1!** 🚀
