import React from "react";

const Dashboard = () => {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p>De La Salle-Lipa Air Quality Monitoring</p>
        </div>
        <div className="header-right">
          <button className="notification-btn">🔔</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="metrics-cards">
          <div className="metric-card pm25">
            <div className="metric-icon">🌱</div>
            <div className="metric-value">17</div>
            <div className="metric-label">
              <span>µg/m³</span>
              <span>PM2.5</span>
            </div>
          </div>

          <div className="metric-card pm10">
            <div className="metric-icon">💨</div>
            <div className="metric-value">38</div>
            <div className="metric-label">
              <span>µg/m³</span>
              <span>PM10</span>
            </div>
          </div>

          <div className="metric-card co2">
            <div className="metric-icon">☁️</div>
            <div className="metric-value">1048</div>
            <div className="metric-label">
              <span>ppm</span>
              <span>CO₂</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="campus-map-section">
            <h3>🏫 Campus Sensor Map</h3>
            <div className="map-placeholder">
              <div className="map-content">
                <p>Campus sensor map will be rendered here</p>
              </div>
            </div>
          </div>

          <div className="notifications-section">
            <h3>⚠️ Notifications</h3>
            <div className="notifications-content">
              <div className="notification-item danger">
                <span className="notification-dot red"></span>
                <div>
                  <strong>CO₂ Level Unhealthy</strong>
                  <p>Main Building, 2nd Floor - 1048 ppm at 2:05 PM</p>
                </div>
              </div>

              <div className="notification-item warning">
                <span className="notification-dot yellow"></span>
                <div>
                  <strong>PM10 Moderate</strong>
                  <p>Library - 38 µg/m³ at 1:58 PM</p>
                </div>
              </div>

              <div className="notification-item good">
                <span className="notification-dot green"></span>
                <div>
                  <strong>PM2.5 Good</strong>
                  <p>Gym - 17 µg/m³ at 1:43 PM</p>
                </div>
              </div>

              <button className="view-all-btn">View All →</button>
            </div>
          </div>

          <div className="chart-section">
            <h3>📊 PM2.5 - Last 7 Days</h3>
            <div className="chart-placeholder">
              <p>PM2.5 trend chart will be rendered here</p>
            </div>
          </div>

          <div className="chart-section">
            <h3>📊 CO₂ - Last 7 Days</h3>
            <div className="chart-placeholder">
              <p>CO₂ trend chart will be rendered here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
