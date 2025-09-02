import React, { useState } from "react";
import "../css/Alerts.css";

const Alerts = () => {
  const [filters, setFilters] = useState({
    date: "",
    severity: "All",
    pollutant: "All",
  });
  const [realTimeNotifications, setRealTimeNotifications] = useState(true);

  // Sample alerts data
  const [alerts] = useState([
    {
      id: 1,
      type: "CO₂",
      location: "Main Gate",
      date: "2024-05-22",
      time: "19:44",
      severity: "UNHEALTHY",
      message: "Unhealthy - CO₂ reached 1048 ppm. Immediate action required.",
      icon: "🏭",
      color: "red",
    },
    {
      id: 2,
      type: "PM10",
      location: "Sports Complex",
      date: "2024-05-22",
      time: "19:20",
      severity: "MODERATE",
      message: "Moderate - PM10 at 38 μg/m³. Caution advised.",
      icon: "💨",
      color: "yellow",
    },
    {
      id: 3,
      type: "PM2.5",
      location: "Side Gate",
      date: "2024-05-22",
      time: "12:58",
      severity: "GOOD",
      message: "Good - PM2.5 at 17 μg/m³. Air quality is healthy.",
      icon: "🌱",
      color: "green",
    },
    {
      id: 4,
      type: "CO₂",
      location: "CBEAM Gate Entrance",
      date: "2024-05-21",
      time: "17:35",
      severity: "UNHEALTHY",
      message: "Unhealthy - CO₂ peaked at 1150 ppm. Please ventilate area.",
      icon: "🏭",
      color: "red",
    },
    {
      id: 5,
      type: "PM10",
      location: "CBEAM Gate Entrance",
      date: "2024-05-21",
      time: "15:55",
      severity: "MODERATE",
      message: "Moderate - PM10 at 27 μg/m³. Caution advised.",
      icon: "💨",
      color: "yellow",
    },
  ]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filters.severity !== "All" && alert.severity !== filters.severity) {
      return false;
    }
    if (filters.pollutant !== "All" && alert.type !== filters.pollutant) {
      return false;
    }
    if (filters.date && alert.date !== filters.date) {
      return false;
    }
    return true;
  });

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "UNHEALTHY":
        return "severity-badge unhealthy";
      case "MODERATE":
        return "severity-badge moderate";
      case "GOOD":
        return "severity-badge good";
      default:
        return "severity-badge";
    }
  };

  const getAlertCardClass = (color) => {
    return `alert-card alert-${color}`;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Alerts</h1>
          <p>Real-Time Air Quality Alerts - De La Salle Lipa</p>
        </div>
        <div className="header-right">
          <button className="notification-btn">🔔</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="alerts-filters">
        <div className="filter-group">
          <label htmlFor="date-filter">Date</label>
          <input
            id="date-filter"
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className="filter-input"
            placeholder="mm/dd/yyyy"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="severity-filter">Severity</label>
          <select
            id="severity-filter"
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
            className="filter-select"
          >
            <option value="All">All</option>
            <option value="GOOD">Good</option>
            <option value="MODERATE">Moderate</option>
            <option value="UNHEALTHY">Unhealthy</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="pollutant-filter">Pollutant</label>
          <select
            id="pollutant-filter"
            value={filters.pollutant}
            onChange={(e) => handleFilterChange("pollutant", e.target.value)}
            className="filter-select"
          >
            <option value="All">All</option>
            <option value="PM2.5">PM2.5</option>
            <option value="PM10">PM10</option>
            <option value="CO₂">CO₂</option>
          </select>
        </div>

        <div className="notification-toggle">
          <label htmlFor="real-time-toggle">Real-Time Notifications</label>
          <div className="toggle-switch">
            <input
              id="real-time-toggle"
              type="checkbox"
              checked={realTimeNotifications}
              onChange={(e) => setRealTimeNotifications(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </div>
        </div>
      </div>

      {/* Triggered Alerts Section */}
      <div className="alerts-section">
        <h2 className="section-title">
          <span className="warning-icon">⚠️</span>
          Triggered Alerts
        </h2>

        <div className="alerts-list">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={getAlertCardClass(alert.color)}>
              <div className="alert-icon">{alert.icon}</div>

              <div className="alert-content">
                <div className="alert-header">
                  <div className="alert-type-location">
                    <span className="alert-type">{alert.type}</span>
                    <span className="alert-location">{alert.location}</span>
                  </div>
                  <div className="alert-datetime">
                    <span className="alert-date">{alert.date}</span>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                </div>

                <p className="alert-message">{alert.message}</p>
              </div>

              <div className="alert-severity">
                <span className={getSeverityBadgeClass(alert.severity)}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="no-alerts">
            <p>No alerts found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
