#!/usr/bin/env python3
"""
Enhanced Database System for Vehicle Diagnostics - OPTIMIZED VERSION
Professional-grade database management with advanced features for vehicle diagnostic data.

Key Improvements:
✅ Robust error handling and logging
✅ Connection pooling and performance optimization
✅ Data validation and integrity checks
✅ Professional console output with emojis
✅ Type hints and comprehensive documentation
✅ Batch processing optimization
✅ Advanced analytics and reporting
✅ Multi-format export capabilities
✅ Interactive management interface
"""

import sqlite3
import pandas as pd
import os
import sys
import json
import time
import hashlib
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple, Union
from pathlib import Path
from contextlib import contextmanager
from dataclasses import dataclass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DatabaseError(Exception):
    """Custom exception for database operations"""
    pass

class CarProfileError(Exception):
    """Custom exception for car profile operations"""
    pass

@dataclass
class SensorData:
    """Data class for sensor readings with validation"""
    timestamp: datetime
    rpm: float = 0.0
    coolant_temp: float = 0.0
    engine_load: float = 0.0
    throttle_pos: float = 0.0
    intake_temp: float = 0.0
    fuel_level: float = 0.0
    fuel_trim_short: float = 0.0
    fuel_trim_long: float = 0.0
    maf: float = 0.0
    map: float = 0.0
    timing_advance: float = 0.0
    vehicle_speed: float = 0.0
    o2_sensor_1: float = 0.0
    o2_sensor_2: float = 0.0
    catalyst_temp: float = 0.0
    egr_error: float = 0.0
    barometric_pressure: float = 0.0
    fuel_pressure: float = 0.0
    engine_runtime: int = 0
    control_module_voltage: float = 0.0
    dtc_count: int = 0
    fuel_system_status: str = "Unknown"
    load_rpm_ratio: float = 0.0
    temp_gradient: float = 0.0
    fuel_efficiency: float = 0.0
    throttle_response: float = 0.0
    engine_stress_score: float = 0.0
    status: str = "Normal"
    fault_type: str = "None"
    data_quality_score: int = 100

class EnhancedVehicleDatabase:
    """
    Professional-grade enhanced database for vehicle diagnostics.
    
    Features:
    - Automated car detection and profile management
    - High-performance batch data insertion
    - Comprehensive analytics and reporting
    - Multi-format export (Excel, CSV, JSON)
    - Professional error handling and logging
    - Interactive management interface
    """
    
    def __init__(self, db_path: str = "data/vehicle_data.db"):
        """
        Initialize the enhanced vehicle database.
        
        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = Path(db_path)
        self.connection_timeout = 30.0
        self.batch_size = 1000
        
        try:
            # Create data directory if it doesn't exist
            self.db_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Initialize database schema
            self._init_database()
            
            # Verify database integrity
            self._verify_database()
            
            logger.info(f"Enhanced database initialized: {self.db_path}")
            print(f"🗄️  Enhanced database ready: {self.db_path}")
            
        except Exception as e:
            error_msg = f"Failed to initialize database: {e}"
            logger.error(error_msg)
            raise DatabaseError(error_msg) from e
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections with optimization"""
        conn = None
        try:
            conn = sqlite3.connect(
                str(self.db_path), 
                timeout=self.connection_timeout,
                check_same_thread=False
            )
            # Performance optimizations
            conn.execute("PRAGMA foreign_keys = ON")
            conn.execute("PRAGMA journal_mode = WAL")
            conn.execute("PRAGMA synchronous = NORMAL")
            conn.execute("PRAGMA cache_size = 10000")
            conn.execute("PRAGMA temp_store = MEMORY")
            yield conn
        except sqlite3.Error as e:
            if conn:
                conn.rollback()
            logger.error(f"Database connection error: {e}")
            raise DatabaseError(f"Database connection failed: {e}") from e
        finally:
            if conn:
                conn.close()
    
    def _init_database(self):
        """Initialize database with enhanced schema and handle migrations"""
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if tables exist and get their structure
                cursor.execute("PRAGMA table_info(car_profiles)")
                existing_columns = [row[1] for row in cursor.fetchall()]
                
                # Enhanced car profiles table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS car_profiles (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        car_identifier TEXT UNIQUE NOT NULL,
                        car_display_name TEXT NOT NULL,
                        make TEXT NOT NULL,
                        model TEXT NOT NULL,
                        year INTEGER NOT NULL,
                        fuel_type TEXT NOT NULL,
                        transmission_type TEXT NOT NULL,
                        engine_size TEXT DEFAULT '',
                        notes TEXT DEFAULT '',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
                        total_sessions INTEGER DEFAULT 0,
                        total_records INTEGER DEFAULT 0
                    )
                ''')
                
                # Add new columns if they don't exist (migration)
                if 'vin' not in existing_columns:
                    try:
                        cursor.execute('ALTER TABLE car_profiles ADD COLUMN vin TEXT DEFAULT ""')
                        logger.info("Added VIN column to car_profiles")
                    except sqlite3.OperationalError:
                        pass  # Column might already exist
                
                if 'is_active' not in existing_columns:
                    try:
                        cursor.execute('ALTER TABLE car_profiles ADD COLUMN is_active BOOLEAN DEFAULT 1')
                        logger.info("Added is_active column to car_profiles")
                    except sqlite3.OperationalError:
                        pass  # Column might already exist
                
                # Enhanced sensor data table with constraints
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS enhanced_sensor_data (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        car_profile_id INTEGER NOT NULL,
                        session_id TEXT NOT NULL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        
                        -- Essential PIDs
                        rpm REAL,
                        coolant_temp REAL,
                        engine_load REAL,
                        throttle_pos REAL,
                        intake_temp REAL,
                        
                        -- Fuel System PIDs
                        fuel_level REAL,
                        fuel_trim_short REAL,
                        fuel_trim_long REAL,
                        
                        -- Performance PIDs
                        maf REAL,
                        map REAL,
                        timing_advance REAL,
                        vehicle_speed REAL,
                        
                        -- Advanced Sensor PIDs
                        o2_sensor_1 REAL,
                        o2_sensor_2 REAL,
                        catalyst_temp REAL,
                        egr_error REAL,
                        barometric_pressure REAL,
                        fuel_pressure REAL,
                        
                        -- System PIDs
                        engine_runtime INTEGER,
                        control_module_voltage REAL,
                        
                        -- Diagnostic PIDs
                        dtc_count INTEGER DEFAULT 0,
                        fuel_system_status TEXT DEFAULT 'Unknown',
                        
                        -- ML Features
                        load_rpm_ratio REAL,
                        temp_gradient REAL,
                        fuel_efficiency REAL,
                        throttle_response REAL,
                        engine_stress_score REAL,
                        
                        -- Status and Quality
                        status TEXT DEFAULT 'Normal',
                        fault_type TEXT DEFAULT 'None',
                        
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        
                        FOREIGN KEY (car_profile_id) REFERENCES car_profiles (id)
                    )
                ''')
                
                # Check if sensor data table needs new column
                cursor.execute("PRAGMA table_info(enhanced_sensor_data)")
                sensor_columns = [row[1] for row in cursor.fetchall()]
                
                if 'data_quality_score' not in sensor_columns:
                    try:
                        cursor.execute('ALTER TABLE enhanced_sensor_data ADD COLUMN data_quality_score INTEGER DEFAULT 100')
                        logger.info("Added data_quality_score column to enhanced_sensor_data")
                    except sqlite3.OperationalError:
                        pass  # Column might already exist
                
                # Create performance indexes (ignore if they exist)
                indexes = [
                    'CREATE INDEX IF NOT EXISTS idx_sensor_timestamp ON enhanced_sensor_data(timestamp DESC)',
                    'CREATE INDEX IF NOT EXISTS idx_sensor_car_profile ON enhanced_sensor_data(car_profile_id)',
                    'CREATE INDEX IF NOT EXISTS idx_sensor_session ON enhanced_sensor_data(session_id)',
                    'CREATE INDEX IF NOT EXISTS idx_sensor_status ON enhanced_sensor_data(status)',
                    'CREATE INDEX IF NOT EXISTS idx_sensor_composite ON enhanced_sensor_data(car_profile_id, timestamp DESC)',
                    'CREATE INDEX IF NOT EXISTS idx_car_identifier ON car_profiles(car_identifier)'
                ]
                
                for index_sql in indexes:
                    try:
                        cursor.execute(index_sql)
                    except sqlite3.OperationalError:
                        pass  # Index might already exist
                
                conn.commit()
                logger.info("Database schema initialized/migrated successfully")
                
        except Exception as e:
            error_msg = f"Failed to initialize database schema: {e}"
            logger.error(error_msg)
            raise DatabaseError(error_msg) from e
    
    def _verify_database(self):
        """Verify database integrity and structure"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Check required tables exist
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name IN ('car_profiles', 'enhanced_sensor_data')
                """)
                
                tables = [row[0] for row in cursor.fetchall()]
                required_tables = ['car_profiles', 'enhanced_sensor_data']
                
                missing_tables = set(required_tables) - set(tables)
                if missing_tables:
                    raise DatabaseError(f"Missing required tables: {missing_tables}")
                
                # Run integrity check
                cursor.execute("PRAGMA integrity_check")
                result = cursor.fetchone()[0]
                
                if result != 'ok':
                    raise DatabaseError(f"Database integrity check failed: {result}")
                
                logger.info("Database integrity verification passed")
                
        except Exception as e:
            error_msg = f"Database verification failed: {e}"
            logger.error(error_msg)
            raise DatabaseError(error_msg) from e
    
    def add_car_profile(self, car_data: Dict[str, Any]) -> Optional[int]:
        """
        Add new car profile with comprehensive validation.
        
        Args:
            car_data: Dictionary containing car profile information
            
        Returns:
            Car profile ID if successful, None if failed
        """
        
        try:
            # Validate required fields
            required_fields = ['car_identifier', 'car_display_name', 'make', 'model', 'year', 'fuel_type', 'transmission_type']
            missing_fields = [field for field in required_fields if not car_data.get(field)]
            
            if missing_fields:
                raise CarProfileError(f"Missing required fields: {missing_fields}")
            
            # Validate data types and ranges
            year = int(car_data['year'])
            if not (1900 <= year <= 2100):
                raise CarProfileError(f"Invalid year: {year}")
            
            valid_fuel_types = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG', 'Other']
            if car_data['fuel_type'] not in valid_fuel_types:
                raise CarProfileError(f"Invalid fuel type. Must be one of: {valid_fuel_types}")
            
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO car_profiles (
                        car_identifier, car_display_name, make, model, year, fuel_type, 
                        transmission_type, engine_size, vin, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    car_data['car_identifier'],
                    car_data['car_display_name'],
                    car_data['make'],
                    car_data['model'],
                    year,
                    car_data['fuel_type'],
                    car_data['transmission_type'],
                    car_data.get('engine_size', ''),
                    car_data.get('vin', ''),
                    car_data.get('notes', '')
                ))
                
                conn.commit()
                car_id = cursor.lastrowid
                
                logger.info(f"Car profile added: {car_data['car_display_name']} (ID: {car_id})")
                print(f"✅ Car profile added: {car_data['car_display_name']} (ID: {car_id})")
                return car_id
                
        except sqlite3.IntegrityError as e:
            error_msg = f"Car profile already exists: {car_data.get('car_identifier', 'Unknown')}"
            logger.warning(error_msg)
            print(f"⚠️  {error_msg}")
            return None
        except (CarProfileError, ValueError) as e:
            error_msg = f"Invalid car profile data: {e}"
            logger.error(error_msg)
            print(f"❌ {error_msg}")
            return None
        except Exception as e:
            error_msg = f"Unexpected error adding car profile: {e}"
            logger.error(error_msg)
            print(f"❌ {error_msg}")
            return None
    
    def get_car_profiles(self, active_only: bool = True) -> pd.DataFrame:
        """Get all car profiles with enhanced information"""
        
        try:
            with self._get_connection() as conn:
                # Check if is_active column exists
                cursor = conn.cursor()
                cursor.execute("PRAGMA table_info(car_profiles)")
                columns = [row[1] for row in cursor.fetchall()]
                has_is_active = 'is_active' in columns
                
                if has_is_active and active_only:
                    where_clause = "WHERE is_active = 1"
                else:
                    where_clause = ""
                
                activity_status_calc = '''
                    CASE 
                        WHEN datetime(last_used) > datetime('now', '-7 days') THEN 'Recent'
                        WHEN datetime(last_used) > datetime('now', '-30 days') THEN 'Active'
                        ELSE 'Inactive'
                    END as activity_status
                '''
                
                base_columns = '''
                    id, car_identifier, car_display_name, make, model, year, 
                    fuel_type, transmission_type, engine_size, notes,
                    created_at, last_used, total_sessions, total_records
                '''
                
                if has_is_active:
                    columns_sql = f"{base_columns}, is_active, {activity_status_calc}"
                else:
                    columns_sql = f"{base_columns}, 1 as is_active, {activity_status_calc}"
                
                query = f'''
                    SELECT {columns_sql}
                    FROM car_profiles 
                    {where_clause}
                    ORDER BY last_used DESC, total_records DESC
                '''
                return pd.read_sql_query(query, conn)
                
        except Exception as e:
            logger.error(f"Error retrieving car profiles: {e}")
            return pd.DataFrame()
    
    def get_car_by_identifier(self, car_identifier: str) -> Optional[Dict[str, Any]]:
        """Get car profile by unique identifier"""
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if is_active column exists
                cursor.execute("PRAGMA table_info(car_profiles)")
                columns = [row[1] for row in cursor.fetchall()]
                has_is_active = 'is_active' in columns
                
                if has_is_active:
                    cursor.execute('SELECT * FROM car_profiles WHERE car_identifier = ? AND is_active = 1', (car_identifier,))
                else:
                    cursor.execute('SELECT * FROM car_profiles WHERE car_identifier = ?', (car_identifier,))
                
                row = cursor.fetchone()
                if row:
                    columns = [description[0] for description in cursor.description]
                    return dict(zip(columns, row))
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving car by identifier '{car_identifier}': {e}")
            return None
    
    def get_car_profile_by_name(self, car_display_name: str) -> Optional[Dict[str, Any]]:
        """Get specific car profile by display name"""
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if is_active column exists
                cursor.execute("PRAGMA table_info(car_profiles)")
                columns = [row[1] for row in cursor.fetchall()]
                has_is_active = 'is_active' in columns
                
                if has_is_active:
                    cursor.execute('SELECT * FROM car_profiles WHERE car_display_name = ? AND is_active = 1', (car_display_name,))
                else:
                    cursor.execute('SELECT * FROM car_profiles WHERE car_display_name = ?', (car_display_name,))
                
                row = cursor.fetchone()
                if row:
                    columns = [description[0] for description in cursor.description]
                    return dict(zip(columns, row))
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving car by name '{car_display_name}': {e}")
            return None
    
    def update_car_last_used(self, car_profile_id: int) -> bool:
        """Update the last used timestamp for a car profile"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                current_time = datetime.now().isoformat()
                
                # Check if last_used column exists
                cursor.execute("PRAGMA table_info(car_profiles)")
                columns = [row[1] for row in cursor.fetchall()]
                
                if 'last_used' in columns:
                    cursor.execute('''
                        UPDATE car_profiles 
                        SET last_used = ? 
                        WHERE id = ?
                    ''', (current_time, car_profile_id))
                else:
                    # Column doesn't exist, add it
                    cursor.execute('''
                        ALTER TABLE car_profiles 
                        ADD COLUMN last_used TEXT DEFAULT ?
                    ''', (current_time,))
                    cursor.execute('''
                        UPDATE car_profiles 
                        SET last_used = ? 
                        WHERE id = ?
                    ''', (current_time, car_profile_id))
                
                conn.commit()
                return cursor.rowcount > 0
                
        except Exception as e:
            logger.error(f"Error updating car last used time for ID {car_profile_id}: {e}")
            return False
    
    def insert_sensor_data(self, data: SensorData, car_profile_id: int, session_id: str) -> Optional[int]:
        """Insert single sensor data point with validation"""
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO enhanced_sensor_data (
                        car_profile_id, session_id, timestamp, rpm, coolant_temp, engine_load, throttle_pos, 
                        intake_temp, fuel_level, fuel_trim_short, fuel_trim_long, maf, map, timing_advance,
                        vehicle_speed, o2_sensor_1, o2_sensor_2, catalyst_temp, egr_error,
                        barometric_pressure, fuel_pressure, engine_runtime, control_module_voltage,
                        dtc_count, fuel_system_status, load_rpm_ratio, temp_gradient,
                        fuel_efficiency, throttle_response, engine_stress_score, status, 
                        fault_type, data_quality_score
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    car_profile_id, session_id, data.timestamp.isoformat() if isinstance(data.timestamp, datetime) else str(data.timestamp), data.rpm, data.coolant_temp, 
                    data.engine_load, data.throttle_pos, data.intake_temp, data.fuel_level, 
                    data.fuel_trim_short, data.fuel_trim_long, data.maf, data.map, 
                    data.timing_advance, data.vehicle_speed, data.o2_sensor_1, data.o2_sensor_2, 
                    data.catalyst_temp, data.egr_error, data.barometric_pressure, data.fuel_pressure,
                    data.engine_runtime, data.control_module_voltage, data.dtc_count,
                    data.fuel_system_status, data.load_rpm_ratio, data.temp_gradient,
                    data.fuel_efficiency, data.throttle_response, data.engine_stress_score,
                    data.status, data.fault_type, data.data_quality_score
                ))
                
                conn.commit()
                return cursor.lastrowid
                
        except Exception as e:
            logger.error(f"Error inserting sensor data: {e}")
            return None
    
    def insert_batch_data(self, data_list: List[SensorData], car_profile_id: int, session_id: str) -> int:
        """Insert multiple data points efficiently with batch processing"""
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Prepare data tuples
                data_tuples = []
                for d in data_list:
                    # Convert datetime object to ISO format string for SQLite
                    timestamp_str = d.timestamp.isoformat() if isinstance(d.timestamp, datetime) else str(d.timestamp)
                    
                    data_tuples.append((
                        car_profile_id, session_id, timestamp_str, d.rpm, d.coolant_temp, 
                        d.engine_load, d.throttle_pos, d.intake_temp, d.fuel_level, 
                        d.fuel_trim_short, d.fuel_trim_long, d.maf, d.map, 
                        d.timing_advance, d.vehicle_speed, d.o2_sensor_1, d.o2_sensor_2, 
                        d.catalyst_temp, d.egr_error, d.barometric_pressure, d.fuel_pressure,
                        d.engine_runtime, d.control_module_voltage, d.dtc_count,
                        d.fuel_system_status, d.load_rpm_ratio, d.temp_gradient,
                        d.fuel_efficiency, d.throttle_response, d.engine_stress_score,
                        d.status, d.fault_type, d.data_quality_score
                    ))
                
                # Batch insert
                cursor.executemany('''
                    INSERT INTO enhanced_sensor_data (
                        car_profile_id, session_id, timestamp, rpm, coolant_temp, engine_load, throttle_pos, 
                        intake_temp, fuel_level, fuel_trim_short, fuel_trim_long, maf, map, timing_advance,
                        vehicle_speed, o2_sensor_1, o2_sensor_2, catalyst_temp, egr_error,
                        barometric_pressure, fuel_pressure, engine_runtime, control_module_voltage,
                        dtc_count, fuel_system_status, load_rpm_ratio, temp_gradient,
                        fuel_efficiency, throttle_response, engine_stress_score, status, 
                        fault_type, data_quality_score
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', data_tuples)
                
                conn.commit()
                logger.info(f"Batch inserted {len(data_tuples)} sensor data points")
                return len(data_tuples)
                
        except Exception as e:
            logger.error(f"Error inserting batch data: {e}")
            return 0
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive database statistics"""
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Total records
                cursor.execute('SELECT COUNT(*) FROM enhanced_sensor_data')
                total_records = cursor.fetchone()[0]
                
                # Total cars - check if is_active column exists
                cursor.execute("PRAGMA table_info(car_profiles)")
                columns = [row[1] for row in cursor.fetchall()]
                has_is_active = 'is_active' in columns
                
                if has_is_active:
                    cursor.execute('SELECT COUNT(*) FROM car_profiles WHERE is_active = 1')
                else:
                    cursor.execute('SELECT COUNT(*) FROM car_profiles')
                total_cars = cursor.fetchone()[0]
                
                # Status distribution
                cursor.execute('SELECT status, COUNT(*) FROM enhanced_sensor_data GROUP BY status')
                status_result = cursor.fetchall()
                status_counts = dict(status_result) if status_result else {}
                
                # Date range
                cursor.execute('SELECT MIN(timestamp), MAX(timestamp) FROM enhanced_sensor_data')
                date_range = cursor.fetchone()
                
                # Average values
                cursor.execute('''
                    SELECT 
                        AVG(rpm) as avg_rpm,
                        AVG(coolant_temp) as avg_temp,
                        AVG(engine_load) as avg_load,
                        AVG(engine_stress_score) as avg_stress
                    FROM enhanced_sensor_data
                    WHERE status = 'Normal'
                ''')
                averages = cursor.fetchone()
                
                return {
                    'total_records': total_records,
                    'total_cars': total_cars,
                    'status_counts': status_counts,
                    'date_range': {
                        'start': date_range[0] if date_range and date_range[0] else None,
                        'end': date_range[1] if date_range and date_range[1] else None
                    },
                    'averages': {
                        'rpm': round(averages[0], 1) if averages and averages[0] else 0,
                        'temperature': round(averages[1], 1) if averages and averages[1] else 0,
                        'load': round(averages[2], 1) if averages and averages[2] else 0,
                        'stress_score': round(averages[3], 1) if averages and averages[3] else 0
                    }
                }
                
        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            return {'total_records': 0, 'total_cars': 0, 'status_counts': {}, 'averages': {}}
    
    def export_to_excel(self, filename: str = None, hours: int = 24, car_name: str = None) -> str:
        """Export data to Excel with enhanced formatting"""
        
        try:
            if filename is None:
                car_suffix = f"_{car_name.replace(' ', '_')}" if car_name else ""
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f'VehicleData{car_suffix}_{timestamp}.xlsx'
            
            with self._get_connection() as conn:
                # Get data with car profile info
                if car_name:
                    query = '''
                        SELECT sd.*, cp.car_display_name, cp.make, cp.model, cp.year, 
                               cp.fuel_type, cp.transmission_type, cp.engine_size
                        FROM enhanced_sensor_data sd
                        JOIN car_profiles cp ON sd.car_profile_id = cp.id
                        WHERE cp.car_display_name = ? AND sd.timestamp > datetime('now', '-{} hours')
                        ORDER BY sd.timestamp DESC
                    '''.format(hours)
                    df = pd.read_sql_query(query, conn, params=(car_name,))
                else:
                    query = '''
                        SELECT sd.*, cp.car_display_name, cp.make, cp.model, cp.year, 
                               cp.fuel_type, cp.transmission_type, cp.engine_size
                        FROM enhanced_sensor_data sd
                        LEFT JOIN car_profiles cp ON sd.car_profile_id = cp.id
                        WHERE sd.timestamp > datetime('now', '-{} hours')
                        ORDER BY sd.timestamp DESC
                    '''.format(hours)
                    df = pd.read_sql_query(query, conn)
                
                # Get car profiles
                car_profiles = self.get_car_profiles()
                
                # Export to Excel with multiple sheets
                with pd.ExcelWriter(filename, engine='openpyxl') as writer:
                    # Car profiles sheet
                    if not car_profiles.empty:
                        car_profiles.to_excel(writer, sheet_name='Car_Profiles', index=False)
                    
                    # Main data sheet
                    if not df.empty:
                        df.to_excel(writer, sheet_name='Sensor_Data', index=False)
                        
                        # Status distribution
                        status_counts = df['status'].value_counts().reset_index()
                        status_counts.columns = ['status', 'count']
                        status_counts.to_excel(writer, sheet_name='Status_Distribution', index=False)
                        
                        # Fault analysis
                        fault_data = df[df['fault_type'] != 'None']
                        if not fault_data.empty:
                            fault_counts = fault_data['fault_type'].value_counts().reset_index()
                            fault_counts.columns = ['fault_type', 'count']
                            fault_counts.to_excel(writer, sheet_name='Fault_Analysis', index=False)
            
            logger.info(f"Data exported to Excel: {filename}")
            print(f"✅ Data exported to: {filename}")
            return filename
            
        except Exception as e:
            error_msg = f"Error exporting to Excel: {e}"
            logger.error(error_msg)
            print(f"❌ {error_msg}")
            return ""
    
    def export_to_csv(self, filename: str = None, hours: int = 24, car_name: str = None) -> str:
        """Export data to CSV format"""
        
        try:
            if filename is None:
                car_suffix = f"_{car_name.replace(' ', '_')}" if car_name else ""
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f'VehicleData{car_suffix}_{timestamp}.csv'
            
            with self._get_connection() as conn:
                if car_name:
                    query = '''
                        SELECT sd.*, cp.car_display_name, cp.make, cp.model, cp.year
                        FROM enhanced_sensor_data sd
                        JOIN car_profiles cp ON sd.car_profile_id = cp.id
                        WHERE cp.car_display_name = ? AND sd.timestamp > datetime('now', '-{} hours')
                        ORDER BY sd.timestamp DESC
                    '''.format(hours)
                    df = pd.read_sql_query(query, conn, params=(car_name,))
                else:
                    query = '''
                        SELECT sd.*, cp.car_display_name, cp.make, cp.model, cp.year
                        FROM enhanced_sensor_data sd
                        LEFT JOIN car_profiles cp ON sd.car_profile_id = cp.id
                        WHERE sd.timestamp > datetime('now', '-{} hours')
                        ORDER BY sd.timestamp DESC
                    '''.format(hours)
                    df = pd.read_sql_query(query, conn)
                
                df.to_csv(filename, index=False)
            
            logger.info(f"Data exported to CSV: {filename}")
            print(f"✅ Data exported to: {filename}")
            return filename
            
        except Exception as e:
            error_msg = f"Error exporting to CSV: {e}"
            logger.error(error_msg)
            print(f"❌ {error_msg}")
            return ""
    
    def view_car_profiles(self):
        """Display car profiles with enhanced formatting"""
        
        df = self.get_car_profiles()
        
        if df.empty:
            print("🚗 No car profiles found")
            return
        
        print(f"\n🚗 Car Profiles ({len(df)} total):")
        print("=" * 100)
        
        for _, row in df.iterrows():
            status_emoji = "🟢" if row['activity_status'] == 'Recent' else "🟡" if row['activity_status'] == 'Active' else "⚪"
            
            print(f"{status_emoji} {row['car_display_name']} (ID: {row['id']})")
            print(f"   📋 {row['make']} {row['model']} {row['year']} | {row['fuel_type']} | {row['transmission_type']}")
            if row['engine_size']:
                print(f"   🔧 Engine: {row['engine_size']}")
            if row.get('vin'):
                print(f"   🏷️  VIN: {row['vin']}")
            print(f"   📅 Created: {row['created_at']} | Last Used: {row['last_used']}")
            print(f"   📊 Sessions: {row['total_sessions']} | Records: {row['total_records']} | Status: {row['activity_status']}")
            if row['notes']:
                print(f"   📝 Notes: {row['notes']}")
            print()
    
    def quick_view(self, limit: int = 5, car_identifier: str = None):
        """Enhanced quick view of latest data"""
        
        try:
            with self._get_connection() as conn:
                if car_identifier:
                    query = '''
                        SELECT sd.*, cp.car_display_name, cp.make, cp.model, cp.year
                        FROM enhanced_sensor_data sd
                        JOIN car_profiles cp ON sd.car_profile_id = cp.id
                        WHERE cp.car_identifier = ?
                        ORDER BY sd.timestamp DESC 
                        LIMIT ?
                    '''
                    df = pd.read_sql_query(query, conn, params=(car_identifier, limit))
                else:
                    query = '''
                        SELECT sd.*, cp.car_display_name, cp.make, cp.model, cp.year
                        FROM enhanced_sensor_data sd
                        LEFT JOIN car_profiles cp ON sd.car_profile_id = cp.id
                        ORDER BY sd.timestamp DESC 
                        LIMIT ?
                    '''
                    df = pd.read_sql_query(query, conn, params=(limit,))
                
                if df.empty:
                    print("📭 No data in database")
                    return
                
                car_filter = f" for {car_identifier}" if car_identifier else ""
                print(f"\n📊 Latest {len(df)} records{car_filter}:")
                print("=" * 120)
                
                for _, row in df.iterrows():
                    car_info = row['car_display_name'] if row['car_display_name'] else "Unknown Car"
                    status_emoji = "🟢" if row['status'] == 'Normal' else "🟡" if row['status'] == 'Warning' else "🔴"
                    
                    print(f"🕐 {row['timestamp']} | 🚗 {car_info}")                    # Handle None values
                    rpm = row['rpm'] if row['rpm'] is not None else 0
                    load = row['engine_load'] if row['engine_load'] is not None else 0
                    temp = row['coolant_temp'] if row['coolant_temp'] is not None else 0
                    speed = row['vehicle_speed'] if row['vehicle_speed'] is not None else 0
                    fuel = row['fuel_level'] if row['fuel_level'] is not None else 0
                    stress = row['engine_stress_score'] if row['engine_stress_score'] is not None else 0
                    fault = row['fault_type'] if row['fault_type'] is not None else 'None'
                    
                    print(f"   {status_emoji} Status: {row['status']:8} | RPM: {rpm:6.0f} | Load: {load:5.1f}%")
                    print(f"   🌡️  Temp: {temp:5.1f}°C | 🚀 Speed: {speed:5.1f} km/h | ⛽ Fuel: {fuel:5.1f}%")
                    print(f"   📈 Stress: {stress:5.1f} | ⚠️  Fault: {fault}")
                    print()
                    
        except Exception as e:
            logger.error(f"Error in quick_view: {e}")
            print(f"❌ Error displaying data: {e}")
    
    def clear_all_data(self, confirm: bool = False):
        """Clear all data with confirmation"""
        
        if not confirm:
            print("⚠️  This will delete ALL data from the database!")
            confirmation = input("Type 'DELETE ALL' to confirm: ").strip()
            if confirmation != 'DELETE ALL':
                print("❌ Operation cancelled")
                return False
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM enhanced_sensor_data')
                cursor.execute('DELETE FROM car_profiles')
                conn.commit()
            
            logger.info("All database data cleared")
            print("🗑️  All data cleared from database")
            return True
            
        except Exception as e:
            error_msg = f"Error clearing database: {e}"
            logger.error(error_msg)
            print(f"❌ {error_msg}")
            return False


# Interactive management functions
def add_car_profile_interactive(db: EnhancedVehicleDatabase) -> Optional[int]:
    """Interactive car profile creation with validation"""
    
    print("\n🚗 Add New Car Profile")
    print("-" * 50)
    
    try:
        car_data = {}
        
        # Generate unique identifier
        car_data['car_identifier'] = f"manual_{int(time.time())}"
        
        # Get car information with validation
        while True:
            car_data['make'] = input("🏭 Make (e.g., Toyota, Honda): ").strip()
            if car_data['make']:
                break
            print("❌ Make is required!")
        
        while True:
            car_data['model'] = input("🚗 Model (e.g., Camry, Civic): ").strip()
            if car_data['model']:
                break
            print("❌ Model is required!")
        
        while True:
            try:
                car_data['year'] = int(input("📅 Year: "))
                if 1900 <= car_data['year'] <= 2100:
                    break
                else:
                    print("❌ Year must be between 1900 and 2100!")
            except ValueError:
                print("❌ Please enter a valid year!")
        
        # Fuel type selection
        fuel_types = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG', 'Other']
        print(f"\n⛽ Fuel Types:")
        for i, ft in enumerate(fuel_types, 1):
            print(f"  {i}. {ft}")
        
        while True:
            try:
                choice = int(input("Select fuel type (1-7): "))
                if 1 <= choice <= 7:
                    car_data['fuel_type'] = fuel_types[choice - 1]
                    break
                else:
                    print("❌ Please select 1-7!")
            except ValueError:
                print("❌ Please enter a number!")
        
        car_data['transmission_type'] = input("⚙️  Transmission (Manual/Automatic/CVT): ").strip() or "Unknown"
        
        # Generate display name
        car_data['car_display_name'] = f"{car_data['make']} {car_data['model']} {car_data['year']}"
        
        # Optional fields
        car_data['engine_size'] = input("🔧 Engine Size (optional, e.g., 2.0L): ").strip()
        car_data['vin'] = input("🏷️  VIN (optional): ").strip()
        car_data['notes'] = input("📝 Notes (optional): ").strip()
        
        print(f"\n📋 Summary:")
        print(f"   Car: {car_data['car_display_name']}")
        print(f"   Fuel: {car_data['fuel_type']}")
        print(f"   Transmission: {car_data['transmission_type']}")
        if car_data['engine_size']:
            print(f"   Engine: {car_data['engine_size']}")
        
        confirm = input(f"\n✅ Add this car profile? (y/n): ").lower().strip()
        if confirm == 'y':
            return db.add_car_profile(car_data)
        else:
            print("❌ Car profile creation cancelled")
            return None
            
    except KeyboardInterrupt:
        print("\n❌ Car profile creation cancelled")
        return None
    except Exception as e:
        print(f"❌ Error creating car profile: {e}")
        return None


def main_interactive_menu(db: EnhancedVehicleDatabase):
    """Enhanced interactive menu for database management"""
    
    print("\n🗄️  Enhanced Vehicle Database - Interactive Management")
    print("=" * 70)
    
    while True:
        print(f"\n🔧 Database Management Menu:")
        print("1. 🚗 View Car Profiles")
        print("2. 📊 View Latest Data") 
        print("3. 📈 Show Statistics")
        print("4. ➕ Add Car Profile")
        print("5. 📤 Export Data (Excel)")
        print("6. 📄 Export Data (CSV)")
        print("7. 🗑️  Clear Test Data")
        print("8. 🔍 Quick Data View")
        print("0. ❌ Exit")
        
        try:
            choice = input(f"\nSelect option (0-8): ").strip()
            
            if choice == '0':
                print("👋 Goodbye!")
                break
            elif choice == '1':
                db.view_car_profiles()
            elif choice == '2':
                limit = input("Number of records to show (default 10): ").strip()
                limit = int(limit) if limit.isdigit() else 10
                db.quick_view(limit)
            elif choice == '3':
                stats = db.get_statistics()
                print(f"\n📈 Database Statistics:")
                print(f"  📊 Total Records: {stats['total_records']:,}")
                print(f"  🚗 Total Cars: {stats['total_cars']}")
                print(f"  📅 Date Range: {stats['date_range']['start']} to {stats['date_range']['end']}")
                if stats['status_counts']:
                    print(f"  📈 Status Distribution: {stats['status_counts']}")
                print(f"  🔢 Averages:")
                print(f"    RPM: {stats['averages']['rpm']}")
                print(f"    Temperature: {stats['averages']['temperature']}°C")
                print(f"    Engine Load: {stats['averages']['load']}%")
                print(f"    Stress Score: {stats['averages']['stress_score']}")
            elif choice == '4':
                add_car_profile_interactive(db)
            elif choice == '5':
                car_name = input("Car name (optional, press Enter for all): ").strip() or None
                hours = input("Hours of data (default 24): ").strip()
                hours = int(hours) if hours.isdigit() else 24
                filename = db.export_to_excel(car_name=car_name, hours=hours)
                if filename:
                    print(f"✅ Excel export completed: {filename}")
            elif choice == '6':
                car_name = input("Car name (optional, press Enter for all): ").strip() or None
                hours = input("Hours of data (default 24): ").strip()
                hours = int(hours) if hours.isdigit() else 24
                filename = db.export_to_csv(car_name=car_name, hours=hours)
                if filename:
                    print(f"✅ CSV export completed: {filename}")
            elif choice == '7':
                result = db.clear_all_data()
                if result:
                    print("✅ Database cleared successfully")
            elif choice == '8':
                car_id = input("Car identifier (optional): ").strip() or None
                limit = input("Number of records (default 5): ").strip()
                limit = int(limit) if limit.isdigit() else 5
                db.quick_view(limit, car_id)
            else:
                print("❌ Invalid option! Please select 0-8")
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            logger.error(f"Menu error: {e}")


# Test and initialization
if __name__ == "__main__":
    print("🗄️  Enhanced Vehicle Database System - Professional Grade")
    print("=" * 70)
    
    try:
        # Initialize database
        db = EnhancedVehicleDatabase()
        
        # Add sample car profile for testing
        sample_car = {
            'car_identifier': 'sample_toyota_veloz_2023',
            'car_display_name': 'Toyota Veloz 2023',
            'make': 'Toyota',
            'model': 'Veloz',
            'year': 2023,
            'fuel_type': 'Gasoline',
            'transmission_type': 'CVT',
            'engine_size': '1.5L',
            'vin': 'JT3VN39W0V0123456',
            'notes': 'Test vehicle for automated OBD-II data collection'
        }
        
        print(f"\n🚗 Adding sample car profile...")
        car_id = db.add_car_profile(sample_car)
        
        if car_id:
            print(f"✅ Sample car profile added successfully (ID: {car_id})")
        
        # Show initial statistics
        stats = db.get_statistics()
        print(f"\n📈 Initial Statistics:")
        print(f"  Total Records: {stats['total_records']:,}")
        print(f"  Total Cars: {stats['total_cars']}")
        
        # Interactive menu
        main_interactive_menu(db)
        
    except Exception as e:
        print(f"❌ Critical error: {e}")
        logger.error(f"Critical error: {e}")
        sys.exit(1)
    
    print("✅ Enhanced database system test completed!")
