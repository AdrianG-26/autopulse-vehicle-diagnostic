# Start the collector (manually)

sudo systemctl start autopulse-collector

# Stop the collector

sudo systemctl stop autopulse-collector

# Restart the collector

sudo systemctl restart autopulse-collector

# Check if it's running

sudo systemctl status autopulse-collector

# Enable auto-start on boot

sudo systemctl enable autopulse-collector

# Disable auto-start on boot

sudo systemctl disable autopulse-collector

==================================================

# See recent logs

sudo journalctl -u autopulse-collector -n 50

# Follow logs in real-time (like tail -f)

sudo journalctl -u autopulse-collector -f

# See logs since boot

sudo journalctl -u autopulse-collector -b
