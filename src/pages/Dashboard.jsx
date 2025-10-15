import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../Database";
import "../css/Alerts.css"; // keep your existing styles if dashboard CSS is here

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    pm25: null,
    pm10: null,
    co2: null,
    timestamp: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hasLoadedRef = useRef(false);

  const fetchLatest = useCallback(async () => {
    try {
      if (hasLoadedRef.current) {
        setRefreshing(true); // subtle “Updating…” without flicker
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("air_quality_readings")
        .select("timestamp, pm2_5, pm10, co")
        .order("timestamp", { ascending: false })
        .limit(1);

      if (error) throw error;

      const row = data && data[0] ? data[0] : null;

      setMetrics({
        pm25: row?.pm2_5 ?? null,
        pm10: row?.pm10 ?? null,
        co2: row?.co ?? null, // assuming 'co' is CO₂ in ppm
        timestamp: row?.timestamp ?? null,
      });

      hasLoadedRef.current = true;
    } catch (e) {
      console.error("Failed to fetch latest metrics:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest(); // initial load
    const id = setInterval(fetchLatest, 10000); // auto-refresh every 10s
    return () => clearInterval(id);
  }, [fetchLatest]);

  const fmt = (v, { decimals = 0 } = {}) =>
    v === null || v === undefined ? "—" : Number(v).toFixed(decimals);

  const lastUpdated =
    metrics.timestamp ? new Date(metrics.timestamp).toLocaleString() : "—";

  if (loading) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p>De La Salle-Lipa Air Quality Monitoring</p>
          </div>
          <div className="header-right">
            <span className="updating-text">Loading…</span>
          </div>
        </div>
      </div>
    );
  }

import React, { useState } from "react";
import "../css/popup.css";

const Dashboard = ({ onLogout }) => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = () => {
    setShowLogoutPopup(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutPopup(false);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p>De La Salle-Lipa Air Quality Monitoring</p>
        </div>
        <div className="header-right">
          {refreshing && <span className="updating-text">Updating…</span>}
          <button className="notification-btn" title="Notifications">🔔</button>
          <button className="logout-btn">Logout</button>
          <button className="notification-btn">🔔</button>
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={confirmLogout}>
                Yes, Logout
              </button>
              <button className="cancel-btn" onClick={cancelLogout}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {/* Metric cards (now live) */}
        <div className="metrics-cards">
          <div className="metric-card pm25">
            <div className="metric-icon">🌱</div>
            <div className="metric-value">{fmt(metrics.pm25, { decimals: 1 })}</div>
            <div className="metric-label">
              <span>µg/m³</span>
              <span>PM2.5</span>
            </div>
          </div>

          <div className="metric-card pm10">
            <div className="metric-icon">💨</div>
            <div className="metric-value">{fmt(metrics.pm10, { decimals: 1 })}</div>
            <div className="metric-label">
              <span>µg/m³</span>
              <span>PM10</span>
            </div>
          </div>

          <div className="metric-card co2">
            <div className="metric-icon">☁️</div>
            <div className="metric-value">{fmt(metrics.co2, { decimals: 0 })}</div>
            <div className="metric-label">
              <span>ppm</span>
              <span>CO₂</span>
            </div>
          </div>
        </div>

        <div style={{ margin: "8px 0 24px", color: "#6b7280", fontSize: 12 }}>
          Last updated: {lastUpdated}
        </div>

        {/* Keep your existing placeholders/layout */}
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
