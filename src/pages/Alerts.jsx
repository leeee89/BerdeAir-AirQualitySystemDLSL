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

  // Determine severity per pollutant
  const classifySeverity = (type, value) => {
    if (type === "PM2.5") {
      if (value > 150.4) return "UNHEALTHY";
      if (value > 35.4) return "MODERATE";
      return "GOOD";
    } else if (type === "PM10") {
      if (value > 354) return "UNHEALTHY";
      if (value > 154) return "MODERATE";
      return "GOOD";
    } else if (type === "NO2") {
      if (value > 650) return "UNHEALTHY";
      if (value > 100) return "MODERATE";
      return "GOOD";
    } else if (type === "CO") {
      if (value > 15) return "UNHEALTHY";
      if (value > 9) return "MODERATE";
      return "GOOD";
    }
    return "GOOD";
  };

  const getColorBySeverity = (severity) => {
    switch (severity) {
      case "UNHEALTHY":
        return "red";
      case "MODERATE":
        return "yellow";
      case "GOOD":
      default:
        return "green";
    }
  };

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      setLoading(alerts.length === 0);
      setRefreshing(alerts.length > 0);

      const { data, error } = await supabase
        .from("air_quality_readings")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;

      const processed = data.flatMap((row) => {
        const pollutants = [
          { type: "PM2.5", value: row.pm25_raw },
          { type: "PM10", value: row.pm10_raw },
          { type: "CO", value: row.co_raw },
          { type: "NO2", value: row.no2_raw },
        ];

        // Only MODERATE or UNHEALTHY pollutants
        const relevant = pollutants.filter(
          (p) => classifySeverity(p.type, p.value) !== "GOOD"
        );

        if (relevant.length === 0) {
          return [
            {
              id: row.reading_id + "-GOOD",
              type: "All Good",
              value: null,
              location: row.device_id || "Unknown",
              date: new Date(row.timestamp).toLocaleDateString(),
              time: new Date(row.timestamp).toLocaleTimeString(),
              severity: "GOOD",
              message: "All pollutants are within safe levels.",
              icon: "🌱",
              color: "green",
            },
          ];
        }

        return relevant.map((p) => {
          const severity = classifySeverity(p.type, p.value);
          const color = getColorBySeverity(severity);
          return {
            id: row.reading_id + "-" + p.type,
            type: p.type,
            value: p.value,
            location: row.device_id || "Unknown",
            date: new Date(row.timestamp).toLocaleDateString(),
            time: new Date(row.timestamp).toLocaleTimeString(),
            severity,
            message: `${severity} - ${p.type} reached ${p.value.toFixed(1)}.`,
            icon:
              p.type === "CO"
                ? "🏭"
                : p.type === "PM10"
                ? "💨"
                : p.type === "PM2.5"
                ? "🌫️"
                : "🌱",
            color,
          };
        });
      });

      setAlerts(processed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Send a report
 const handleReport = async (alert) => {
  try {
    // Extract numeric reading_id only
    const numericReadingId = parseInt(alert.id.split("-")[0], 10);

    const { error } = await supabase.from("reports").insert([
      {
        reading_id: numericReadingId,   // numeric only
        device_id: alert.location,
        pollutant: alert.type,
        value: alert.value,
        severity: alert.severity,
        report_time: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    alertUser(`✅ Report for ${alert.type} sent successfully.`);
  } catch (err) {
    console.error("Error sending report:", err);
    alertUser(`❌ Failed to send report: ${err.message}`);
  }
};


  const alertUser = (msg) => window.alert(msg);

  // Auto-refresh
  const startAutoRefresh = () => {
    clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = setInterval(fetchData, 30000);
  };

  useEffect(() => {
    fetchData();
    startAutoRefresh();
    return () => clearInterval(refreshIntervalRef.current);
  }, []);

  const handleManualRefresh = () => {
    fetchData();
    startAutoRefresh();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
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
            <option value="NO2">NO₂</option>
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

      {/* Alerts */}
      <div className="alerts-section">
        <h2 className="section-title">
          <span className="warning-icon">⚠️</span> Triggered Alerts
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
                <button
                  className="report-btn"
                  onClick={() => handleReport(alert)}
                  title="Send this alert to reports"
                >
                  📤 Report
                </button>
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
