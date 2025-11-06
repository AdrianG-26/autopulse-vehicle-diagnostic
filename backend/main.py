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
        # Try to import with SocketIO
        from cloud_web_server import app, socketio, logger
        
        if socketio is not None:
            # Get port from environment (Render sets PORT automatically)
            port = int(os.getenv('PORT', 5000))
            host = '0.0.0.0'
            
            logger.info(f"🚀 AutoPulse Backend (with SocketIO) starting on {host}:{port}")
            
            # Run with SocketIO (preferred for real-time features)
            socketio.run(app, host=host, port=port, debug=False, allow_unsafe_werkzeug=True)
        else:
            # Fallback to regular Flask if SocketIO failed to initialize
            port = int(os.getenv('PORT', 5000))
            host = '0.0.0.0'
            
            logger.info(f"🚀 AutoPulse Backend (Flask only) starting on {host}:{port}")
            
            # Run basic Flask app
            app.run(host=host, port=port, debug=False)
            
    except Exception as e:
        # Final fallback: basic Flask import
        logger.error(f"❌ Error with SocketIO import: {e}")
        
        from cloud_web_server import app, logger
        
        port = int(os.getenv('PORT', 5000))
        host = '0.0.0.0'
        
        logger.info(f"🚀 AutoPulse Backend (fallback mode) starting on {host}:{port}")
        
        # Run basic Flask app
        app.run(host=host, port=port, debug=False)
