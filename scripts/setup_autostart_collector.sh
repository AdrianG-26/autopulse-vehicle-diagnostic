#!/bin/bash
# AutoPulse - Setup Automatic OBD Data Collection on Boot
# Run this script on Raspberry Pi to enable automatic startup

set -e

echo "🚀 AutoPulse OBD Collector - Autostart Setup"
echo "==========================================="
echo ""

# Check if running on Pi
if [ ! -f /proc/device-tree/model ]; then
    echo "⚠️  Warning: This doesn't appear to be a Raspberry Pi"
    read -p "Continue anyway? (y/N): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

# Check for required files
PROJECT_DIR="/home/rocketeers/vehicle_diagnostic_system"
SERVICE_FILE="$PROJECT_DIR/systemd/autopulse-collector.service"
COLLECTOR_SCRIPT="$PROJECT_DIR/src/cloud_collector_daemon_pro.py"

if [ ! -f "$COLLECTOR_SCRIPT" ]; then
    echo "❌ Collector script not found: $COLLECTOR_SCRIPT"
    exit 1
fi

if [ ! -f "$SERVICE_FILE" ]; then
    echo "❌ Service file not found: $SERVICE_FILE"
    exit 1
fi

echo "✅ Required files found"
echo ""

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p "$PROJECT_DIR/logs"
chmod 755 "$PROJECT_DIR/logs"

# Make collector script executable
echo "🔧 Making collector script executable..."
chmod +x "$COLLECTOR_SCRIPT"

# Install systemd service
echo "📋 Installing systemd service..."
sudo cp "$SERVICE_FILE" /etc/systemd/system/autopulse-collector.service
sudo chmod 644 /etc/systemd/system/autopulse-collector.service

# Reload systemd
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

# Enable service to start on boot
echo "🚀 Enabling autostart on boot..."
sudo systemctl enable autopulse-collector.service

# Start service now
echo "▶️  Starting service..."
sudo systemctl start autopulse-collector.service

echo ""
echo "✅ Setup complete!"
echo ""
echo "Service Status:"
sudo systemctl status autopulse-collector.service --no-pager -l
echo ""
echo "📊 Useful Commands:"
echo "  Check status:       sudo systemctl status autopulse-collector"
echo "  View live logs:     sudo journalctl -u autopulse-collector -f"
echo "  Stop service:       sudo systemctl stop autopulse-collector"
echo "  Restart service:    sudo systemctl restart autopulse-collector"
echo "  Disable autostart:  sudo systemctl disable autopulse-collector"
echo ""
echo "🔍 To verify data is reaching Supabase:"
echo "  python3 $PROJECT_DIR/scripts/check_supabase_data.py"
echo ""
echo "🎉 The collector will now start automatically on every boot!"
