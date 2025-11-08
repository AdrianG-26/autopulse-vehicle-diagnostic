#!/bin/bash

# Simple OBD Scanner Connection Test Script
# Tests Bluetooth connection and OBD communication

OBD_MAC="00:1D:A5:68:98:8A"
RFCOMM_DEVICE="/dev/rfcomm0"

echo "🔍 Testing OBD Scanner Connection..."
echo "==================================="

# Test 1: Check Bluetooth pairing
echo -n "1. Bluetooth Pairing: "
if bluetoothctl devices Paired | grep -q "$OBD_MAC"; then
    echo "✅ OBD scanner is paired"
else
    echo "❌ OBD scanner not paired"
    exit 1
fi

# Test 2: Check Bluetooth connection status
echo -n "2. Bluetooth Connection: "
BT_STATUS=$(bluetoothctl info $OBD_MAC | grep "Connected:" | awk '{print $2}')
if [ "$BT_STATUS" = "yes" ]; then
    echo "✅ Bluetooth connected"
elif [ "$BT_STATUS" = "no" ]; then
    echo "⚠️  Not connected - attempting to connect..."
    bluetoothctl connect $OBD_MAC 2>/dev/null
    sleep 2
    BT_STATUS=$(bluetoothctl info $OBD_MAC | grep "Connected:" | awk '{print $2}')
    if [ "$BT_STATUS" = "yes" ]; then
        echo "   ✅ Connected successfully"
    else
        echo "   ❌ Failed to connect"
    fi
else
    echo "❌ Cannot determine Bluetooth status"
fi

# Test 3: Check serial device
echo -n "3. Serial Device: "
if [ -c "$RFCOMM_DEVICE" ]; then
    echo "✅ $RFCOMM_DEVICE exists"
else
    echo "❌ $RFCOMM_DEVICE missing - creating..."
    sudo rfcomm bind 0 $OBD_MAC 2>/dev/null
    sleep 2
    if [ -c "$RFCOMM_DEVICE" ]; then
        echo "   ✅ Created successfully"
    else
        echo "   ❌ Failed to create serial device"
        exit 1
    fi
fi

# Test 4: Test OBD communication (requires car to be on)
echo -n "4. OBD Communication: "
timeout 5 python3 -c "
import serial
import sys
try:
    ser = serial.Serial('$RFCOMM_DEVICE', 38400, timeout=3)
    ser.write(b'ATI\\r')
    response = ser.read(50).decode('utf-8', errors='ignore').strip()
    ser.close()
    if response and len(response) > 0:
        print('✅ OBD responding:', response[:30] + ('...' if len(response) > 30 else ''))
        sys.exit(0)
    else:
        print('⚠️  No response (car may be off)')
        sys.exit(2)
except Exception as e:
    print('❌ Communication failed:', str(e)[:50])
    sys.exit(1)
" 2>/dev/null

OBD_TEST_RESULT=$?

if [ $OBD_TEST_RESULT -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS: OBD scanner is fully connected and responding!"
elif [ $OBD_TEST_RESULT -eq 2 ]; then
    echo ""
    echo "⚠️  PARTIAL: OBD setup is correct, but no response from car"
    echo "   💡 Make sure:"
    echo "      - OBD scanner is plugged into car's diagnostic port"
    echo "      - Car ignition is turned ON"
    echo "      - Wait a few seconds after turning on ignition"
else
    echo ""
    echo "❌ FAILED: OBD communication not working"
    echo "   💡 Try:"
    echo "      - ./setup_obd_connection.sh"
    echo "      - sudo systemctl restart obd-autoconnect.service"
fi

echo ""
echo "📊 Connection Details:"
echo "   MAC Address: $OBD_MAC"
echo "   Device: $RFCOMM_DEVICE"
echo "   Baud Rate: 38400"

# Show quick commands
echo ""
echo "🔧 Quick Commands:"
echo "   ./setup_obd_connection.sh     - Reconnect OBD device"
echo "   ./check_obd_setup.sh          - Full system status"
echo "   ls -la /dev/rfcomm*            - Check serial devices"
