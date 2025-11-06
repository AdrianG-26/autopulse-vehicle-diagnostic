#!/bin/bash

echo "🔍 AutoPulse OBD Setup Status Check"
echo "=================================="

# Check if Bluetooth is working
echo -n "Bluetooth Service: "
if systemctl is-active --quiet bluetooth; then
    echo "✅ Active"
else
    echo "❌ Not running"
fi

# Check OBD pairing
echo -n "OBD Scanner Paired: "
if bluetoothctl devices Paired | grep -q "00:1D:A5:68:98:8A"; then
    echo "✅ Paired (00:1D:A5:68:98:8A)"
else
    echo "❌ Not paired"
fi

# Check rfcomm device
echo -n "Serial Device: "
if [ -c "/dev/rfcomm0" ]; then
    echo "✅ /dev/rfcomm0 exists"
else
    echo "❌ /dev/rfcomm0 missing"
fi

# Check auto-connect service
echo -n "Auto-Connect Service: "
if systemctl is-enabled --quiet obd-autoconnect.service; then
    if systemctl is-active --quiet obd-autoconnect.service; then
        echo "✅ Enabled and running"
    else
        echo "⚠️ Enabled but not active"
    fi
else
    echo "❌ Not enabled"
fi

# Check user permissions
echo -n "User Permissions: "
if groups | grep -q dialout; then
    echo "✅ User in dialout group"
else
    echo "❌ User not in dialout group"
fi

echo ""
echo "📋 Quick Commands:"
echo "   ./setup_obd_connection.sh  - Reconnect OBD device"
echo "   ./obd_autoconnect.sh check - Test OBD communication (needs car)"
echo "   sudo systemctl restart obd-autoconnect.service - Restart auto-connect"

echo ""
echo "🚗 To use: Plug OBD scanner into car, turn on ignition, then run your diagnostic scripts!"
