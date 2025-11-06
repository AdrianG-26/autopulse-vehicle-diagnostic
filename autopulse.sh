#!/bin/bash

# AutoPulse System Control Script
# Quick start/stop/restart commands

case "$1" in
    start)
        echo "🚀 Starting AutoPulse system..."
        sudo systemctl start autopulse.service
        sleep 3
        ./check_status.sh
        ;;
    stop)
        echo "⏹️ Stopping AutoPulse system..."
        sudo systemctl stop autopulse.service
        pkill -f cloud_collector_daemon.py
        pkill -f cloud_web_server.py
        echo "✅ AutoPulse system stopped"
        ;;
    restart)
        echo "🔄 Restarting AutoPulse system..."
        sudo systemctl restart autopulse.service
        sleep 3
        ./check_status.sh
        ;;
    status)
        ./check_status.sh
        ;;
    logs)
        echo "📝 Recent system logs:"
        echo "====================="
        tail -20 /home/rocketeers/autopulse_logs/collector.log 2>/dev/null || echo "No collector logs"
        echo ""
        tail -20 /home/rocketeers/autopulse_logs/server.log 2>/dev/null || echo "No server logs"
        ;;
    install)
        ./install_autostart.sh
        ;;
    *)
        echo "🚗 AutoPulse System Control"
        echo "=========================="
        echo ""
        echo "Usage: $0 {start|stop|restart|status|logs|install}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the AutoPulse service"
        echo "  stop     - Stop the AutoPulse service"  
        echo "  restart  - Restart the AutoPulse service"
        echo "  status   - Show current system status"
        echo "  logs     - Show recent log entries"
        echo "  install  - Run the installation script"
        exit 1
        ;;
esac
