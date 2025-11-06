#!/bin/bash

# Simple OBD Live Data Display Script
# Shows real-time vehicle data in terminal

RFCOMM_DEVICE="/dev/rfcomm0"

echo "🚗 OBD Live Data Monitor"
echo "======================="

# Check if OBD device exists
if [ ! -c "$RFCOMM_DEVICE" ]; then
    echo "❌ OBD device not found at $RFCOMM_DEVICE"
    echo "💡 Run: ./setup_obd_connection.sh"
    exit 1
fi

echo "📡 Connecting to vehicle..."
echo "Press Ctrl+C to stop"
echo ""

# Python script for live OBD data
python3 << 'PYTHON_EOF'
import serial
import time
import sys
import signal

class OBDReader:
    def __init__(self, port='/dev/rfcomm0', baudrate=38400):
        self.port = port
        self.baudrate = baudrate
        self.ser = None
        self.running = True
        
    def connect(self):
        try:
            self.ser = serial.Serial(self.port, self.baudrate, timeout=3)
            time.sleep(2)  # Wait for connection
            
            # Initialize ELM327
            self.send_command('ATZ')      # Reset
            time.sleep(1)
            self.send_command('ATE0')     # Echo off
            self.send_command('ATL0')     # Linefeeds off
            self.send_command('ATS0')     # Spaces off
            self.send_command('ATH0')     # Headers off
            self.send_command('ATSP0')    # Auto protocol
            
            print("✅ Connected to vehicle!")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    def send_command(self, cmd):
        try:
            self.ser.write((cmd + '\r').encode())
            response = self.ser.read(50).decode('utf-8', errors='ignore').strip()
            return response.replace('>', '').strip()
        except:
            return ""
    
    def get_pid_data(self, pid, name, formula=None):
        try:
            response = self.send_command(f'01{pid}')
            if response and len(response) >= 6:
                # Extract data bytes (skip mode and PID)
                data = response.replace(' ', '')[4:]  # Remove spaces and header
                if len(data) >= 2:
                    if formula:
                        value = formula(data)
                    else:
                        value = int(data[:2], 16)
                    return f"{name}: {value}"
                else:
                    return f"{name}: --"
            else:
                return f"{name}: No data"
        except:
            return f"{name}: Error"
    
    def display_live_data(self):
        if not self.connect():
            return
        
        # Signal handler for graceful exit
        def signal_handler(sig, frame):
            self.running = False
            print("\n�� Stopping OBD monitor...")
        
        signal.signal(signal.SIGINT, signal_handler)
        
        print("\n🔄 Reading live data...\n")
        
        while self.running:
            try:
                # Clear screen and move cursor to top
                print('\033[H\033[J', end='')
                
                print("🚗 OBD Live Data Monitor")
                print("=" * 40)
                print(f"⏰ {time.strftime('%H:%M:%S')}")
                print()
                
                # Engine RPM (PID 0C)
                rpm_data = self.get_pid_data('0C', 'Engine RPM', 
                    lambda data: f"{int(data[:4], 16) / 4:.0f} rpm" if len(data) >= 4 else "-- rpm")
                print(f"🔄 {rpm_data}")
                
                # Vehicle Speed (PID 0D) 
                speed_data = self.get_pid_data('0D', 'Speed', 
                    lambda data: f"{int(data[:2], 16)} km/h")
                print(f"🏎️  {speed_data}")
                
                # Engine Coolant Temperature (PID 05)
                temp_data = self.get_pid_data('05', 'Engine Temp', 
                    lambda data: f"{int(data[:2], 16) - 40}°C")
                print(f"🌡️  {temp_data}")
                
                # Throttle Position (PID 11)
                throttle_data = self.get_pid_data('11', 'Throttle', 
                    lambda data: f"{int(data[:2], 16) * 100 / 255:.1f}%")
                print(f"⚡ {throttle_data}")
                
                # Engine Load (PID 04)
                load_data = self.get_pid_data('04', 'Engine Load', 
                    lambda data: f"{int(data[:2], 16) * 100 / 255:.1f}%")
                print(f"📊 {load_data}")
                
                # Intake Air Temperature (PID 0F)
                air_temp_data = self.get_pid_data('0F', 'Air Temp', 
                    lambda data: f"{int(data[:2], 16) - 40}°C")
                print(f"💨 {air_temp_data}")
                
                print()
                print("💡 Press Ctrl+C to stop monitoring")
                print("🔗 Device: /dev/rfcomm0")
                
                time.sleep(1)  # Update every second
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"❌ Error reading data: {e}")
                time.sleep(2)
        
        if self.ser:
            self.ser.close()
        print("✅ Disconnected from vehicle")

# Start the OBD reader
if __name__ == "__main__":
    reader = OBDReader()
    reader.display_live_data()

PYTHON_EOF
