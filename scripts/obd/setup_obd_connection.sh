#!/bin/bash

# Simple OBD Connection Setup Script
# Just sets up the rfcomm serial interface for the paired OBD scanner

OBD_MAC="00:1D:A5:68:98:8A"
RFCOMM_DEVICE="/dev/rfcomm0"

echo "🔌 Setting up OBD serial connection..."

# Check if already connected
if [ -c "$RFCOMM_DEVICE" ]; then
    echo "✅ OBD serial device already exists at $RFCOMM_DEVICE"
    exit 0
fi

# Create the rfcomm serial device
echo "🔄 Creating rfcomm serial device..."
sudo rfcomm bind 0 "$OBD_MAC"

# Verify it was created
if [ -c "$RFCOMM_DEVICE" ]; then
    echo "✅ OBD serial device created at $RFCOMM_DEVICE"
    echo "ℹ️  The OBD scanner will be ready when plugged into a car"
else
    echo "❌ Failed to create OBD serial device"
    exit 1
fi
