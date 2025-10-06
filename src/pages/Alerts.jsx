import React, { useState, useEffect, useRef } from "react";
import "../css/Alerts.css";
import { supabase } from "../Database";

const Alerts = () => {
  const [filters, setFilters] = useState({
    date: "",
    severity: "All",
    pollutant: "All",
  });
  const [realTimeNotifications, setRealTimeNotifications] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const refreshIntervalRef = useRef(null);

  // 🧭 Fetch data from Supabase
  const fetchData = async () => {
    try {
      if (alerts.length > 0) {
        setRefreshing(true); // show “refreshing…” but don’t blank out the page
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("air_quality_readings")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;

      // 🧮 Derive severity and pollutant info
      const processed = data.map((row) => {
        const pollutants = [
          { type: "PM2.5", value: row.pm2_5 },
          { type: "PM10", value: row.pm10 },
          { type: "CO", value: row.co },
          { type: "SO₂", value: row.so2 },
          { type: "NOx", value: row.nox },
        ];

        const dominant = pollutants.reduce((prev, curr) =>
          curr.value > (prev?.value || 0) ? curr : prev
        );

        let severity = "GOOD";
        let color = "green";

        if (dominant.value > 200) {
          severity = "UNHEALTHY";
          color = "red";
        } else if (dominant.value > 50) {
          severity = "MODERATE";
          color = "yellow";
        }

        return {
          id: row.reading_id,
          type: dominant.type,
          value: dominant.value,
          location: row.device_id || "Unknown",
          date: new Date(row.timestamp).toLocaleDateString(),
          time: new Date(row.timestamp).toLocaleTimeString(),
          severity,
          message: `${severity} - ${dominant.type} reached ${dominant.value ?? 0}.`,
          icon:
            dominant.type === "CO"
              ? "🏭"
              : dominant.type === "PM10"
              ? "💨"
              : "🌱",
          color,
        };
      });

      setAlerts(processed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🕒 Auto-refresh setup
  const startAutoRefresh = () => {
    clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds
  };

  useEffect(() => {
    fetchData();
    startAutoRefresh();
    return () => clearInterval(refreshIntervalRef.current);
  }, []);

  // 🧩 Manual refresh (resets timer)
  const handleManualRefresh = () => {
    fetchData();
    startAutoRefresh();
  };

  // 🧩 Filters
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filters.severity !== "All" && alert.severity !== filters.severity)
      return false;
    if (filters.pollutant !== "All" && alert.type !== filters.pollutant)
      return false;
    if (filters.date && alert.date !== filters.date) return false;
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

  const getAlertCardClass = (color) => `alert-card alert-${color}`;

  if (loading) return <p>Loading alerts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Alerts</h1>
          <p>Real-Time Air Quality Alerts - De La Salle Lipa</p>
        </div>
        <div className="header-right">
          <button
            className={`refresh-btn ${refreshing ? "refreshing" : ""}`}
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            {refreshing ? "⟳ Refreshing..." : "⟳ Refresh"}
          </button>
          <button className="notification-btn">🔔</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Filters */}
      <div className="alerts-filters">
        <div className="filter-group">
          <label htmlFor="date-filter">Date</label>
          <input
            id="date-filter"
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className="filter-input"
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
            <option value="CO">CO</option>
            <option value="SO₂">SO₂</option>
            <option value="NOx">NOx</option>
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

      {/* Alerts Section */}
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
