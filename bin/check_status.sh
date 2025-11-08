#!/bin/bash

# Simple Status Check Script for AutoPulse System

echo "🚗 AutoPulse System Status Check"
echo "================================"

# Check system services
echo "📊 System Services:"
echo -n "  • AutoPulse Service: "
if systemctl is-active --quiet autopulse.service 2>/dev/null; then
    echo "✅ Running"
else
    echo "❌ Stopped"
fi

echo -n "  • OBD Auto-Connect: "
if systemctl is-active --quiet obd-autoconnect.service 2>/dev/null; then
    echo "✅ Active"
else
    echo "❌ Inactive"
fi

# Check OBD connection
echo ""
echo "🔌 OBD Scanner Status:"
echo -n "  • Bluetooth Pairing: "
if bluetoothctl devices Paired | grep -q "00:1D:A5:68:98:8A"; then
    echo "✅ Paired"
else
    echo "❌ Not paired"
fi

echo -n "  • Serial Device: "
if [ -c "/dev/rfcomm0" ]; then
    echo "✅ /dev/rfcomm0"
else
    echo "❌ Missing"
fi

# Check network
echo ""
echo "🌐 Network Status:"
echo -n "  • Internet: "
if ping -c 1 google.com &> /dev/null; then
    echo "✅ Connected"
else
    echo "❌ No connection"
fi

# Check virtual environment
echo ""
echo "🐍 Python Environment:"
echo -n "  • Virtual Env: "
if [ -d ".venv" ]; then
    echo "✅ Ready"
else
    echo "❌ Missing"
fi

# Show quick commands
echo ""
echo "🔧 Quick Commands:"
echo "  ./quick_obd_test.sh        - Test OBD connection"
echo "  ./obd_live_data.sh         - Show live vehicle data"
echo "  ./setup_obd_connection.sh  - Fix OBD connection"
echo "  sudo reboot                - Restart system"

# Show system info
echo ""
echo "💻 System Info:"
echo "  • Uptime: $(uptime -p)"
echo "  • Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "  • Memory: $(free -h | awk '/^Mem:/ {print $3"/"$2}')"
echo "  • Disk: $(df -h / | awk 'NR==2 {print $3"/"$2" ("$5" used)"}')"

echo ""
echo "✨ System ready for vehicle diagnostics!"
