#!/usr/bin/env python3
"""
🔄 Cloud-First Vehicle Data Collection Daemon
==========================================
Enhanced version that stores data directly to Supabase cloud database
instead of local SQLite, enabling real-time cloud ML processing.
"""

import obd
import time
import signal
import sys
import os
from datetime import datetime, timezone
from threading import Thread, Event
import logging
from collections import deque
import hashlib

# Import cloud storage
try:
    from supabase_direct_storage import supabase_storage
    CLOUD_STORAGE_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Cloud storage unavailable: {e}")
    CLOUD_STORAGE_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CloudVehicleCollector:
    """Cloud-first vehicle data collector for Supabase"""
    
    def __init__(self, session_id=None):
        self.session_id = session_id or self.generate_session_id()
        self.current_vehicle_id = None
        self.connection = None
        self.data_buffer = deque(maxlen=100)
        self.batch_size = 20
        self.collection_interval = 2.0
        self.running = Event()
        
        self.logger = logging.getLogger(f'CloudCollector-{self.session_id[:8]}')
        
        # Validate cloud storage
        if not CLOUD_STORAGE_AVAILABLE or not supabase_storage.is_connected:
            self.logger.error("❌ Cloud storage not available")
            sys.exit(1)
        
        self.logger.info(f"🔄 Cloud Collector initialized - Session: {self.session_id}")
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def generate_session_id(self):
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
        hash_part = hashlib.md5(f"{timestamp}_{time.time()}".encode()).hexdigest()[:8]
        return f"cloud_{timestamp}_{hash_part}"
    
    def _signal_handler(self, signum, frame):
        self.logger.info(f"📡 Received signal {signum}, shutting down...")
        self.stop_collection()
    
    def detect_and_setup_vehicle(self):
        """Detect vehicle and setup cloud profile"""
        try:
            # Mock OBD connection for demo
            self.connection = True  # Simplified for demo
            
            car_signature = f"demo_vehicle_{int(time.time())}"
            vehicle_data = {
                'display_name': f'Demo Vehicle {car_signature[:8]}',
                'make': 'Toyota',
                'model': 'Demo',
                'year': 2020,
                'fuel_type': 'Gasoline'
            }
            
            self.current_vehicle_id = supabase_storage.get_or_create_vehicle_profile(
                car_signature, vehicle_data
            )
            
            if self.current_vehicle_id:
                self.logger.info(f"✅ Vehicle setup complete - ID: {self.current_vehicle_id}")
                return True
            else:
                self.logger.error("❌ Failed to setup vehicle profile")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Vehicle detection failed: {e}")
            return False
    
    def read_obd_data(self):
        """Read OBD sensor data (demo version)"""
        if not self.connection:
            return None
            
        import random
        
        # Generate realistic demo data
        data = {
            'rpm': random.randint(800, 3500),
            'speed': random.randint(0, 70),
            'coolant_temp': random.randint(85, 105),
            'engine_load': random.randint(15, 85),
            'throttle_pos': random.randint(0, 50),
            'fuel_level': random.randint(25, 100),
            'data_quality': random.randint(85, 95),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return data
    
    def data_collection_loop(self):
        """Main data collection loop"""
        self.logger.info("🔄 Starting cloud data collection...")
        
        while self.running.is_set():
            try:
                sensor_data = self.read_obd_data()
                
                if sensor_data:
                    self.data_buffer.append(sensor_data)
                    
                    if len(self.data_buffer) >= self.batch_size:
                        self.upload_batch_to_cloud()
                
                time.sleep(self.collection_interval)
                
            except Exception as e:
                self.logger.error(f"Collection loop error: {e}")
                time.sleep(5)
    
    def upload_batch_to_cloud(self):
        """Upload batch of data to Supabase"""
        if not self.data_buffer or not self.current_vehicle_id:
            return
            
        try:
            batch_data = list(self.data_buffer)
            
            success = supabase_storage.store_sensor_data_batch(
                self.current_vehicle_id, batch_data
            )
            
            if success:
                self.logger.info(f"☁️ Uploaded {len(batch_data)} readings to cloud")
                self.data_buffer.clear()
            else:
                self.logger.warning("⚠️ Failed to upload batch to cloud")
                
        except Exception as e:
            self.logger.error(f"Batch upload error: {e}")
    
    def start_collection(self):
        """Start cloud data collection"""
        if not self.detect_and_setup_vehicle():
            return False
        
        self.running.set()
        
        collection_thread = Thread(target=self.data_collection_loop)
        collection_thread.start()
        
        self.logger.info("🚀 Cloud collection started successfully")
        return True
    
    def stop_collection(self):
        """Stop collection and upload remaining data"""
        self.logger.info("🛑 Stopping cloud collection...")
        self.running.clear()
        
        if self.data_buffer:
            self.upload_batch_to_cloud()
        
        self.logger.info("✅ Cloud collection stopped")

def main():
    collector = CloudVehicleCollector()
    
    try:
        if collector.start_collection():
            print("🔄 Cloud collector running... Press Ctrl+C to stop")
            
            while collector.running.is_set():
                time.sleep(1)
        else:
            print("❌ Failed to start cloud collection")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    finally:
        collector.stop_collection()

if __name__ == "__main__":
    main()
