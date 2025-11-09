#!/usr/bin/env python3
"""
🚀 Professional Cloud Vehicle Data Collector  
Stores OBD-II data directly to Supabase with professional logging
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

# Add parent directory for imports
sys.path.insert(0, os.path.dirname(__file__))

# Import cloud storage
try:
    from supabase_direct_storage import supabase_storage
    CLOUD_STORAGE_AVAILABLE = True
except ImportError as e:
    print(f"❌ Cloud storage unavailable: {e}")
    sys.exit(1)

# Professional logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/cloud_collector.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class ProfessionalCloudCollector:
    """Professional cloud-first vehicle data collector"""
    
    def __init__(self):
        self.session_id = self._generate_session_id()
        self.current_vehicle_id = None
        self.vehicle_name = None
        self.connection = None
        self.supported_commands = set()
        self.data_buffer = deque(maxlen=100)
        self.batch_size = 10
        self.collection_interval = 1.0
        self.running = Event()
        
        # Statistics
        self.session_stats = {
            'total_readings': 0,
            'successful_readings': 0,
            'stored_records': 0,
            'errors': 0,
            'start_time': None
        }
        
        # State tracking for calculated features
        self.prev_temp = None
        self.prev_temp_time = None
        
        # Validate cloud storage
        if not CLOUD_STORAGE_AVAILABLE or not supabase_storage.is_connected:
            logger.error("❌ Cloud storage not available")
            sys.exit(1)
        
        logger.info(f"🚀 Cloud Collector initialized - Session: {self.session_id}")
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _generate_session_id(self):
        """Generate unique session identifier"""
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
        hash_part = hashlib.md5(f"{timestamp}_{time.time()}".encode()).hexdigest()[:8]
        return f"cloud_{timestamp}_{hash_part}"
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"📡 Received signal {signum}, shutting down...")
        self.stop_collection()
        sys.exit(0)
    
    def connect_obd(self, max_attempts=3):
        """Connect to OBD-II adapter with retries"""
        logger.info("🔌 Connecting to OBD-II adapter...")
        
        # Try USB/Bluetooth ports (USB first for stability)
        ports = ['/dev/rfcomm0', '/dev/ttyACM0', '/dev/ttyUSB0', '/dev/ttyUSB1']  # Bluetooth first, then USB
        
        for attempt in range(1, max_attempts + 1):
            for port in ports:
                if not os.path.exists(port):
                    continue
                
                logger.info(f"   Attempt {attempt}/{max_attempts} on {port}...")
                
                try:
                    self.connection = obd.OBD(port, fast=False, timeout=10)
                    
                    if self.connection.is_connected():
                        scanner_type = "Bluetooth OBD" if "rfcomm" in port else "USB OBD"
                        logger.info(f"✅ Connected to OBD-II on {port} ({scanner_type})")
                        self.supported_commands = set(self.connection.supported_commands)
                        logger.info(f"   Supported commands: {len(self.supported_commands)}")
                        return True
                    
                except Exception as e:
                    logger.debug(f"   Failed: {e}")
            
            if attempt < max_attempts:
                logger.info(f"   Retrying in 5 seconds...")
                time.sleep(5)
        
        logger.error("❌ Could not connect to OBD-II adapter")
        return False
    
    def generate_vehicle_signature(self):
        """Generate unique vehicle identifier from OBD"""
        try:
            signature_components = []
            
            # Use supported commands as fingerprint
            if self.supported_commands:
                cmd_str = ''.join(sorted([str(cmd) for cmd in self.supported_commands]))
                signature_components.append(cmd_str)
            
            # Try to get VIN
            try:
                if obd.commands.VIN in self.supported_commands:
                    response = self.connection.query(obd.commands.VIN)
                    if not response.is_null():
                        vin = str(response.value).strip()
                        if vin and len(vin) == 17:
                            signature_components.append(vin)
                            logger.info(f"🔍 Found VIN: {vin}")
            except:
                pass
            
            # Create hash
            if signature_components:
                signature_string = "|".join(signature_components)
                signature_hash = hashlib.sha256(signature_string.encode()).hexdigest()[:32]
            else:
                # Fallback
                signature_hash = hashlib.md5(f"fallback_{time.time()}".encode()).hexdigest()[:16]
            
            logger.info(f"🔑 Vehicle signature: {signature_hash}")
            return signature_hash
            
        except Exception as e:
            logger.error(f"Error generating signature: {e}")
            return hashlib.md5(f"error_{time.time()}".encode()).hexdigest()[:16]
    
    def detect_and_setup_vehicle(self):
        """Detect vehicle and setup cloud profile with real name"""
        try:
            car_signature = self.generate_vehicle_signature()
            
            # Try to get real vehicle info
            make = "Unknown"
            model = "Unknown"
            year = datetime.now().year
            
            # Try to get VIN and decode
            try:
                if obd.commands.VIN in self.supported_commands:
                    response = self.connection.query(obd.commands.VIN)
                    if not response.is_null():
                        vin = str(response.value).strip()
                        # Simple VIN decoding (3-character WMI)
                        wmi = vin[:3]
                        wmi_map = {
                            '1G1': 'Chevrolet', '1FA': 'Ford', '1HG': 'Honda',
                            '2T1': 'Toyota', '3VW': 'Volkswagen', '4F2': 'Mazda',
                            '5YJ': 'Tesla', 'JHM': 'Honda', 'KMH': 'Hyundai',
                            'WBA': 'BMW', 'WDD': 'Mercedes-Benz'
                        }
                        make = wmi_map.get(wmi, "Unknown")
                        logger.info(f"🚗 Detected make: {make}")
            except:
                pass
            
            # Create display name
            if make != "Unknown":
                self.vehicle_name = f"{make} {model} {year}"
            else:
                self.vehicle_name = f"Vehicle {car_signature[:8]}"
            
            vehicle_data = {
                'display_name': self.vehicle_name,
                'make': make,
                'model': model,
                'year': year,
                'fuel_type': 'Gasoline'
            }
            
            self.current_vehicle_id = supabase_storage.get_or_create_vehicle_profile(
                car_signature, vehicle_data
            )
            
            if self.current_vehicle_id:
                logger.info(f"✅ Vehicle setup complete - ID: {self.current_vehicle_id}, Name: {self.vehicle_name}")
                return True
            else:
                logger.error("❌ Failed to setup vehicle profile")
                return False
                
        except Exception as e:
            logger.error(f"❌ Vehicle detection failed: {e}")
            return False
    
    def read_obd_data(self):
        """Read comprehensive OBD sensor data - EXPANDED with 30 parameters + Auto-labeling"""
        if not self.connection or not self.connection.is_connected():
            return None
        
        data = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'session_id': self.session_id
        }
        
        # ALL OBD COMMANDS (27 raw + 3 special)
        obd_commands = {
            # Core Engine (8)
            'rpm': obd.commands.RPM,
            'speed': obd.commands.SPEED,
            'coolant_temp': obd.commands.COOLANT_TEMP,
            'engine_load': obd.commands.ENGINE_LOAD,
            'intake_temp': obd.commands.INTAKE_TEMP,
            'timing_advance': obd.commands.TIMING_ADVANCE,
            'run_time': obd.commands.RUN_TIME,
            'absolute_load': obd.commands.ABSOLUTE_LOAD,
            
            # Fuel System (7)
            'fuel_level': obd.commands.FUEL_LEVEL,
            'fuel_pressure': obd.commands.FUEL_PRESSURE,
            'throttle_pos': obd.commands.THROTTLE_POS,
            'short_fuel_trim_1': obd.commands.SHORT_FUEL_TRIM_1,
            'long_fuel_trim_1': obd.commands.LONG_FUEL_TRIM_1,
            'short_fuel_trim_2': obd.commands.SHORT_FUEL_TRIM_2,
            'long_fuel_trim_2': obd.commands.LONG_FUEL_TRIM_2,
            
            # Air Intake (3)
            'maf': obd.commands.MAF,
            'intake_pressure': obd.commands.INTAKE_PRESSURE,
            'barometric_pressure': obd.commands.BAROMETRIC_PRESSURE,
            
            # Emissions (3)
            'o2_b1s1': obd.commands.O2_B1S1,
            'o2_b1s2': obd.commands.O2_B1S2,
            'catalyst_temp_b1s1': obd.commands.CATALYST_TEMP_B1S1,
            
            # Environmental (1)
            'ambient_air_temp': obd.commands.AMBIANT_AIR_TEMP,
            
            # Electrical (1)
            'control_module_voltage': obd.commands.CONTROL_MODULE_VOLTAGE,
            
            # Diagnostic (2)
            'distance_w_mil': obd.commands.DISTANCE_W_MIL,
        }
        
        successful_reads = 0
        
        for key, command in obd_commands.items():
            if command in self.supported_commands:
                try:
                    response = self.connection.query(command)
                    if not response.is_null():
                        value = response.value.magnitude if hasattr(response.value, 'magnitude') else float(response.value)
                        data[key] = value
                        if key in ["timing_advance", "run_time", "control_module_voltage", "o2_b1s2"]:
                            logger.info(f"DEBUG: Read {key} = {value}")
                        successful_reads += 1
                except Exception as e:
                    logger.debug(f"Failed {key}: {e}")
                    data[key] = 0
            else:
                data[key] = 0
        
        # DTC Count
        try:
            dtc_resp = self.connection.query(obd.commands.GET_DTC)
            data['dtc_count'] = len(dtc_resp.value) if dtc_resp and not dtc_resp.is_null() and isinstance(dtc_resp.value, list) else 0
        except:
            data['dtc_count'] = 0
        
        # MIL Status
        try:
            status_resp = self.connection.query(obd.commands.STATUS)
            data['mil_status'] = bool(status_resp.value.MIL) if status_resp and not status_resp.is_null() and hasattr(status_resp.value, 'MIL') else False
        except:
            data['mil_status'] = False
        
        # Fuel System Status
        try:
            fuel_resp = self.connection.query(obd.commands.FUEL_STATUS)
            data['fuel_status'] = str(fuel_resp.value) if fuel_resp and not fuel_resp.is_null() else 'Unknown'
        except:
            data['fuel_status'] = 'Unknown'
        
        # AUTO-LABEL HEALTH STATUS
        data['health_status'], data['engine_stress_score'] = self._auto_label_health(data)

        # ========================================
        # CALCULATED/ENGINEERED FEATURES
        # ========================================
        
        # 1. Load/RPM Ratio - measures engine efficiency
        if data.get('rpm') and data['rpm'] > 0:
            data['load_rpm_ratio'] = (data.get('engine_load', 0) / data['rpm']) * 1000
        else:
            data['load_rpm_ratio'] = None
        
        # 2. Temperature Gradient - detects overheating trends (°C/minute)
        current_temp = data.get('coolant_temp')
        import time as time_module
        current_time = time_module.time()
        if current_temp is not None and self.prev_temp is not None and self.prev_temp_time is not None:
            time_delta_minutes = (current_time - self.prev_temp_time) / 60.0
            if time_delta_minutes > 0:
                data['temp_gradient'] = (current_temp - self.prev_temp) / time_delta_minutes
            else:
                data['temp_gradient'] = 0
        else:
            data['temp_gradient'] = None
        # Update previous temperature for next calculation
        self.prev_temp = current_temp
        self.prev_temp_time = current_time
        
        # 3. Fuel Efficiency - computed L/100km (requires MAF sensor)
        maf = data.get('maf')  # Mass Air Flow in g/s
        speed = data.get('speed')  # Speed in km/h
        if maf is not None and speed is not None and speed > 0:
            # Formula: MAF (g/s) × fuel_density (0.75 kg/L) / speed (km/h) / 3600 × 100
            # Simplified: (maf / 1000) / 0.75 / speed × 3600 × 100
            data['fuel_efficiency'] = (maf / 1000 / 0.75 / speed * 3600 * 100)
        else:
            data['fuel_efficiency'] = None
        
        # Quality score
        total = len(obd_commands) + 3
        data['data_quality'] = int((successful_reads / total) * 100)
        
        # Legacy status
        data['status'] = ['NORMAL', 'ADVISORY', 'WARNING', 'CRITICAL'][data['health_status']]
        
        return data if successful_reads > 0 else None
    
    def _auto_label_health(self, data):
        """Enhanced auto-label with engine stress analysis
        
        Uses multi-factor risk scoring based on:
        - Engine mechanical stress (load, RPM, temperature)
        - Electrical system health (voltage)
        - Emissions system (O2, catalyst, fuel trim)
        - Diagnostic codes and MIL status
        
        NOTE: fuel_level removed (unsupported by Toyota Veloz OBD)
        """
        
        # === CRITICAL (3) - Immediate action required ===
        # Severe conditions that can cause engine damage
        if (data.get('coolant_temp', 0) > 110 or              # Severe overheating
            data.get('control_module_voltage', 14) < 11 or     # Battery dying
            data.get('dtc_count', 0) > 10 or                   # Many error codes
            data.get('catalyst_temp_b1s1', 0) > 900 or         # Cat converter failing
            data.get('engine_load', 0) > 95):                  # Extreme engine stress
            return 3, 15  # CRITICAL status, max stress score, 15  # CRITICAL status, max stress score
        
        # === Engine Stress Score Calculation ===
        # Multi-factor analysis for nuanced health assessment
        stress_score = 0
        
        # 1. Engine Load Analysis (most important for wear prediction)
        engine_load = data.get('engine_load', 0)
        if engine_load > 85:
            stress_score += 3  # Very high load (highway, uphill, towing)
        elif engine_load > 70:
            stress_score += 2  # High load (acceleration, climbing)
        elif engine_load > 50:
            stress_score += 1  # Moderate load (normal driving)
        # < 50% = no stress points (idle, coasting)
        
        # 2. RPM vs Load Mismatch (inefficient operation)
        rpm = data.get('rpm', 0)
        if rpm > 3500 and engine_load < 30:
            stress_score += 2  # High RPM but low load = inefficient (revving, wrong gear)
        elif rpm > 4500:
            stress_score += 2  # Very high RPM = engine stress
        
        # 3. Temperature Stress
        coolant_temp = data.get('coolant_temp', 0)
        if coolant_temp > 105:
            stress_score += 3  # Near critical temp
        elif coolant_temp > 100:
            stress_score += 2  # Running hot
        elif coolant_temp > 95:
            stress_score += 1  # Warm but manageable
        
        # 4. Voltage Issues (electrical stress)
        voltage = data.get('control_module_voltage', 14)
        if voltage < 12:
            stress_score += 2  # Low voltage = alternator/battery issue
        elif voltage < 13:
            stress_score += 1  # Slightly low
        elif voltage > 15:
            stress_score += 2  # Overcharging = regulator issue
        
        # 5. Fuel Trim Analysis (combustion efficiency)
        short_trim = abs(data.get('short_fuel_trim_1', 0))
        long_trim = abs(data.get('long_fuel_trim_1', 0))
        if short_trim > 20 or long_trim > 15:
            stress_score += 2  # Significant fuel correction needed
        elif short_trim > 10 or long_trim > 8:
            stress_score += 1  # Minor corrections
        
        # 6. O2 Sensor Health (emissions system)
        o2_voltage = data.get('o2_b1s1', 0.45)
        o2_deviation = abs(o2_voltage - 0.45)
        if o2_deviation > 0.3:
            stress_score += 1  # O2 sensor or mixture issue
        
        # 7. Diagnostic Codes
        dtc_count = data.get('dtc_count', 0)
        if dtc_count >= 3:
            stress_score += 2
        elif dtc_count >= 1:
            stress_score += 1
        
        # 8. MIL Status (Check Engine Light)
        if data.get('mil_status', False):
            stress_score += 2
        
        # 9. Distance with MIL on (ignoring problem)
        if data.get('distance_w_mil', 0) > 50:
            stress_score += 1
        
        # === Risk Classification Based on Total Score ===
        # WARNING (2) - Needs attention soon (score 6-9)
        if stress_score >= 6:
            return 2, stress_score  # WARNING, stress_score  # WARNING
        
        # ADVISORY (1) - Monitor closely (score 3-5)
        elif stress_score >= 3:
            return 1, stress_score  # ADVISORY, stress_score  # ADVISORY
        
        # NORMAL (0) - All systems OK (score 0-2)
        else:
            return 0, stress_score  # NORMAL, stress_score  # NORMAL
    
    def data_collection_loop(self):
        """Main data collection loop with professional logging"""
        logger.info("🚀 Starting cloud data collection...")
        
        print(f"\n📊 LIVE CLOUD DATA COLLECTION ACTIVE")
        print("="*70)
        print(f"{'#':<6} {'RPM':<8} {'Temp':<7} {'Load':<6} {'Speed':<7} {'Status':<10} {'Quality':<7}")
        print("-"*70)
        
        consecutive_errors = 0
        max_errors = 5
        
        while self.running.is_set():
            try:
                self.session_stats['total_readings'] += 1
                reading_num = self.session_stats['total_readings']
                
                sensor_data = self.read_obd_data()
                
                if sensor_data:
                    self.session_stats['successful_readings'] += 1
                    self.data_buffer.append(sensor_data)
                    
                    # Display live data (like automated_car_collector_daemon)
                    rpm = sensor_data.get('rpm', 0)
                    temp = sensor_data.get('coolant_temp', 0)
                    load = sensor_data.get('engine_load', 0)
                    speed = sensor_data.get('speed', 0)
                    status = sensor_data.get('status', 'NORMAL')
                    quality = sensor_data.get('data_quality', 0) / 100.0
                    
                    status_icon = {'NORMAL': '🟢', 'WARNING': '🟠', 'CRITICAL': '🔴'}.get(status, '⚪')
                    
                    print(f"{reading_num:>5}: {rpm:>7.0f} {temp:>6.1f}°C {load:>5.1f}% {speed:>6.1f} {status_icon}{status:<9} {quality:>6.2f}")
                    
                    # Upload batch when full
                    if len(self.data_buffer) >= self.batch_size:
                        self.upload_batch_to_cloud()
                    
                    consecutive_errors = 0
                else:
                    consecutive_errors += 1
                    self.session_stats['errors'] += 1
                    
                    if consecutive_errors >= max_errors:
                        logger.warning(f"WARNING: Too many consecutive errors ({consecutive_errors}), attempting reconnect...")
                        # Try to reconnect instead of stopping
                        if self.connection:
                            try:
                                self.connection.close()
                            except:
                                pass
                        
                        time.sleep(10)  # Wait before reconnecting
                        if self.connect_obd():
                            logger.info("RECONNECTED: Connection restored!")
                            consecutive_errors = 0  # Reset counter
                        else:
                            logger.error("RECONNECT FAILED: Will retry in 30 seconds...")
                            time.sleep(30)
                
                time.sleep(self.collection_interval)
                
            except KeyboardInterrupt:
                logger.info("🛑 Keyboard interrupt received")
                break
            except Exception as e:
                logger.error(f"Collection loop error: {e}")
                self.session_stats['errors'] += 1
                consecutive_errors += 1
                time.sleep(5)
        
        # Clear running flag so main() knows we stopped
        self.running.clear()

        # Final batch
        if self.data_buffer:
            logger.info("💾 Storing final data batch...")
            self.upload_batch_to_cloud()
    
    def upload_batch_to_cloud(self):
        """Upload batch to Supabase (sensor_data, sensor_data_realtime, telemetry_data)"""
        if not self.data_buffer or not self.current_vehicle_id:
            return
        
        try:
            batch_data = list(self.data_buffer)
            
            # DEBUG: Check first record
            if batch_data:
                first = batch_data[0]
                logger.info(f"DEBUG UPLOAD: First record has {len(first)} fields")
                logger.info(f"DEBUG UPLOAD: timing_advance={first.get('timing_advance')}, run_time={first.get('run_time')}, control_module_voltage={first.get('control_module_voltage')}")
            
            # Store to sensor_data table
            success = supabase_storage.store_sensor_data_batch(
                self.current_vehicle_id, batch_data
            )
            
            if success:
                self.session_stats['stored_records'] += len(batch_data)
                logger.info(f"💾 Batch stored: {len(batch_data)}/{len(batch_data)} records (Total: {self.session_stats['stored_records']})")
                self.data_buffer.clear()
            else:
                logger.warning("⚠️ Failed to upload batch to cloud")
                
        except Exception as e:
            logger.error(f"❌ Batch upload error: {e}")
            self.session_stats['errors'] += 1
    
    def start_collection(self):
        """Start cloud data collection"""
        logger.info("🚀 Starting Professional Cloud Collector")
        
        # Connect to OBD
        if not self.connect_obd():
            logger.error("❌ Cannot start without OBD connection")
            return False
        
        # Setup vehicle
        if not self.detect_and_setup_vehicle():
            logger.error("❌ Cannot start without vehicle profile")
            return False
        
        # Display session info
        print(f"\n🚀 CLOUD COLLECTION SESSION INITIALIZED")
        print("="*55)
        print(f"🚗 Vehicle: {self.vehicle_name}")
        print(f"🆔 Vehicle ID: {self.current_vehicle_id}")
        print(f"📊 Session: {self.session_id}")
        print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"☁️  Storage: Supabase (sensor_data, sensor_data_realtime)")
        print(f"🔧 Interval: {self.collection_interval}s, Batch: {self.batch_size}")
        print("="*55)
        
        self.session_stats['start_time'] = time.time()
        self.running.set()
        
        # Start collection thread
        collection_thread = Thread(target=self.data_collection_loop)
        collection_thread.start()
        
        logger.info("✅ Cloud collection started successfully")
        return True
    
    def stop_collection(self):
        """Stop collection and upload remaining data"""
        if not self.running.is_set():
            return
        
        logger.info("🛑 Stopping cloud collection...")
        self.running.clear()
        
        # Store remaining data
        if self.data_buffer:
            logger.info("💾 Storing remaining data...")
            self.upload_batch_to_cloud()
        
        # Close OBD connection
        if self.connection:
            try:
                self.connection.close()
                logger.info("🔌 OBD connection closed")
            except:
                pass
        
        # Display summary
        if self.session_stats['start_time']:
            duration = time.time() - self.session_stats['start_time']
            success_rate = (self.session_stats['successful_readings'] / max(self.session_stats['total_readings'], 1)) * 100
            
            print(f"\n{'='*60}")
            print("📊 CLOUD COLLECTION SESSION SUMMARY")
            print(f"{'='*60}")
            print(f"⏱️  Duration: {duration:.1f} seconds")
            print(f"📊 Total readings: {self.session_stats['total_readings']:,}")
            print(f"✅ Successful: {self.session_stats['successful_readings']:,} ({success_rate:.1f}%)")
            print(f"☁️  Stored to Supabase: {self.session_stats['stored_records']:,}")
            print(f"❌ Errors: {self.session_stats['errors']}")
            print(f"{'='*60}")
        
        logger.info("✅ Cloud collection stopped")

def main():
    """Main entry point - runs forever, auto-reconnects"""
    print("🚀 Professional Cloud Vehicle Data Collector")
    print("="*55)
    print("☁️  Direct Supabase storage (no local SQLite)")
    print("📊 Real-time OBD-II data collection")
    print("📈 Multi-table storage with proper schema")
    print("🔄 Auto-reconnect on OBD disconnection")
    print("="*55)
    print()
    
    while True:  # Loop forever, auto-restart
        collector = ProfessionalCloudCollector()
        
        try:
            if collector.start_collection():
                print("\n🔄 Cloud collector running... Press Ctrl+C to stop")
                
                # Wait for completion (will exit on OBD error)
                while collector.running.is_set():
                    time.sleep(1)
                
                # If we get here, collection stopped (car off/OBD lost)
                print("\n⚠️  Collection stopped (OBD disconnected)")
                print("⏳ Waiting 30 seconds before reconnect attempt...")
                time.sleep(30)
                
            else:
                print("❌ Failed to start - waiting 30s before retry...")
                time.sleep(30)
                
        except KeyboardInterrupt:
            print("\n🛑 Interrupted by user")
            collector.stop_collection()
            break  # Exit the forever loop
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            collector.stop_collection()
            print(f"⏳ Error encountered - waiting 30s before retry...")
            time.sleep(30)


if __name__ == "__main__":
    main()
