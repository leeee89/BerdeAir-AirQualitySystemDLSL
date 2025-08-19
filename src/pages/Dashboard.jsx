import React, { useState } from "react";
import {
  BarChart3,
  Bell,
  Settings,
  Database,
  LogOut,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const sidebarItems = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard", active: true },
    { id: "alerts", icon: Bell, label: "Alerts" },
    { id: "reports", icon: TrendingUp, label: "Reports" },
    { id: "sensor-settings", icon: Settings, label: "Sensor Settings" },
    { id: "historical-data", icon: Database, label: "Historical Data" },
  ];

  const notifications = [
    {
      type: "warning",
      title: "CO₂ Level Unhealthy",
      location: "Library Building",
      time: "1:28 hours ago",
      className: "warning",
      icon: AlertTriangle,
    },
    {
      type: "warning",
      title: "PM10 Moderate",
      location: "Library",
      time: "36 min at 1:53 PM",
      className: "warning",
      icon: AlertTriangle,
    },
    {
      type: "good",
      title: "PM2.5 Good",
      location: "Gym-Oval Hall",
      time: "at 1:45 PM",
      className: "good",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <span>B</span>
            </div>
            <div className="brand-text">
              <h2>BerdeAir</h2>
              <p>Air Quality Monitoring</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {sidebarItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={activeSection === item.id ? "active" : ""}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="header">
          <div className="header-content">
            <div className="header-title">
              <h1>Dashboard</h1>
              <p>De La Salle Lipa Air Quality Monitoring</p>
            </div>
            <div className="header-actions">
              <button>
                <Bell size={20} />
              </button>
              <button className="logout-btn">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="dashboard-main">
          <div className="metrics-grid">
            {/* Air Quality Cards */}
            <div className="metric-card good">
              <div className="metric-header">
                <div className="metric-icon">
                  <div className="icon-circle good">
                    <div className="icon-dot good"></div>
                  </div>
                  <span className="metric-label">PM2.5</span>
                </div>
              </div>
              <div className="metric-value">17</div>
              <div className="metric-status good">● Good</div>
            </div>

            <div className="metric-card moderate">
              <div className="metric-header">
                <div className="metric-icon">
                  <div className="icon-circle moderate">
                    <div className="icon-dot moderate"></div>
                  </div>
                  <span className="metric-label">PM10</span>
                </div>
              </div>
              <div className="metric-value">38</div>
              <div className="metric-status moderate">● Moderate</div>
            </div>

            <div className="metric-card unhealthy">
              <div className="metric-header">
                <div className="metric-icon">
                  <div className="icon-circle unhealthy">
                    <div className="icon-dot unhealthy"></div>
                  </div>
                  <span className="metric-label">CO₂</span>
                </div>
              </div>
              <div className="metric-value">1048</div>
              <div className="metric-status unhealthy">● Unhealthy</div>
            </div>
          </div>

          <div className="content-grid">
            {/* Campus Sensor Map */}
            <div className="campus-map">
              <div className="section-header">
                <MapPin size={20} />
                <h3 className="section-title">Campus Sensor Map</h3>
              </div>
              <div className="map-container">
                <div className="map-content">
                  <svg viewBox="0 0 400 300" width="100%" height="100%">
                    {/* Campus Buildings - Simplified Isometric View */}
                    {/* Main Building */}
                    <g transform="translate(150,100)">
                      <polygon
                        points="0,0 50,0 70,20 20,20"
                        fill="#e5e7eb"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <polygon
                        points="0,0 0,40 20,60 20,20"
                        fill="#d1d5db"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <polygon
                        points="50,0 50,40 70,60 70,20"
                        fill="#f3f4f6"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <polygon
                        points="0,40 50,40 70,60 20,60"
                        fill="#9ca3af"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                    </g>

                    {/* Library Building */}
                    <g transform="translate(80,120)">
                      <polygon
                        points="0,0 40,0 55,15 15,15"
                        fill="#e5e7eb"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <polygon
                        points="0,0 0,30 15,45 15,15"
                        fill="#d1d5db"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <polygon
                        points="40,0 40,30 55,45 55,15"
                        fill="#f3f4f6"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <polygon
                        points="0,30 40,30 55,45 15,45"
                        fill="#9ca3af"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                    </g>

                    {/* Gym Building */}
                    <g transform="translate(250,140)">
                      <polygon
                        points="0,0 45,0 60,15 15,15"
                        fill="#e5e7eb"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <polygon
                        points="0,0 0,25 15,40 15,15"
                        fill="#d1d5db"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <polygon
                        points="45,0 45,25 60,40 60,15"
                        fill="#f3f4f6"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <polygon
                        points="0,25 45,25 60,40 15,40"
                        fill="#9ca3af"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                    </g>

                    {/* Sensor Indicators */}
                    <circle
                      cx="175"
                      cy="110"
                      r="4"
                      fill="#ef4444"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <circle
                      cx="105"
                      cy="135"
                      r="4"
                      fill="#22c55e"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <circle
                      cx="275"
                      cy="155"
                      r="4"
                      fill="#eab308"
                      stroke="#fff"
                      strokeWidth="2"
                    />

                    {/* Paths */}
                    <path
                      d="M100,200 Q200,180 300,200"
                      stroke="#9ca3af"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                    />
                    <path
                      d="M120,160 Q180,140 240,160"
                      stroke="#9ca3af"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                    />
                  </svg>
                </div>

                {/* Legend */}
                <div className="map-legend">
                  <div className="legend-items">
                    <div className="legend-item">
                      <div className="legend-dot good"></div>
                      <span>Good</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot moderate"></div>
                      <span>Moderate</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot unhealthy"></div>
                      <span>Unhealthy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="notifications-panel">
              <div className="notifications-header">
                <div className="section-header">
                  <AlertTriangle size={20} />
                  <h3 className="section-title">Notifications</h3>
                </div>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="notifications-list">
                {notifications.map((notification, index) => (
                  <div key={index} className="notification-item">
                    <div
                      className={`notification-icon ${notification.className}`}
                    >
                      <notification.icon size={12} />
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{notification.title}</p>
                      <p className="notification-location">
                        {notification.location}
                      </p>
                      <p className="notification-time">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* PM2.5 Chart Placeholder */}
            <div className="chart-card">
              <div className="section-header">
                <BarChart3 size={20} />
                <h3 className="section-title">PM2.5 - Last 7 Days</h3>
              </div>
              <div className="chart-placeholder">
                <p>Chart will be displayed here once data is connected</p>
              </div>
            </div>

            {/* CO2 Chart Placeholder */}
            <div className="chart-card">
              <div className="section-header">
                <BarChart3 size={20} />
                <h3 className="section-title">CO₂ - Last 7 Days</h3>
              </div>
              <div className="chart-placeholder">
                <p>Chart will be displayed here once data is connected</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>
              © 2024 BerdeAir • De La Salle Lipa | Air Quality Monitoring System
            </p>
            <div className="footer-user">
              <span>Juan Dela Cruz - 2021421</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
