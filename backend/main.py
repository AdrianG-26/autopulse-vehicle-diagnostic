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
    from cloud_web_server import app, socketio, logger
    
    # Get port from environment (Render sets PORT automatically)
    port = int(os.getenv('PORT', 5000))
    
    logger.info(f"🚀 AutoPulse Backend starting on port {port}")
    
    # Run the Flask app
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
