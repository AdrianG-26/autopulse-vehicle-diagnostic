#!/usr/bin/env python3
"""
🔄 Supabase Sync Service
========================
Syncs vehicle data from local SQLite database to Supabase cloud

Features:
- One-time bulk sync of all historical data
- Incremental sync (only new records)
- Real-time continuous sync mode
- Batch processing for efficient uploads
- Error handling and retry logic

Usage:
    # One-time full sync
    python sync_to_supabase.py --full

    # Incremental sync (only new data)
    python sync_to_supabase.py --incremental

    # Continuous real-time sync (runs as daemon)
    python sync_to_supabase.py --continuous

    # Sync specific vehicle
    python sync_to_supabase.py --vehicle-id 2
"""

import os
import sys
import sqlite3
import time
import argparse
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Supabase client (install: pip install supabase)
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    print("⚠️  Supabase library not installed. Install with: pip install supabase")
    SUPABASE_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Paths
LOCAL_DB = PROJECT_ROOT / "src" / "data" / "vehicle_data.db"
SYNC_STATE_FILE = PROJECT_ROOT / "src" / "data" / ".sync_state.json"

class SupabaseSync:
    """Handles syncing data from local SQLite to Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str, user_id: str = None):
        """
        Initialize Supabase sync
        
        Args:
            supabase_url: Supabase project URL
            supabase_key: Supabase anon/service key
            user_id: User ID to associate vehicles with (optional)
        """
        if not SUPABASE_AVAILABLE:
            raise ImportError("Supabase library not installed")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.user_id = user_id
        self.local_db_path = LOCAL_DB
        self.sync_state = self._load_sync_state()
        
        # Batch sizes for efficient uploads
        self.VEHICLE_BATCH_SIZE = 10
        self.SENSOR_BATCH_SIZE = 1000  # Upload 1000 sensor readings at a time
        
    def _load_sync_state(self) -> Dict:
        """Load sync state from file"""
        if SYNC_STATE_FILE.exists():
            try:
                with open(SYNC_STATE_FILE, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load sync state: {e}")
        
        return {
            'last_sync': None,
            'vehicles_synced': {},
            'last_sensor_id': 0
        }
    
    def _save_sync_state(self):
        """Save sync state to file"""
        try:
            SYNC_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(SYNC_STATE_FILE, 'w') as f:
                json.dump(self.sync_state, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save sync state: {e}")
    
    def connect_local_db(self) -> sqlite3.Connection:
        """Connect to local SQLite database"""
        if not self.local_db_path.exists():
            raise FileNotFoundError(f"Local database not found: {self.local_db_path}")
        
        conn = sqlite3.connect(self.local_db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def sync_vehicle_profiles(self, vehicle_ids: Optional[List[int]] = None) -> Dict[int, int]:
        """
        Sync vehicle profiles from local DB to Supabase
        
        Args:
            vehicle_ids: Specific vehicle IDs to sync (None = all)
            
        Returns:
            Mapping of local vehicle ID to Supabase vehicle ID
        """
        logger.info("🚗 Syncing vehicle profiles...")
        
        conn = self.connect_local_db()
        cursor = conn.cursor()
        
        # Fetch vehicles from local DB
        query = "SELECT * FROM car_profiles"
        if vehicle_ids:
            placeholders = ','.join('?' * len(vehicle_ids))
            query += f" WHERE id IN ({placeholders})"
            cursor.execute(query, vehicle_ids)
        else:
            cursor.execute(query)
        
        local_vehicles = cursor.fetchall()
        conn.close()
        
        vehicle_id_map = {}
        synced_count = 0
        
        for vehicle in local_vehicles:
            try:
                # Prepare vehicle data for Supabase
                vehicle_data = {
                    'car_identifier': vehicle['car_identifier'],
                    'car_display_name': vehicle['car_display_name'] or vehicle['vin'],
                    'make': vehicle['make'] or 'Unknown',
                    'model': vehicle['model'] or 'Unknown',
                    'year': vehicle['year'] if vehicle['year'] else None,
                    'vin': vehicle['vin'],
                    'fuel_type': vehicle['fuel_type'],
                    'transmission_type': vehicle['transmission_type'],
                    'engine_size': vehicle['engine_size'],
                    'notes': vehicle['notes'],
                    'total_sessions': vehicle['total_sessions'] or 0,
                    'total_records': vehicle['total_records'] or 0,
                    'is_active': bool(vehicle['is_active']),
                    'created_at': vehicle['created_at'],
                    'last_used': vehicle['last_used']
                }
                
                # Add user_id if provided
                if self.user_id:
                    vehicle_data['user_id'] = self.user_id
                
                # Check if vehicle already exists in Supabase
                existing = self.supabase.table('vehicle_profiles').select('id').eq(
                    'car_identifier', vehicle['car_identifier']
                ).execute()
                
                if existing.data:
                    # Update existing vehicle
                    supabase_id = existing.data[0]['id']
                    self.supabase.table('vehicle_profiles').update(vehicle_data).eq(
                        'id', supabase_id
                    ).execute()
                    logger.info(f"✅ Updated vehicle: {vehicle['car_display_name']} (Supabase ID: {supabase_id})")
                else:
                    # Insert new vehicle
                    result = self.supabase.table('vehicle_profiles').insert(vehicle_data).execute()
                    supabase_id = result.data[0]['id']
                    logger.info(f"✅ Inserted vehicle: {vehicle['car_display_name']} (Supabase ID: {supabase_id})")
                
                vehicle_id_map[vehicle['id']] = supabase_id
                synced_count += 1
                
                # Update sync state
                self.sync_state['vehicles_synced'][str(vehicle['id'])] = supabase_id
                
            except Exception as e:
                logger.error(f"❌ Failed to sync vehicle ID {vehicle['id']}: {e}")
        
        self._save_sync_state()
        logger.info(f"🎉 Synced {synced_count} vehicle profiles")
        
        return vehicle_id_map
    
    def sync_sensor_data(
        self, 
        vehicle_id_map: Dict[int, int],
        incremental: bool = False,
        limit: Optional[int] = None
    ) -> int:
        """
        Sync sensor data from local DB to Supabase
        
        Args:
            vehicle_id_map: Mapping of local to Supabase vehicle IDs
            incremental: Only sync new data since last sync
            limit: Max number of records to sync (None = all)
            
        Returns:
            Number of sensor records synced
        """
        logger.info("📡 Syncing sensor data...")
        
        conn = self.connect_local_db()
        cursor = conn.cursor()
        
        # Build query
        query = """
        SELECT * FROM enhanced_sensor_data 
        WHERE car_profile_id IN ({})
        """.format(','.join('?' * len(vehicle_id_map.keys())))
        
        params = list(vehicle_id_map.keys())
        
        # Incremental sync: only new records
        if incremental and self.sync_state.get('last_sensor_id'):
            query += " AND id > ?"
            params.append(self.sync_state['last_sensor_id'])
        
        query += " ORDER BY id ASC"
        
        if limit:
            query += f" LIMIT {limit}"
        
        cursor.execute(query, params)
        
        total_synced = 0
        batch = []
        max_local_id = self.sync_state.get('last_sensor_id', 0)
        
        for row in cursor:
            try:
                # Map local vehicle ID to Supabase vehicle ID
                supabase_vehicle_id = vehicle_id_map.get(row['car_profile_id'])
                if not supabase_vehicle_id:
                    logger.warning(f"No Supabase vehicle ID for local ID {row['car_profile_id']}, skipping")
                    continue
                
                # Prepare sensor data
                sensor_data = {
                    'vehicle_id': supabase_vehicle_id,
                    'session_id': row['session_id'],
                    'timestamp': row['timestamp'],
                    'rpm': row['rpm'],
                    'coolant_temp': row['coolant_temp'],
                    'engine_load': row['engine_load'],
                    'vehicle_speed': row['vehicle_speed'],
                    'throttle_pos': row['throttle_pos'],
                    'intake_temp': row['intake_temp'],
                    'fuel_level': row['fuel_level'],
                    'fuel_trim_short': row['fuel_trim_short'],
                    'fuel_trim_long': row['fuel_trim_long'],
                    'fuel_pressure': row['fuel_pressure'],
                    'fuel_system_status': row['fuel_system_status'],
                    'maf': row['maf'],
                    'map': row['map'],
                    'barometric_pressure': row['barometric_pressure'],
                    'timing_advance': row['timing_advance'],
                    'o2_sensor_1': row['o2_sensor_1'],
                    'o2_sensor_2': row['o2_sensor_2'],
                    'catalyst_temp': row['catalyst_temp'],
                    'control_module_voltage': row['control_module_voltage'],
                    'engine_runtime': row['engine_runtime'],
                    'dtc_count': row['dtc_count'] or 0,
                    'status': row['status'],
                    'fault_type': row['fault_type'],
                    'load_rpm_ratio': row['load_rpm_ratio'],
                    'temp_gradient': row['temp_gradient'],
                    'fuel_efficiency': row['fuel_efficiency'],
                    'throttle_response': row['throttle_response'],
                    'engine_stress_score': row['engine_stress_score'],
                    'egr_error': row['egr_error'],
                    'data_quality_score': row['data_quality_score'] or 100
                }
                
                batch.append(sensor_data)
                max_local_id = max(max_local_id, row['id'])
                
                # Upload batch when it reaches the limit
                if len(batch) >= self.SENSOR_BATCH_SIZE:
                    self._upload_sensor_batch(batch)
                    total_synced += len(batch)
                    logger.info(f"📊 Synced {total_synced} sensor records...")
                    batch = []
                
            except Exception as e:
                logger.error(f"❌ Failed to process sensor record ID {row['id']}: {e}")
        
        # Upload remaining batch
        if batch:
            self._upload_sensor_batch(batch)
            total_synced += len(batch)
        
        # Update sync state
        self.sync_state['last_sensor_id'] = max_local_id
        self.sync_state['last_sync'] = datetime.now().isoformat()
        self._save_sync_state()
        
        conn.close()
        logger.info(f"🎉 Synced {total_synced} sensor records")
        
        return total_synced
    
    def _upload_sensor_batch(self, batch: List[Dict]):
        """Upload a batch of sensor data to Supabase"""
        try:
            self.supabase.table('sensor_data').insert(batch).execute()
        except Exception as e:
            logger.error(f"❌ Failed to upload batch: {e}")
            # Try uploading one by one
            for record in batch:
                try:
                    self.supabase.table('sensor_data').insert([record]).execute()
                except Exception as e2:
                    logger.error(f"❌ Failed to upload single record: {e2}")
    
    def update_realtime_data(self, vehicle_id_map: Dict[int, int]):
        """Update the realtime sensor data table with latest readings"""
        logger.info("⚡ Updating real-time sensor data...")
        
        conn = self.connect_local_db()
        cursor = conn.cursor()
        
        for local_id, supabase_id in vehicle_id_map.items():
            try:
                # Get latest sensor reading for this vehicle
                cursor.execute("""
                    SELECT * FROM enhanced_sensor_data
                    WHERE car_profile_id = ?
                    ORDER BY timestamp DESC
                    LIMIT 1
                """, (local_id,))
                
                latest = cursor.fetchone()
                if not latest:
                    continue
                
                # Prepare realtime data
                realtime_data = {
                    'vehicle_id': supabase_id,
                    'timestamp': latest['timestamp'],
                    'rpm': latest['rpm'] or 0,
                    'speed': latest['vehicle_speed'] or 0,
                    'coolant_temp': latest['coolant_temp'] or 0,
                    'battery': latest['control_module_voltage'] or 12.3,
                    'engine_load': latest['engine_load'] or 0,
                    'throttle_pos': latest['throttle_pos'] or 0,
                    'fuel_level': latest['fuel_level'] or 50,
                    'status': latest['status'] or 'NORMAL',
                    'map_kpa': latest['map'],
                    'intake_air_temp': latest['intake_temp'],
                    'timing_advance': latest['timing_advance'],
                    'fuel_trim_short': latest['fuel_trim_short'],
                    'fuel_trim_long': latest['fuel_trim_long']
                }
                
                # Upsert to realtime table
                self.supabase.table('sensor_data_realtime').upsert(
                    realtime_data,
                    on_conflict='vehicle_id'
                ).execute()
                
                logger.info(f"✅ Updated realtime data for vehicle {supabase_id}")
                
            except Exception as e:
                logger.error(f"❌ Failed to update realtime data for vehicle {local_id}: {e}")
        
        conn.close()
    
    def run_full_sync(self, vehicle_ids: Optional[List[int]] = None, limit: Optional[int] = None):
        """Run a complete sync (vehicles + all sensor data)"""
        logger.info("🚀 Starting full sync...")
        start_time = time.time()
        
        # Sync vehicles first
        vehicle_id_map = self.sync_vehicle_profiles(vehicle_ids)
        
        if not vehicle_id_map:
            logger.warning("⚠️  No vehicles to sync")
            return
        
        # Sync sensor data
        sensor_count = self.sync_sensor_data(vehicle_id_map, incremental=False, limit=limit)
        
        # Update realtime data
        self.update_realtime_data(vehicle_id_map)
        
        elapsed = time.time() - start_time
        logger.info(f"✅ Full sync completed in {elapsed:.1f}s")
        logger.info(f"   Vehicles: {len(vehicle_id_map)}, Sensor records: {sensor_count}")
    
    def run_incremental_sync(self):
        """Run incremental sync (only new data since last sync)"""
        logger.info("🔄 Starting incremental sync...")
        
        # Get existing vehicle mapping from sync state
        vehicle_id_map = {
            int(local_id): supabase_id 
            for local_id, supabase_id in self.sync_state.get('vehicles_synced', {}).items()
        }
        
        if not vehicle_id_map:
            logger.warning("⚠️  No vehicles synced yet. Run full sync first.")
            return
        
        # Sync only new sensor data
        sensor_count = self.sync_sensor_data(vehicle_id_map, incremental=True)
        
        # Update realtime data
        self.update_realtime_data(vehicle_id_map)
        
        logger.info(f"✅ Incremental sync completed. New records: {sensor_count}")
    
    def run_continuous_sync(self, interval: int = 60):
        """Run continuous sync in the background"""
        logger.info(f"🔁 Starting continuous sync (interval: {interval}s)...")
        
        try:
            while True:
                try:
                    self.run_incremental_sync()
                except Exception as e:
                    logger.error(f"❌ Sync error: {e}")
                
                time.sleep(interval)
        except KeyboardInterrupt:
            logger.info("🛑 Continuous sync stopped by user")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Sync vehicle data to Supabase')
    parser.add_argument('--full', action='store_true', help='Full sync (all data)')
    parser.add_argument('--incremental', action='store_true', help='Incremental sync (new data only)')
    parser.add_argument('--continuous', action='store_true', help='Continuous sync (daemon mode)')
    parser.add_argument('--vehicle-id', type=int, help='Sync specific vehicle ID')
    parser.add_argument('--limit', type=int, help='Limit number of sensor records')
    parser.add_argument('--interval', type=int, default=60, help='Sync interval for continuous mode (seconds)')
    
    args = parser.parse_args()
    
    # Get Supabase credentials from environment
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    USER_ID = os.getenv('SUPABASE_USER_ID')  # Optional: associate vehicles with user
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("❌ Missing Supabase credentials!")
        logger.error("   Set SUPABASE_URL and SUPABASE_KEY environment variables")
        logger.error("   Example:")
        logger.error("     export SUPABASE_URL='https://your-project.supabase.co'")
        logger.error("     export SUPABASE_KEY='your-anon-key'")
        sys.exit(1)
    
    try:
        sync = SupabaseSync(SUPABASE_URL, SUPABASE_KEY, USER_ID)
        
        if args.full:
            vehicle_ids = [args.vehicle_id] if args.vehicle_id else None
            sync.run_full_sync(vehicle_ids, args.limit)
        elif args.incremental:
            sync.run_incremental_sync()
        elif args.continuous:
            sync.run_continuous_sync(args.interval)
        else:
            logger.error("❌ Please specify --full, --incremental, or --continuous")
            parser.print_help()
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Sync failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
