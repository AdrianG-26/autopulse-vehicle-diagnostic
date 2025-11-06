#!/bin/bash

echo "🔧 Installing AutoPulse Auto-Startup System..."
echo "=============================================="

# Check if running as root for service installation
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please run this script as regular user (not root/sudo)"
    echo "The script will prompt for sudo when needed"
    exit 1
fi

# Ensure we're in the right directory
cd /home/rocketeers/vehicle_diagnostic_system

# Make scripts executable
echo "📝 Making scripts executable..."
chmod +x rpi_autostart.sh
chmod +x install_autostart.sh
chmod +x check_status.sh
chmod +x autopulse.sh

# Install Python dependencies
echo "📦 Installing Python dependencies..."
if [ -d ".venv" ]; then
    echo "✅ Using existing virtual environment"
    source .venv/bin/activate
else
    echo "🔄 Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
fi

pip install --upgrade pip
pip install -r backend/requirements.txt

# Create log directory
echo "📂 Creating log directory..."
mkdir -p /home/rocketeers/autopulse_logs

# Install system service
echo "⚙️ Installing system service..."
sudo cp autopulse.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable autopulse.service

# Create udev rules for OBD adapter auto-detection
echo "🔌 Setting up OBD adapter auto-detection..."
sudo tee /etc/udev/rules.d/99-obd-adapter.rules << 'EOF'
# Auto-detect OBD-II adapters
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", MODE="0666", GROUP="dialout", SYMLINK+="obd-adapter"
SUBSYSTEM=="tty", ATTRS{idVendor}=="0403", ATTRS{idProduct}=="6001", MODE="0666", GROUP="dialout", SYMLINK+="obd-adapter"
SUBSYSTEM=="tty", KERNEL=="ttyUSB*", MODE="0666", GROUP="dialout"
SUBSYSTEM=="tty", KERNEL=="ttyACM*", MODE="0666", GROUP="dialout"
EOF

# Add user to dialout group for serial access
echo "👤 Adding user to dialout group..."
sudo usermod -a -G dialout $USER

echo ""
echo "✅ Installation complete!"
echo ""
echo "🎯 IMPORTANT - Next Steps:"
echo "1. 📝 Your Supabase key is already configured in rpi_autostart.sh"
echo ""
echo "2. 🔄 Reboot your RPi to start the service:"
echo "   sudo reboot"
echo ""
echo "3. 🔌 After reboot, plug in OBD adapter and turn on car"
echo ""
echo "4. ✅ System will start automatically!"
echo ""
echo "📊 Monitor system:"
echo "   ./check_status.sh                    # Check system status"
echo "   ./autopulse.sh status                # Quick status check"
echo "   ./autopulse.sh logs                  # View recent logs"
echo "   ./autopulse.sh live                  # Live monitoring"
echo ""
