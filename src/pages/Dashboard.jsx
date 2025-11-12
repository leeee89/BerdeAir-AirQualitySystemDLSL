import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../Database";
import "../css/Dashboard.css"; // keep your existing styles if dashboard CSS is here

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    pm25: null,
    pm10: null,
    co: null,
    no2: null,
    timestamp: null,
  });
  const [recent, setRecent] = useState([]); // 👈 last 3 readings for Notifications
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hasLoadedRef = useRef(false);

  const fetchLatest = useCallback(async () => {
    try {
      if (hasLoadedRef.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get the latest 3 readings (most recent first)
      const { data, error } = await supabase
        .from("air_quality_readings")
        .select("timestamp, pm25_raw, pm10_raw, co_raw, no2_raw")
        .order("timestamp", { ascending: false })
        .limit(3);

      if (error) throw error;

      const latest = data && data[0] ? data[0] : null;

      // Update metric cards with the newest row
      setMetrics({
        pm25: latest?.pm25_raw ?? null,
        pm10: latest?.pm10_raw ?? null,
        co: latest?.co_raw ?? null,
        no2: latest?.no2_raw ?? null,
        timestamp: latest?.timestamp ?? null,
      });

      // Update notifications with the top 3 rows
      setRecent(data ?? []);

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

  // Simple rule-of-thumb severities (tweak to your thresholds)
  const classify = (row) => {
    // prioritize the pollutant with “worst” state for the label
    const flags = [];

    // PM2.5 µg/m³
    if (row.pm25_raw >= 55.5) flags.push({ key: "PM2.5", level: "danger", value: `${fmt(row.pm25_raw, {decimals:1})} µg/m³` });
    else if (row.pm25_raw >= 35.5) flags.push({ key: "PM2.5", level: "warning", value: `${fmt(row.pm25_raw, {decimals:1})} µg/m³` });
    else flags.push({ key: "PM2.5", level: "good", value: `${fmt(row.pm25_raw, {decimals:1})} µg/m³` });

    // PM10 µg/m³
    if (row.pm10_raw >= 155) flags.push({ key: "PM10", level: "danger", value: `${fmt(row.pm10_raw, {decimals:1})} µg/m³` });
    else if (row.pm10_raw >= 55) flags.push({ key: "PM10", level: "warning", value: `${fmt(row.pm10_raw, {decimals:1})} µg/m³` });
    else flags.push({ key: "PM10", level: "good", value: `${fmt(row.pm10_raw, {decimals:1})} µg/m³` });

    // CO ppm (rough illustrative cut-offs)
    if (row.co_raw >= 1000) flags.push({ key: "CO", level: "danger", value: `${fmt(row.co_raw, {decimals:0})} ppm` });
    else if (row.co_raw >= 700) flags.push({ key: "CO", level: "warning", value: `${fmt(row.co_raw, {decimals:0})} ppm` });
    else flags.push({ key: "CO", level: "good", value: `${fmt(row.co_raw, {decimals:0})} ppm` });

    // NO2 ppb (illustrative cut-offs)
    if (row.no2_raw >= 200) flags.push({ key: "NO₂", level: "danger", value: `${fmt(row.no2_raw, {decimals:0})} ppb` });
    else if (row.no2_raw >= 100) flags.push({ key: "NO₂", level: "warning", value: `${fmt(row.no2_raw, {decimals:0})} ppb` });
    else flags.push({ key: "NO₂", level: "good", value: `${fmt(row.no2_raw, {decimals:0})} ppb` });

    // choose worst: danger > warning > good
    const order = { danger: 3, warning: 2, good: 1 };
    const worst = flags.sort((a, b) => order[b.level] - order[a.level])[0];

    return worst; // { key, level, value }
  };

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
        </div>
      </div>

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
            <div className="metric-value">{fmt(metrics.co, { decimals: 0 })}</div>
            <div className="metric-label">
              <span>ppm</span>
              <span>CO</span>
            </div>
          </div>

          <div className="metric-card no2">
            <div className="metric-icon">☁️</div>
            <div className="metric-value">{fmt(metrics.no2, { decimals: 0 })}</div>
            <div className="metric-label">
              <span>ppb</span>
              <span>NO2</span>
            </div>
          </div>
        </div>

        <div style={{ margin: "8px 0 24px", color: "#6b7280", fontSize: 12 }}>
          Last updated: {lastUpdated}
        </div>

        <div className="dashboard-grid-1">

          {/* 🔴 Notifications now live from the last 3 readings */}
          <div className="notifications-section">
            <h3>⚠️ Notifications</h3>
            <div className="notifications-content">
              {recent.map((row, idx) => {
                const t = new Date(row.timestamp);
                const worst = classify(row); // { key, level, value }
                const dotClass =
                  worst.level === "danger" ? "red" : worst.level === "warning" ? "yellow" : "green";
                const itemClass =
                  worst.level === "danger" ? "danger" : worst.level === "warning" ? "warning" : "good";

                return (
                  <div key={idx} className={`notification-item ${itemClass}`}>
                    <span className={`notification-dot ${dotClass}`}></span>
                    <div>
                      <strong>{worst.key} {worst.level === "good" ? "Good" : worst.level === "warning" ? "Elevated" : "Unhealthy"}</strong>
                      <p>
                        {worst.value} • {t.toLocaleDateString()} {t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
</div>

        <div className="dashboard-grid">

          <div className="chart-section">
            <h3>📊 PM2.5 - Last 7 Days</h3>
            <div className="chart-placeholder">
              <p>PM2.5 trend chart will be rendered here</p>
            </div>
          </div>

          <div className="chart-section">
            <h3>📊 PM10 - Last 7 Days</h3>
            <div className="chart-placeholder">
              <p>PM10 trend chart will be rendered here</p>
            </div>
          </div>

          <div className="chart-section">
            <h3>📊 CO - Last 7 Days</h3>
            <div className="chart-placeholder">
              <p>CO trend chart will be rendered here</p>
            </div>
          </div>

          <div className="chart-section">
            <h3>📊 NO2 - Last 7 Days</h3>
            <div className="chart-placeholder">
              <p>NO2 trend chart will be rendered here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
