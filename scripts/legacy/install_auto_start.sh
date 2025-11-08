#!/bin/bash
###############################################################################
# 🚀 ONE-CLICK INSTALLATION SCRIPT
# Sets up complete auto-start system for vehicle diagnostics
###############################################################################

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🚗 VEHICLE DIAGNOSTIC SYSTEM - AUTO-START INSTALLATION      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Please run WITHOUT sudo (script will ask for password when needed)"
   exit 1
fi

# Confirm installation
echo "This will install the vehicle diagnostic system to auto-start on boot."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Installing systemd service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy service file
sudo cp vehicle-diagnostic.service /etc/systemd/system/
echo "✅ Service file copied"

# Reload systemd
sudo systemctl daemon-reload
echo "✅ Systemd reloaded"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Enabling auto-start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Enable service
sudo systemctl enable vehicle-diagnostic
echo "✅ Auto-start enabled (will start on boot)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Starting service now"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start service
sudo systemctl start vehicle-diagnostic
echo "✅ Service started"

# Wait a moment
sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Verifying installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check status
if sudo systemctl is-active --quiet vehicle-diagnostic; then
    echo "✅ Service is running!"
else
    echo "❌ Service failed to start"
    echo ""
    echo "Check logs with: sudo journalctl -u vehicle-diagnostic -n 50"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🎉 INSTALLATION COMPLETE!                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Your vehicle diagnostic system is now installed and running!"
echo ""
echo "📋 What happens now:"
echo "   1. System auto-starts when RPI boots"
echo "   2. Waits for OBD scanner connection"
echo "   3. Auto-detects car and starts collection"
echo "   4. ML predictions run in real-time"
echo "   5. Data streams live to Autopulse"
echo ""
echo "🛠️  Management commands:"
echo "   • Check status:  sudo systemctl status vehicle-diagnostic"
echo "   • View logs:     sudo journalctl -u vehicle-diagnostic -f"
echo "   • Stop service:  sudo systemctl stop vehicle-diagnostic"
echo "   • Restart:       sudo systemctl restart vehicle-diagnostic"
echo "   • Disable:       sudo systemctl disable vehicle-diagnostic"
echo ""
echo "📊 Access your dashboard:"
echo "   • Web Interface: http://localhost:3000"
echo "   • API Endpoint:  http://localhost:5000"
echo "   • WebSocket:     ws://localhost:8080"
echo ""
echo "🚗 Next steps:"
echo "   1. Turn on your car"
echo "   2. Connect OBD scanner to diagnostic port"
echo "   3. Open http://localhost:3000 to view live data"
echo ""
echo "✅ Ready to use! Enjoy your automated vehicle diagnostic system!"
echo ""
