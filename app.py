#!/usr/bin/env python3
"""
Render Entry Point - Redirects to src/cloud_web_server.py
This file helps Render detect this as a Python project.
"""

import sys
import os
from pathlib import Path

# Add src directory to Python path
src_dir = Path(__file__).parent / "src"
sys.path.insert(0, str(src_dir))

# Import and run the cloud web server
if __name__ == "__main__":
    os.chdir(src_dir)
    from cloud_web_server import app, socketio
    import os
    
    # Get port from environment (Render sets PORT automatically)
    port = int(os.getenv('PORT', 5000))
    
    # Run the Flask app
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
