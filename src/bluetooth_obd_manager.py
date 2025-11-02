#!/usr/bin/env python3
"""
Bluetooth OBD-II Connection Manager
Automatically handles rfcomm binding and connection management for OBD-II adapters
"""

import os
import subprocess
import logging
import time
from pathlib import Path

class BluetoothOBDManager:
    """Smart manager for Bluetooth OBD-II adapter connections"""
    
    def __init__(self, mac_address="00:1D:A5:68:98:8A", rfcomm_device="/dev/rfcomm0", rfcomm_port=0):
        self.mac_address = mac_address
        self.rfcomm_device = rfcomm_device
        self.rfcomm_port = rfcomm_port
        self.logger = logging.getLogger(__name__)
        
    def is_rfcomm_device_available(self):
        """Check if the rfcomm device exists and is accessible"""
        try:
            return Path(self.rfcomm_device).exists()
        except Exception as e:
            self.logger.debug(f"Error checking rfcomm device: {e}")
            return False
    
    def is_adapter_paired(self):
        """Check if the OBD adapter is already paired"""
        try:
            result = subprocess.run(
                ["bluetoothctl", "info", self.mac_address],
                capture_output=True,
                text=True,
                timeout=10
            )
            return "Paired: yes" in result.stdout
        except Exception as e:
            self.logger.debug(f"Error checking pairing status: {e}")
            return False
    
    def bind_rfcomm_device(self):
        """Bind the Bluetooth OBD adapter to rfcomm device"""
        try:
            # First, try to release any existing binding
            subprocess.run(
                ["sudo", "rfcomm", "release", str(self.rfcomm_port)],
                capture_output=True,
                timeout=5
            )
            
            # Now bind the device
            result = subprocess.run(
                ["sudo", "rfcomm", "bind", str(self.rfcomm_port), self.mac_address],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                self.logger.info(f"Successfully bound OBD adapter to {self.rfcomm_device}")
                return True
            else:
                self.logger.error(f"Failed to bind rfcomm device: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.logger.error("Timeout while binding rfcomm device")
            return False
        except Exception as e:
            self.logger.error(f"Error binding rfcomm device: {e}")
            return False
    
    def ensure_connection(self, max_retries=3):
        """
        Ensure OBD adapter connection is ready for use
        Returns tuple: (success: bool, message: str)
        """
        for attempt in range(max_retries):
            # Check if rfcomm device already exists
            if self.is_rfcomm_device_available():
                return True, f"OBD connection ready at {self.rfcomm_device}"
            
            # Check if adapter is paired
            if not self.is_adapter_paired():
                return False, f"OBD adapter {self.mac_address} is not paired. Please pair it first using bluetoothctl."
            
            # Try to bind the device
            self.logger.info(f"Attempt {attempt + 1}: Binding OBD adapter to {self.rfcomm_device}")
            if self.bind_rfcomm_device():
                # Give it a moment to initialize
                time.sleep(1)
                
                if self.is_rfcomm_device_available():
                    return True, f"Successfully connected OBD adapter at {self.rfcomm_device}"
            
            if attempt < max_retries - 1:
                self.logger.info(f"Retrying in 2 seconds...")
                time.sleep(2)
        
        return False, f"Failed to establish OBD connection after {max_retries} attempts"
    
    def test_communication(self):
        """Test basic communication with the OBD adapter"""
        try:
            import serial
            
            with serial.Serial(self.rfcomm_device, baudrate=38400, timeout=3) as ser:
                # Send ATI (identify) command
                ser.write(b'ATI\r')
                time.sleep(1)
                response = ser.read(ser.in_waiting or 50)
                
                if b'ELM327' in response:
                    return True, f"OBD adapter responding: {response.decode('ascii', errors='ignore').strip()}"
                else:
                    return False, f"Unexpected response: {response}"
                    
        except ImportError:
            return False, "pyserial not installed. Install with: pip install pyserial"
        except Exception as e:
            return False, f"Communication test failed: {e}"
    
    def get_connection_status(self):
        """Get detailed connection status"""
        status = {
            'paired': self.is_adapter_paired(),
            'rfcomm_available': self.is_rfcomm_device_available(),
            'mac_address': self.mac_address,
            'device_path': self.rfcomm_device
        }
        
        if status['rfcomm_available']:
            comm_success, comm_msg = self.test_communication()
            status['communication'] = comm_success
            status['test_message'] = comm_msg
        else:
            status['communication'] = False
            status['test_message'] = "rfcomm device not available"
            
        return status

def ensure_obd_connection(mac_address="00:1D:A5:68:98:8A", verbose=True):
    """
    Convenience function to ensure OBD connection is ready
    Returns tuple: (success: bool, rfcomm_device: str, message: str)
    """
    manager = BluetoothOBDManager(mac_address)
    
    if verbose:
        print("🔍 Checking OBD-II adapter connection...")
    
    success, message = manager.ensure_connection()
    
    if verbose:
        if success:
            print(f"✅ {message}")
        else:
            print(f"❌ {message}")
    
    return success, manager.rfcomm_device, message

if __name__ == "__main__":
    # Test the connection manager
    import sys
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    print("🚗 Bluetooth OBD-II Connection Manager")
    print("=" * 50)
    
    manager = BluetoothOBDManager()
    
    # Get detailed status
    status = manager.get_connection_status()
    print(f"MAC Address: {status['mac_address']}")
    print(f"Device Path: {status['device_path']}")
    print(f"Paired: {'✅' if status['paired'] else '❌'}")
    print(f"rfcomm Available: {'✅' if status['rfcomm_available'] else '❌'}")
    print(f"Communication: {'✅' if status['communication'] else '❌'}")
    print(f"Test Result: {status['test_message']}")
    
    if not status['communication']:
        print("\n🔧 Attempting to establish connection...")
        success, message = manager.ensure_connection()
        if success:
            print(f"✅ {message}")
            # Test again
            comm_success, comm_msg = manager.test_communication()
            print(f"Communication Test: {'✅' if comm_success else '❌'} {comm_msg}")
        else:
            print(f"❌ {message}")
            sys.exit(1)
