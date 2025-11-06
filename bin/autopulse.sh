#!/bin/bash

# AutoPulse Control Script - Easy system management
# Updated for organized file structure

# Get the project root directory
PROJECT_ROOT="/home/rocketeers/vehicle_diagnostic_system"

case "$1" in
    "status")
        echo "🔍 AutoPulse System Status"
        "$PROJECT_ROOT/bin/check_status.sh"
        ;;
    "test")
        echo "🧪 Testing OBD Connection"
        "$PROJECT_ROOT/scripts/obd/quick_obd_test.sh"
        ;;
    "live")
        echo "📊 Starting Live Data Monitor"
        echo "💡 Make sure your car is ON and OBD scanner is connected!"
        read -p "Press Enter to continue or Ctrl+C to cancel..."
        "$PROJECT_ROOT/scripts/obd/obd_live_data.sh"
        ;;
    "logs")
        echo "📋 Recent AutoPulse Logs"
        echo "========================"
        echo "🔗 OBD Auto-Connect Logs:"
        sudo journalctl -u obd-autoconnect.service -n 10 --no-pager
        echo ""
        echo "🚗 AutoPulse Service Logs:"
        sudo journalctl -u autopulse.service -n 10 --no-pager
        echo ""
        if [ -f "$PROJECT_ROOT/logs/obd_autoconnect.log" ]; then
            echo "📝 OBD Connection Log:"
            tail -10 "$PROJECT_ROOT/logs/obd_autoconnect.log"
        fi
        ;;
    "restart")
        echo "🔄 Restarting AutoPulse Services"
        sudo systemctl restart autopulse.service
        sudo systemctl restart obd-autoconnect.service
        echo "✅ Services restarted"
        "$PROJECT_ROOT/bin/check_status.sh"
        ;;
    "stop")
        echo "🛑 Stopping AutoPulse Services"
        sudo systemctl stop autopulse.service
        sudo systemctl stop obd-autoconnect.service
        echo "✅ Services stopped"
        ;;
    "start")
        echo "▶️ Starting AutoPulse Services"
        sudo systemctl start autopulse.service
        sudo systemctl start obd-autoconnect.service
        echo "✅ Services started"
        "$PROJECT_ROOT/bin/check_status.sh"
        ;;
    *)
        echo "🚗 AutoPulse Control Panel"
        echo "========================="
        echo ""
        echo "Usage: ./autopulse [command]"
        echo ""
        echo "📊 Status & Monitoring:"
        echo "  status    - Show system status"
        echo "  test      - Test OBD connection"
        echo "  live      - Show live vehicle data"
        echo "  logs      - View recent logs"
        echo ""
        echo "🔧 Service Control:"
        echo "  start     - Start AutoPulse services"
        echo "  stop      - Stop AutoPulse services"
        echo "  restart   - Restart AutoPulse services"
        echo ""
        echo "💡 Quick Start:"
        echo "  1. ./autopulse status    # Check system"
        echo "  2. ./autopulse test      # Test OBD"
        echo "  3. ./autopulse live      # Monitor data"
        echo ""
        echo "📁 File Organization:"
        echo "  bin/           - Main control scripts"
        echo "  scripts/obd/   - OBD-related tools"
        echo "  scripts/system/ - System management"
        echo "  docs/          - Documentation"
        echo ""
        echo "🚗 Ready for vehicle diagnostics!"
        ;;
esac
