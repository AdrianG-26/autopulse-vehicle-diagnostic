#!/bin/bash

# AutoPulse Project File Organization Script
# Organizes files into logical directory structure

echo "🗂️  Organizing AutoPulse Project Files..."
echo "========================================"

# Create directory structure if it doesn't exist
mkdir -p {bin,config,docs,logs,scripts/{obd,system,legacy},systemd,udev,archive}

echo "📁 Moving files to organized structure..."

# Move main executable scripts to bin/
echo "  → Moving main executables to bin/"
mv autopulse.sh bin/ 2>/dev/null || true
mv check_status.sh bin/ 2>/dev/null || true

# Move OBD-related scripts to scripts/obd/
echo "  → Moving OBD scripts to scripts/obd/"
mv obd_*.sh scripts/obd/ 2>/dev/null || true
mv quick_obd_test.sh scripts/obd/ 2>/dev/null || true
mv test_obd_connection.sh scripts/obd/ 2>/dev/null || true
mv setup_obd_connection.sh scripts/obd/ 2>/dev/null || true
mv check_obd_setup.sh scripts/obd/ 2>/dev/null || true

# Move system scripts to scripts/system/
echo "  → Moving system scripts to scripts/system/"
mv install_autostart.sh scripts/system/ 2>/dev/null || true
mv rpi_autostart.sh scripts/system/ 2>/dev/null || true

# Move systemd service files to systemd/
echo "  → Moving systemd files to systemd/"
mv *.service systemd/ 2>/dev/null || true

# Move udev rules to udev/
echo "  → Moving udev rules to udev/"
mv *.rules udev/ 2>/dev/null || true

# Move documentation to docs/
echo "  → Moving documentation to docs/"
mv *.md docs/ 2>/dev/null || true
cp docs/README.md . 2>/dev/null || true  # Keep main README in root

# Archive duplicate/legacy files
echo "  → Archiving legacy files..."
if [ -d "scripts" ] && [ "$(ls scripts/*.sh 2>/dev/null | wc -l)" -gt 0 ]; then
    mv scripts/*.sh scripts/legacy/ 2>/dev/null || true
fi

# Create symlinks for easy access to main tools
echo "📎 Creating convenient symlinks..."
ln -sf bin/autopulse.sh autopulse 2>/dev/null || true
ln -sf bin/check_status.sh status 2>/dev/null || true
ln -sf scripts/obd/quick_obd_test.sh obd-test 2>/dev/null || true
ln -sf scripts/obd/obd_live_data.sh obd-live 2>/dev/null || true

echo ""
echo "✅ Project organization complete!"
echo ""
echo "📊 New Directory Structure:"
echo "├── bin/                     # Main executable scripts"
echo "│   ├── autopulse.sh         # Master control panel"
echo "│   └── check_status.sh      # System status checker"
echo "├── scripts/"
echo "│   ├── obd/                 # OBD-related scripts"
echo "│   │   ├── obd_live_data.sh # Live vehicle data"
echo "│   │   ├── quick_obd_test.sh# Quick OBD test"
echo "│   │   └── setup_obd_connection.sh"
echo "│   ├── system/              # System management"
echo "│   │   ├── install_autostart.sh"
echo "│   │   └── rpi_autostart.sh"
echo "│   └── legacy/              # Old/duplicate scripts"
echo "├── systemd/                 # Systemd service files"
echo "├── udev/                    # Udev rules"
echo "├── docs/                    # Documentation"
echo "├── config/                  # Configuration files"
echo "├── logs/                    # Log files"
echo "└── backend/                 # Backend Python code"
echo ""
echo "🎯 Quick Access (symlinks):"
echo "  ./autopulse    → bin/autopulse.sh"
echo "  ./status       → bin/check_status.sh" 
echo "  ./obd-test     → scripts/obd/quick_obd_test.sh"
echo "  ./obd-live     → scripts/obd/obd_live_data.sh"
