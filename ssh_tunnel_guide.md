# 🔌 SSH Tunnel Access Guide

## For Headless Raspberry Pi Setup

Since your Raspberry Pi doesn't have a display, use SSH tunneling to access the dashboard from your Mac.

---

## 📋 **QUICK START**

### **On Your Mac Terminal:**

```bash
ssh -L 3000:localhost:3000 -L 5000:localhost:5000 rocketeers@raspberrypi.local
```

Then open your browser on Mac:

```
http://localhost:3000
```

**That's it!** ✅

---

## 🔍 **What This Does:**

The SSH tunnel command creates "portals" from your Mac to the Pi:

- **Port 3000**: React Dashboard (Frontend)
- **Port 5000**: Flask API (Backend)

When you access `localhost:3000` on your Mac, it's **actually** accessing the Pi's port 3000 through the secure SSH tunnel.

---

## 📝 **Step-by-Step Instructions:**

### **1. Open Terminal on Your Mac**

### **2. Create SSH Tunnel**

```bash
ssh -L 3000:localhost:3000 -L 5000:localhost:5000 rocketeers@raspberrypi.local
```

You'll be logged into the Pi. **Keep this terminal window open!**

### **3. Open Browser on Mac**

Go to: `http://localhost:3000`

### **4. Log In**

Use your AutoPulse credentials

### **5. See Real-Time Data!**

The dashboard will show live data from your car's OBD scanner

---

## ⚠️ **IMPORTANT:**

- **Keep the SSH terminal open** - closing it breaks the tunnel
- **If you close it**, just run the command again
- **If connection drops**, reconnect and refresh your browser

---

## 🔧 **Alternative: One-Line Connection**

Create an alias on your Mac for easier access. Add to `~/.zshrc` or `~/.bash_profile`:

```bash
alias autopulse='ssh -L 3000:localhost:3000 -L 5000:localhost:5000 rocketeers@raspberrypi.local'
```

Then just run:

```bash
autopulse
```

---

## 🚗 **Testing in Your Car:**

1. **Connect OBD scanner to car**
2. **Pair Raspberry Pi with OBD scanner** (Bluetooth)
3. **Start data collection** (auto-starts if enabled)
4. **From your Mac**: Run SSH tunnel
5. **Open browser**: `http://localhost:3000`
6. **Watch real-time data!** 🎉

---

## 🛠️ **Troubleshooting:**

### **"Connection refused" when accessing localhost:3000**

- Make sure SSH tunnel is active
- Check that React is running on Pi: `ps aux | grep react-scripts`

### **"No route to host" when SSH connecting**

- Raspberry Pi might be off or not connected
- Try: `ping raspberrypi.local`

### **SSH tunnel disconnects**

Use autossh for persistent tunnel:

```bash
autossh -M 0 -L 3000:localhost:3000 -L 5000:localhost:5000 rocketeers@raspberrypi.local
```

### **Can't reach raspberrypi.local**

Use IP address instead:

```bash
ssh -L 3000:localhost:3000 -L 5000:localhost:5000 rocketeers@192.168.1.100
```

---

## 💡 **Pro Tips:**

1. **Multiple terminals**: Keep SSH tunnel in one terminal, work in another
2. **Background tunnel**: Add `-f -N` to run in background (but harder to stop)
3. **Check services**: While SSH'd in, run `./check_system.sh` to verify everything

---

## 📊 **What You'll See:**

Once connected, your Mac's browser will show:

- ✅ Real-time RPM, Speed, Temperature
- ✅ Engine diagnostics
- ✅ ML health predictions
- ✅ Live alerts and warnings
- ✅ All data from your car's computer!

---

**Enjoy your wireless, headless car diagnostic system!** 🚀🚗
