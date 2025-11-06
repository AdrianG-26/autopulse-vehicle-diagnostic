// Mock ML Service for deployed website
// Provides demo data when real backend is not available

class MockMLService {
  constructor() {
    this.isConnected = true;
    this.mockData = {
      healthScore: 85,
      status: 'NORMAL',
      alerts: [
        'Scheduled maintenance due in 2 weeks',
        'Engine temperature is optimal',
        'Fuel efficiency is above average'
      ],
      confidence: 0.92,
      sensorData: {
        rpm: 2500,
        coolantTemp: 85,
        engineLoadPct: 25,
        throttlePosition: 15,
        speed: 45,
        fuelLevelPct: 78
      },
      statistics: {
        totalTrips: 142,
        avgFuelEfficiency: 28.5,
        totalMileage: 12450,
        healthTrend: 'stable'
      }
    };
  }

  async checkConnection() {
    // Simulate API response
    return {
      success: true,
      model: 'Random Forest v2.1',
      accuracy: 0.94,
      lastTrained: '2024-10-15'
    };
  }

  async predictVehicleHealth(sensorData = {}) {
    // Simulate slight variations in health score
    const baseScore = this.mockData.healthScore;
    const variation = (Math.random() - 0.5) * 10; // ±5 points
    const healthScore = Math.max(0, Math.min(100, baseScore + variation));
    
    let status = 'NORMAL';
    let alerts = [...this.mockData.alerts];
    
    if (healthScore < 60) {
      status = 'WARNING';
      alerts.unshift('⚠️ Vehicle health requires attention');
    } else if (healthScore < 80) {
      status = 'ADVISORY';
      alerts.unshift('💡 Monitor vehicle performance closely');
    }

    return {
      success: true,
      healthScore: Math.round(healthScore),
      status,
      alerts,
      confidence: this.mockData.confidence,
      method: 'Mock ML Prediction',
      timestamp: new Date().toISOString()
    };
  }

  async getCurrentHealth() {
    const prediction = await this.predictVehicleHealth();
    return {
      success: true,
      ...prediction,
      lastUpdate: new Date().toISOString()
    };
  }

  async getMaintenanceAlerts() {
    return {
      success: true,
      alerts: this.mockData.alerts.map((alert, index) => ({
        id: `alert-${index}`,
        message: alert,
        severity: index === 0 ? 'info' : 'low',
        timestamp: new Date(Date.now() - index * 86400000).toISOString() // Days ago
      })),
      count: this.mockData.alerts.length
    };
  }

  async getSensorData() {
    // Simulate live sensor data with small variations
    const data = { ...this.mockData.sensorData };
    Object.keys(data).forEach(key => {
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      data[key] = Math.round(data[key] * (1 + variation));
    });

    return {
      success: true,
      data: [{
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now()
      }],
      count: 1
    };
  }

  // UI helper methods
  getHealthScoreColor(score) {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Yellow
    if (score >= 40) return "#ef4444"; // Red
    return "#dc2626"; // Dark red
  }

  getStatusDisplay(status) {
    const statusMap = {
      NORMAL: { text: "Excellent", color: "#10b981", icon: "✅" },
      ADVISORY: { text: "Good", color: "#f59e0b", icon: "💡" },
      WARNING: { text: "Attention Needed", color: "#ef4444", icon: "⚠️" },
      CRITICAL: { text: "Critical", color: "#dc2626", icon: "🚨" },
      UNKNOWN: { text: "Unknown", color: "#6b7280", icon: "❓" },
    };
    return statusMap[status] || statusMap["UNKNOWN"];
  }

  formatAlertsForUI(alerts) {
    return alerts.map((alert, index) => {
      let type = "info";
      if (alert.includes("CRITICAL")) type = "error";
      else if (alert.includes("WARNING")) type = "warning";
      else if (alert.includes("ADVISORY")) type = "warning";

      return {
        id: `mock-alert-${index}`,
        type,
        title: "Vehicle Status",
        message: alert,
        timestamp: Date.now(),
        source: "Mock API Demo",
      };
    });
  }
}

export const mockMLService = new MockMLService();
export default mockMLService;
