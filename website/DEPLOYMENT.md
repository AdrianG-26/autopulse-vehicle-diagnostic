# 🌐 Website Deployment Guide - Vercel

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at https://vercel.com (free, use GitHub to sign in)

---

## 🚀 Quick Deployment Steps

### **Option 1: Deploy via Vercel Dashboard (Easiest)**

1. **Push your code to GitHub:**

   ```bash
   cd /home/rocketeers/vehicle_diagnostic_system
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel:**

   - Visit https://vercel.com/new
   - Click "Import Git Repository"
   - Select your `thesis-autopulse` repository
   - Click "Import"

3. **Configure Project:**

   - **Framework Preset:** Create React App
   - **Root Directory:** `website`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `build` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   | Name                          | Value                                                                                                                                                                                                              |
   | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
   | `REACT_APP_SUPABASE_URL`      | `https://qimiewqthuhmofjhzrrb.supabase.co`                                                                                                                                                                         |
   | `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0` |
   | `REACT_APP_API_URL`           | See options below ⬇️                                                                                                                                                                                               |

   **For `REACT_APP_API_URL`, choose one:**

   - **Local demo only:** `http://localhost:5000` (won't work online)
   - **Cloudflare Tunnel:** `https://your-tunnel.trycloudflare.com`
   - **ngrok:** `https://your-id.ngrok.io`
   - **Public Pi:** `http://YOUR_PUBLIC_IP:5000` (if port forwarded)

5. **Click "Deploy"**
   - Vercel will build and deploy automatically
   - Takes 2-3 minutes
   - You'll get a URL like: `https://autopulse.vercel.app`

---

### **Option 2: Deploy via Vercel CLI**

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy from website directory:**

   ```bash
   cd /home/rocketeers/vehicle_diagnostic_system/website
   vercel
   ```

4. **Follow prompts:**

   - Set up and deploy? **Y**
   - Which scope? (select your account)
   - Link to existing project? **N**
   - Project name? **autopulse** (or your choice)
   - In which directory is your code located? **./`** (current directory)
   - Want to override settings? **N**

5. **Add environment variables:**

   ```bash
   # Add Supabase URL
   vercel env add REACT_APP_SUPABASE_URL production
   # Paste: https://qimiewqthuhmofjhzrrb.supabase.co

   # Add Supabase Key
   vercel env add REACT_APP_SUPABASE_ANON_KEY production
   # Paste the key from .env file

   # Add API URL (choose based on your setup)
   vercel env add REACT_APP_API_URL production
   # Paste your API URL (see options above)
   ```

6. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

---

## 🔄 Updating Your Website After Deployment

### **Automatic Updates (Recommended):**

Once connected to GitHub:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update dashboard"
   git push origin main
   ```
3. Vercel automatically rebuilds and deploys! ✅
4. Live in 2-3 minutes

### **Manual Updates:**

If using CLI:

```bash
cd /home/rocketeers/vehicle_diagnostic_system/website
vercel --prod
```

---

## 🌐 Exposing Raspberry Pi API to Internet

For your website to connect to the Flask API online, you need to expose your Pi:

### **Option 1: Cloudflare Tunnel (Recommended - Free & Secure)**

1. **Install Cloudflare Tunnel on Pi:**

   ```bash
   # Download cloudflared
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
   sudo dpkg -i cloudflared-linux-arm64.deb

   # Login to Cloudflare
   cloudflared tunnel login

   # Create tunnel
   cloudflared tunnel create autopulse-api

   # Route tunnel
   cloudflared tunnel route dns autopulse-api api.yourdomain.com

   # Run tunnel
   cloudflared tunnel run --url http://localhost:5000 autopulse-api
   ```

2. **You'll get a URL like:** `https://autopulse-api-xyz.trycloudflare.com`

3. **Update Vercel environment variable:**
   ```bash
   vercel env rm REACT_APP_API_URL production
   vercel env add REACT_APP_API_URL production
   # Paste your Cloudflare tunnel URL
   vercel --prod
   ```

### **Option 2: ngrok (Quick Testing)**

1. **Install ngrok on Pi:**

   ```bash
   # Download ngrok
   wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
   tar xvzf ngrok-v3-stable-linux-arm64.tgz
   sudo mv ngrok /usr/local/bin

   # Sign up at ngrok.com and get auth token
   ngrok config add-authtoken YOUR_TOKEN

   # Start tunnel
   ngrok http 5000
   ```

2. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

3. **Update Vercel:**
   ```bash
   vercel env add REACT_APP_API_URL production
   # Paste ngrok URL
   vercel --prod
   ```

**⚠️ Note:** ngrok free tier URLs change every time you restart. Use Cloudflare for permanent URLs.

### **Option 3: Port Forwarding (Not Recommended)**

Only if you have a static IP and open port 5000 on your router.

---

## 📱 Your Live URLs

After deployment, you'll have:

- **Website:** `https://autopulse.vercel.app` (or custom domain)
- **API:** Your tunnel URL (Cloudflare/ngrok)
- **Mobile App:** Will connect to the same API URL

---

## ✅ Testing Your Deployment

1. **Visit your Vercel URL**
2. **Check browser console** (F12) for any errors
3. **Test Dashboard** - Should load even without API
4. **Test API Connection:**
   - Make sure Flask server is running on Pi
   - Make sure tunnel is active
   - Dashboard should show live data

---

## 🐛 Troubleshooting

### **Build Fails:**

```bash
# Test build locally first
cd /home/rocketeers/vehicle_diagnostic_system/website
npm run build

# If successful locally, push to GitHub
git push origin main
```

### **Environment Variables Not Working:**

- Make sure they start with `REACT_APP_`
- Redeploy after adding variables
- Check Vercel dashboard → Project → Settings → Environment Variables

### **API Connection Issues:**

- Check browser console for CORS errors
- Ensure Flask server has CORS enabled
- Verify tunnel is running and accessible
- Test API URL directly in browser

### **White Screen:**

- Check browser console for errors
- Verify `homepage` in package.json (should not be set for Vercel)
- Check build logs in Vercel dashboard

---

## 🎓 For Thesis Defense

### **Demo Scenarios:**

**Scenario 1: Online Demo (Recommended)**

- Website: Deployed on Vercel (live URL)
- API: Cloudflare Tunnel (always accessible)
- Mobile: APK connecting to same API
- ✅ Works anywhere with internet

**Scenario 2: Local Demo**

- Website: Can still run locally if needed
- API: Running on Raspberry Pi
- Mobile: Connects to local IP
- ✅ Works without internet, but only on same network

**Scenario 3: Hybrid**

- Website: Deployed on Vercel
- API: Switch between local/tunnel via environment variable
- Mobile: Configurable API URL
- ✅ Best of both worlds

---

## 📊 Monitoring

Vercel provides:

- **Analytics** - Page views, visitors
- **Logs** - Build and function logs
- **Performance** - Load times, Core Web Vitals
- **Deployments** - History of all deployments

Access at: https://vercel.com/dashboard

---

## 🔐 Security Notes

- ✅ Supabase anon key is safe to expose (public by design)
- ✅ Vercel serves over HTTPS automatically
- ⚠️ Use Cloudflare Tunnel or ngrok for API (adds HTTPS)
- ⚠️ Don't expose Flask directly without authentication

---

## 💰 Costs

**FREE for your thesis:**

- ✅ Vercel: Free tier (100GB bandwidth/month)
- ✅ Cloudflare Tunnel: Free
- ✅ ngrok: Free tier (1 tunnel at a time)
- ✅ Supabase: Free tier (you're using)

---

## 🚀 Next Steps

1. ✅ Deploy website to Vercel
2. ✅ Set up Cloudflare Tunnel for API
3. ✅ Update API URL in Vercel environment
4. ✅ Test online
5. ✅ Build mobile APK with same API URL
6. ✅ Ready for thesis defense! 🎉

---

_Last Updated: November 2, 2025_  
_AutoPulse Vehicle Diagnostic System_
