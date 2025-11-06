#!/usr/bin/env python3
"""
AutoPulse Backend - Main Entry Point for Render
Clean Python Flask API server for vehicle diagnostics
"""

import os
import sys
from pathlib import Path

# Ensure we're in the right directory
current_dir = Path(__file__).parent
os.chdir(current_dir)

# Import and run the cloud web server
if __name__ == "__main__":
    try:
        from cloud_web_server import app, socketio, logger
        
        # Get port from environment (Render sets PORT automatically)
        port = int(os.getenv('PORT', 5000))
        host = '0.0.0.0'
        
        logger.info(f"🚀 AutoPulse Backend starting on {host}:{port}")
        
        # Run with SocketIO (preferred for real-time features)
        socketio.run(app, host=host, port=port, debug=False, allow_unsafe_werkzeug=True)
        
    except ImportError as e:
        # Fallback: run basic Flask app if SocketIO unavailable
        from cloud_web_server import app, logger
        
        port = int(os.getenv('PORT', 5000))
        host = '0.0.0.0'
        
        logger.info(f"🚀 AutoPulse Backend (basic mode) starting on {host}:{port}")
        logger.warning(f"SocketIO unavailable: {e}")
        
        # Run basic Flask app
        app.run(host=host, port=port, debug=False)
