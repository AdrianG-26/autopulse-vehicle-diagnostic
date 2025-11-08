#!/usr/bin/env python3
"""
Simple WebSocket server for streaming vehicle data
Runs on port 8080 as expected by React app
"""

import asyncio
import websockets
import json
import sqlite3
import pandas as pd
import time
from pathlib import Path

DB_PATH = Path(__file__).parent / "src" / "data" / "vehicle_data.db"

async def handle_websocket(websocket, path):
    """Handle WebSocket connections and stream vehicle data"""
    print('🔌 WebSocket client connected')
    
    try:
        while True:
            try:
                # Get latest sensor data from database
                if DB_PATH.exists():
                    conn = sqlite3.connect(DB_PATH)
                    # Updated query to match actual database schema
                    query = '''
                    SELECT 
                        car_profile_id, rpm, coolant_temp, engine_load, throttle_pos, 
                        vehicle_speed, fuel_level, timing_advance, intake_temp,
                        maf, map, fuel_trim_short, fuel_trim_long, fuel_pressure,
                        control_module_voltage, timestamp, status, session_id
                    FROM enhanced_sensor_data 
                    ORDER BY timestamp DESC 
                    LIMIT 1
                    '''
                    
                    result = pd.read_sql_query(query, conn)
                    conn.close()
                    
                    if not result.empty:
                        row = result.iloc[0]
                        # Format data to match both local DB structure and React app expectations
                        websocket_data = {
                            # Metadata
                            'timestamp': int(time.time() * 1000),
                            'carProfileId': int(row['car_profile_id']) if pd.notna(row['car_profile_id']) else None,
                            'sessionId': str(row['session_id']) if pd.notna(row['session_id']) else None,
                            
                            # Core engine metrics (React app compatibility names)
                            'rpm': float(row['rpm']) if pd.notna(row['rpm']) else 0,
                            'speed': float(row['vehicle_speed']) if pd.notna(row['vehicle_speed']) else 0,
                            'coolantTemp': float(row['coolant_temp']) if pd.notna(row['coolant_temp']) else 90,
                            'battery': float(row['control_module_voltage']) if pd.notna(row['control_module_voltage']) else 12.3,
                            
                            # Performance metrics
                            'engineLoad': float(row['engine_load']) if pd.notna(row['engine_load']) else 0,
                            'engineLoadPct': float(row['engine_load']) if pd.notna(row['engine_load']) else 0,
                            'throttlePosition': float(row['throttle_pos']) if pd.notna(row['throttle_pos']) else 0,
                            'ignitionAdvance': float(row['timing_advance']) if pd.notna(row['timing_advance']) else 0,
                            
                            # Fuel system
                            'fuelLevelPct': float(row['fuel_level']) if pd.notna(row['fuel_level']) else 50,
                            'fuelLevel': float(row['fuel_level']) if pd.notna(row['fuel_level']) else 50,
                            'stftB1Pct': float(row['fuel_trim_short']) if pd.notna(row['fuel_trim_short']) else 0,
                            'ltftB1Pct': float(row['fuel_trim_long']) if pd.notna(row['fuel_trim_long']) else 0,
                            'fuelPressureKpa': float(row['fuel_pressure']) if pd.notna(row['fuel_pressure']) else 0,
                            
                            # Air flow & pressure
                            'mapKpa': float(row['map']) if pd.notna(row['map']) else 0,
                            'intakeAirTemp': float(row['intake_temp']) if pd.notna(row['intake_temp']) else 25,
                            
                            # Status
                            'systemStatus': str(row['status']) if pd.notna(row['status']) else 'NORMAL',
                            'status': str(row['status']) if pd.notna(row['status']) else 'NORMAL'
                        }
                        
                        # Add MAF if available
                        if pd.notna(row['maf']):
                            websocket_data['maf'] = float(row['maf'])
                        
                        print(f'📡 Streaming Car {websocket_data["carProfileId"]}: RPM={websocket_data["rpm"]:.0f}, Temp={websocket_data["coolantTemp"]:.1f}°C, Status={websocket_data["systemStatus"]}')
                    else:
                        # Send demo data if no real data available
                        websocket_data = {
                            'timestamp': int(time.time() * 1000),
                            'rpm': 850,
                            'speed': 0,
                            'coolantTemp': 90,
                            'battery': 12.3,
                            'engineLoad': 0,
                            'systemStatus': 'NO_DATA'
                        }
                        print('📡 Streaming demo data (no OBD data yet)')
                else:
                    # Send demo data if database doesn't exist
                    websocket_data = {
                        'timestamp': int(time.time() * 1000),
                        'rpm': 850,
                        'speed': 0,
                        'coolantTemp': 90,
                        'battery': 12.3,
                        'systemStatus': 'NO_DATABASE'
                    }
                    print('📡 Streaming demo data (no database)')
                
                # Send data to WebSocket client
                await websocket.send(json.dumps(websocket_data))
                
            except Exception as e:
                print(f'❌ WebSocket streaming error: {e}')
                
            # Send data every second
            await asyncio.sleep(1)
            
    except websockets.exceptions.ConnectionClosed:
        print('🔌 WebSocket client disconnected')
    except Exception as e:
        print(f'❌ WebSocket error: {e}')

async def main():
    """Start the WebSocket server"""
    print('🚀 Starting WebSocket server on ws://0.0.0.0:8080')
    print('📡 Streaming vehicle diagnostic data...')
    print('📍 Accessible at:')
    print('   - ws://localhost:8080 (local)')
    print('   - ws://192.168.1.100:8080 (network)')
    
    async with websockets.serve(handle_websocket, '0.0.0.0', 8080):
        await asyncio.Future()  # Run forever

if __name__ == '__main__':
    asyncio.run(main())