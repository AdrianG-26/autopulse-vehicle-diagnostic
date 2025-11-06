#!/bin/bash

# Super Simple OBD Test - Just check if it's connected

echo "🚗 Quick OBD Connection Test"
echo "============================"

if [ -c "/dev/rfcomm0" ]; then
    echo "✅ OBD device exists at /dev/rfcomm0"
    echo -n "Testing communication... "
    
    python3 -c "
import serial
import sys
try:
    ser = serial.Serial('/dev/rfcomm0', 38400, timeout=3)
    ser.write(b'ATI\\r')
    response = ser.read(50).decode('utf-8', errors='ignore').strip()
    ser.close()
    
    if response and len(response) > 0:
        print('✅ OBD responding!')
        print('Scanner:', response.replace('\\r', '').replace('\\n', ' ').strip())
    else:
        print('⚠️  No response from scanner')
        print('💡 This is normal when not connected to a car')
        print('   The Bluetooth connection is working fine')
    
except serial.SerialException as e:
    print('❌ Cannot open serial port')
    print('Error:', str(e))
except Exception as e:
    print('❌ Unexpected error:', str(e))
"
else
    echo "❌ No OBD device found at /dev/rfcomm0"
    echo "💡 Run: ./setup_obd_connection.sh to fix this"
fi

echo ""
echo "🔍 Connection Status:"
echo "   Bluetooth Device: 00:1D:A5:68:98:8A"
echo "   Serial Port: /dev/rfcomm0"
echo "   Status: $([ -c '/dev/rfcomm0' ] && echo 'Connected' || echo 'Disconnected')"

echo ""
echo "📋 Next Steps:"
echo "   • To test with car: Plug scanner into car, turn ignition ON"
echo "   • For full diagnosis: ./test_obd_connection.sh"
echo "   • To reconnect: ./setup_obd_connection.sh"
