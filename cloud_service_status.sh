#!/bin/bash
echo "════════════════════════════════════════"
echo "🚗 Cloud Collector Service Status"
echo "════════════════════════════════════════"
echo ""
echo "📡 RFCOMM Device:"
ls -la /dev/rfcomm0 2>/dev/null || echo "  ❌ Not found"
echo ""
echo "🔧 Services:"
sudo systemctl is-active rfcomm-obd && echo "  ✅ RFCOMM: active" || echo "  ❌ RFCOMM: inactive"
sudo systemctl is-active vehicle-cloud-collector && echo "  ✅ Collector: active" || echo "  ❌ Collector: inactive"
echo ""
echo "📊 Recent logs:"
sudo journalctl -u vehicle-cloud-collector -n 10 --no-pager
