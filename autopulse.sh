#!/bin/bash

# AutoPulse Control Script - Easy system management

case "$1" in
    "status")
        echo "🔍 AutoPulse System Status"
        ./check_status.sh
        ;;
    "test")
        echo "🧪 Testing OBD Connection"
        ./quick_obd_test.sh
        ;;
    "live")
        echo "📊 Starting Live Data Monitor"
        echo "💡 Make sure your car is ON and OBD scanner is connected!"
        read -p "Press Enter to continue or Ctrl+C to cancel..."
        ./obd_live_data.sh
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
        if [ -f "/home/rocketeers/autopulse_logs/obd_autoconnect.log" ]; then
            echo "📝 OBD Connection Log:"
            tail -10 /home/rocketeers/autopulse_logs/obd_autoconnect.log
        fi
        ;;
    "restart")
        echo "🔄 Restarting AutoPulse Services"
        sudo systemctl restart autopulse.service
        sudo systemctl restart obd-autoconnect.service
        echo "✅ Services restarted"
        ./check_status.sh
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
        ./check_status.sh
        ;;
    *)
        echo "🚗 AutoPulse Control Panel"
        echo "========================="
        echo ""
        echo "Usage: ./autopulse.sh [command]"
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
        echo "  1. ./autopulse.sh status    # Check system"
        echo "  2. ./autopulse.sh test      # Test OBD"
        echo "  3. ./autopulse.sh live      # Monitor data"
        echo ""
        echo "🚗 Ready for vehicle diagnostics!"
        ;;
esac
