#!/usr/bin/env python3
"""
🔄 Supabase Direct Data Storage Service
======================================
Stores vehicle sensor data directly to Supabase cloud database
"""

import os
import sys
import json
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import logging

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    print("⚠️ Install supabase: pip install supabase")
    SUPABASE_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseDirectStorage:
    """Direct storage service for Supabase cloud database"""
    
    def __init__(self):
        self.supabase_client: Optional[Client] = None
        self.is_connected = False
        self.batch_size = 50
        self.setup_connection()
    
    def setup_connection(self):
        """Initialize Supabase connection"""
        if not SUPABASE_AVAILABLE:
            logger.error("Supabase library not available")
            return False
            
        try:
            # Load environment variables
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_KEY')
            
            if not supabase_url or not supabase_key:
                # Try loading from .env file  
                env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
                if os.path.exists(env_path):
                    with open(env_path, 'r') as f:
                        for line in f:
                            if line.startswith('SUPABASE_URL='):
                                supabase_url = line.split('=', 1)[1].strip()
                            elif line.startswith('SUPABASE_KEY='):
                                supabase_key = line.split('=', 1)[1].strip()
            
            if not supabase_url or not supabase_key:
                logger.error("Supabase credentials not found")
                return False
            
            # Create Supabase client
            self.supabase_client = create_client(supabase_url, supabase_key)
            self.is_connected = True
            logger.info("✅ Connected to Supabase successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Supabase: {e}")
            self.is_connected = False
            return False
    
    def get_or_create_vehicle_profile(self, car_identifier: str, vehicle_data: Dict) -> Optional[int]:
        """Get existing vehicle or create new profile"""
        if not self.is_connected:
            return None
            
        try:
            # Check if vehicle exists
            result = self.supabase_client.table('vehicle_profiles').select('id').eq('car_identifier', car_identifier).execute()
            
            if result.data:
                vehicle_id = result.data[0]['id']
                logger.info(f"Found existing vehicle: {vehicle_id}")
                return vehicle_id
            else:
                # Create new vehicle profile
                new_vehicle = {
                    'car_identifier': car_identifier,
                    'car_display_name': vehicle_data.get('display_name', f'Vehicle {car_identifier[:8]}'),
                    'make': vehicle_data.get('make', 'Unknown'),
                    'model': vehicle_data.get('model', 'Unknown'),
                    'year': vehicle_data.get('year'),
                    'fuel_type': vehicle_data.get('fuel_type', 'Gasoline'),
                    'notes': f'Auto-created - {datetime.now().strftime("%Y-%m-%d %H:%M")}',
                    'total_sessions': 1,
                    'total_records': 0,
                    'is_active': True,
                    'created_at': datetime.now(timezone.utc).isoformat(),
                    'last_used': datetime.now(timezone.utc).isoformat(),
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }
                
                result = self.supabase_client.table('vehicle_profiles').insert(new_vehicle).execute()
                
                if result.data:
                    vehicle_id = result.data[0]['id']
                    logger.info(f"✅ Created new vehicle profile: {vehicle_id}")
                    return vehicle_id
                    
        except Exception as e:
            logger.error(f"Error managing vehicle profile: {e}")
            return None
    
    def store_sensor_data_batch(self, vehicle_id: int, sensor_readings: List[Dict]) -> bool:
        """Store multiple sensor readings with ALL 30 OBD parameters"""
        if not self.is_connected or not sensor_readings:
            return False
            
        try:
            # Prepare batch data with ALL parameters
            batch_data = []
            for reading in sensor_readings:
                sensor_record = {
                    'vehicle_id': vehicle_id,
                    'session_id': reading.get('session_id', 'direct_upload'),
                    'timestamp': reading.get('timestamp', datetime.now(timezone.utc).isoformat()),
                    
                    # Core Engine (8)
                    'rpm': reading.get('rpm', 0),
                    'vehicle_speed': reading.get('speed', 0),
                    'coolant_temp': reading.get('coolant_temp', 0),
                    'engine_load': reading.get('engine_load', 0),
                    'intake_temp': reading.get('intake_temp', 0),
                    'timing_advance': reading.get('timing_advance', 0),
                    'run_time': int(reading.get('run_time', 0)),
                    'absolute_load': reading.get('absolute_load', 0),
                    
                    # Fuel System (7)
                    'fuel_level': reading.get('fuel_level', 0),
                    'fuel_pressure': reading.get('fuel_pressure', 0),
                    'throttle_pos': reading.get('throttle_pos', 0),
                    'fuel_trim_short': reading.get('short_fuel_trim_1', 0),
                    'fuel_trim_long': reading.get('long_fuel_trim_1', 0),
                    'short_fuel_trim_2': reading.get('short_fuel_trim_2', 0),
                    'long_fuel_trim_2': reading.get('long_fuel_trim_2', 0),
                    
                    # Air Intake (3)
                    'maf': reading.get('maf', 0),
                    'map': reading.get('intake_pressure', 0),
                    'barometric_pressure': reading.get('barometric_pressure', 0),
                    
                    # Emissions (3)
                    'o2_sensor_1': reading.get('o2_b1s1', 0),
                    'o2_b1s2': reading.get('o2_b1s2', 0),
                    'catalyst_temp_b1s1': reading.get('catalyst_temp_b1s1', 0),
                    
                    # Environmental (1)
                    # 'ambient_air_temp': reading.get('ambient_air_temp', 0),  # Not in Supabase schema
                    
                    # Electrical (1)
                    'control_module_voltage': reading.get('control_module_voltage', 0),
                    
                    # Diagnostic (5)
                    'distance_w_mil': reading.get('distance_w_mil', 0),
                    'dtc_count': reading.get('dtc_count', 0),
                    'mil_status': reading.get('mil_status', False),
                    'fuel_status': reading.get('fuel_status', 'Unknown'),
                    
                    # ML Training (2)
                    'health_status': reading.get('health_status', 0),
                    'engine_stress_score': reading.get('engine_stress_score', 0),
                'load_rpm_ratio': reading.get('load_rpm_ratio'),
                'temp_gradient': reading.get('temp_gradient'),
                'fuel_efficiency': reading.get('fuel_efficiency'),
                    
                    # Metadata
                    'data_quality_score': reading.get('data_quality', 90),
                    'status': reading.get('status', 'NORMAL')
                }
                batch_data.append(sensor_record)
            
            # DEBUG: Log first record before insert
            if batch_data and len(batch_data) > 0:
                first_rec = batch_data[0]
                logger.info(f"DEBUG STORAGE: timing_advance={first_rec.get('timing_advance')}, run_time={first_rec.get('run_time')}, control_module_voltage={first_rec.get('control_module_voltage')}")
            
            # DEBUG: Log first record before insert
            if batch_data and len(batch_data) > 0:
                first_rec = batch_data[0]
                logger.info(f"DEBUG STORAGE: timing_advance={first_rec.get('timing_advance')}, run_time={first_rec.get('run_time')}, control_module_voltage={first_rec.get('control_module_voltage')}")
            
            # Insert batch data
            result = self.supabase_client.table('sensor_data').insert(batch_data).execute()
            
            if result.data:
                logger.info(f"✅ Stored {len(batch_data)} readings for vehicle {vehicle_id}")
                
                # Update real-time table
                latest_reading = sensor_readings[-1]
                self.update_realtime_data(vehicle_id, latest_reading)
                self.update_vehicle_statistics(vehicle_id, len(batch_data))
                
                return True
                
        except Exception as e:
            logger.error(f"Error storing sensor data: {e}")
            return False
    
    def update_realtime_data(self, vehicle_id: int, latest_reading: Dict) -> bool:
        """Update real-time table for WebSocket streaming"""
        try:
            realtime_data = {
                'vehicle_id': vehicle_id,
                'timestamp': latest_reading.get('timestamp', datetime.now(timezone.utc).isoformat()),
                'rpm': latest_reading.get('rpm', 0),
                'speed_mph': latest_reading.get('speed', 0),
                'coolant_temp_c': latest_reading.get('coolant_temp', 0),
                'engine_load_pct': latest_reading.get('engine_load', 0),
                'throttle_position_pct': latest_reading.get('throttle_pos', 0),
                'fuel_level_pct': latest_reading.get('fuel_level', 0),
                'data_quality_score': latest_reading.get('data_quality', 90),
                'engine_stress_score': latest_reading.get('engine_stress_score', 0),
                'engine_stress_score': latest_reading.get('engine_stress_score', 0)
            }
            
            # Upsert (insert or update if exists)
            result = self.supabase_client.table('sensor_data_realtime').upsert(
                realtime_data, 
                on_conflict='vehicle_id'
            ).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Error updating real-time data: {e}")
            return False
    
    def update_vehicle_statistics(self, vehicle_id: int, new_records_count: int):
        """Update vehicle statistics"""
        try:
            result = self.supabase_client.table('vehicle_profiles').select('total_records').eq('id', vehicle_id).execute()
            
            if result.data:
                current_total = result.data[0].get('total_records', 0)
                new_total = current_total + new_records_count
                
                self.supabase_client.table('vehicle_profiles').update({
                    'total_records': new_total,
                    'last_used': datetime.now(timezone.utc).isoformat(),
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }).eq('id', vehicle_id).execute()
                
        except Exception as e:
            logger.error(f"Error updating stats: {e}")
    
    def get_recent_sensor_data(self, vehicle_id: int, limit: int = 1000) -> List[Dict]:
        """Get recent sensor data for ML processing"""
        if not self.is_connected:
            return []
            
        try:
            result = self.supabase_client.table('sensor_data').select('*').eq('vehicle_id', vehicle_id).order('timestamp', desc=True).limit(limit).execute()
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"Error fetching sensor data: {e}")
            return []
    
    def get_latest_reading(self, vehicle_id: int) -> Optional[Dict]:
        """Get latest sensor reading for a vehicle"""
        if not self.is_connected:
            return None
            
        try:
            result = self.supabase_client.table('sensor_data_realtime').select('*').eq('vehicle_id', vehicle_id).execute()
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error fetching latest reading: {e}")
            return None

# Global instance
supabase_storage = SupabaseDirectStorage()
