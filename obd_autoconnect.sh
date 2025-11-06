#!/bin/bash

# AutoPulse OBD Auto-Connect Script
# Automatically connects OBD scanner on system boot and when needed

OBD_MAC="00:1D:A5:68:98:8A"
RFCOMM_DEVICE="/dev/rfcomm0"
LOG_FILE="/home/rocketeers/autopulse_logs/obd_autoconnect.log"

# Logging function
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if OBD is connected
check_obd_connection() {
    if [ -c "$RFCOMM_DEVICE" ]; then
        # Test actual communication
        python3 -c "
import serial
try:
    ser = serial.Serial('$RFCOMM_DEVICE', 38400, timeout=2)
    ser.write(b'ATI\\r')
    response = ser.read(20)
    ser.close()
    exit(0 if response else 1)
except:
    exit(1)
" 2>/dev/null
        return $?
    fi
    return 1
}

# Connect OBD scanner
connect_obd() {
    log_message "Attempting to connect OBD scanner..."
    
    # First, ensure Bluetooth is powered on
    bluetoothctl power on 2>/dev/null
    sleep 2
    
    # Connect via Bluetooth
    bluetoothctl connect "$OBD_MAC" 2>/dev/null
    sleep 3
    
    # Create rfcomm serial device
    if [ ! -c "$RFCOMM_DEVICE" ]; then
        sudo rfcomm bind 0 "$OBD_MAC" 2>/dev/null
        sleep 2
    fi
    
    # Verify connection
    if check_obd_connection; then
        log_message "✅ OBD scanner connected successfully at $RFCOMM_DEVICE"
        return 0
    else
        log_message "❌ Failed to establish OBD communication"
        return 1
    fi
}

# Main execution
main() {
    log_message "OBD Auto-Connect Service Starting..."
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Wait for Bluetooth service to be ready
    for i in {1..30}; do
        if systemctl is-active --quiet bluetooth; then
            break
        fi
        log_message "Waiting for Bluetooth service... ($i/30)"
        sleep 2
    done
    
    # Try to connect OBD (with retries)
    for attempt in {1..5}; do
        log_message "Connection attempt $attempt/5..."
        
        if check_obd_connection; then
            log_message "✅ OBD already connected and working"
            exit 0
        fi
        
        if connect_obd; then
            log_message "✅ OBD connection established successfully"
            exit 0
        fi
        
        log_message "Attempt $attempt failed, waiting 10 seconds..."
        sleep 10
    done
    
    log_message "❌ Failed to connect OBD scanner after 5 attempts"
    exit 1
}

# Handle different command line options
case "${1:-auto}" in
    "connect"|"auto")
        main
        ;;
    "check")
        if check_obd_connection; then
            echo "✅ OBD connected and responding"
            exit 0
        else
            echo "❌ OBD not connected or not responding"
            exit 1
        fi
        ;;
    "disconnect")
        log_message "Disconnecting OBD scanner..."
        sudo rfcomm release 0 2>/dev/null
        bluetoothctl disconnect "$OBD_MAC" 2>/dev/null
        log_message "✅ OBD disconnected"
        ;;
    *)
        echo "Usage: $0 [connect|check|disconnect]"
        echo "  connect    - Connect OBD scanner (default)"
        echo "  check      - Check if OBD is connected"
        echo "  disconnect - Disconnect OBD scanner"
        exit 1
        ;;
esac
