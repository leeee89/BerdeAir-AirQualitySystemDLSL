import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "../Database";
import "../css/Dashboard.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Brush,
} from "recharts";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    pm25: null,
    pm10: null,
    co: null,
    no2: null,
    timestamp: null,
  });
  const [recent, setRecent] = useState([]); // last 3 readings for Notifications
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendRows, setTrendRows] = useState([]); // last 7 days raw rows
  const [devices, setDevices] = useState([]);     // distinct device_ids seen

  const hasLoadedRef = useRef(false);

  const fetchLatest = useCallback(async () => {
    try {
      if (hasLoadedRef.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("air_quality_readings")
        .select("timestamp, pm25_raw, pm10_raw, co_raw, no2_raw")
        .order("timestamp", { ascending: false })
        .limit(3);

      if (error) throw error;

      const latest = data && data[0] ? data[0] : null;

      setMetrics({
        pm25: latest?.pm25_raw ?? null,
        pm10: latest?.pm10_raw ?? null,
        co: latest?.co_raw ?? null,
        no2: latest?.no2_raw ?? null,
        timestamp: latest?.timestamp ?? null,
      });

      setRecent(data ?? []);

      hasLoadedRef.current = true;
    } catch (e) {
      console.error("Failed to fetch latest metrics:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchTrends = useCallback(async () => {
    try {
      const sinceISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("air_quality_readings")
        .select("timestamp, device_id, pm25_raw, pm10_raw, co_raw, no2_raw")
        .gte("timestamp", sinceISO)
        .order("timestamp", { ascending: true });

      if (error) throw error;

      setTrendRows(data || []);
      const ids = Array.from(
        new Set((data || []).map((r) => r.device_id).filter(Boolean))
      ).sort();
      setDevices(ids);
    } catch (e) {
      console.error("Failed to fetch trend rows:", e.message);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
    fetchTrends();

    const id = setInterval(() => {
      fetchLatest();
      fetchTrends();
    }, 10000);
    return () => clearInterval(id);
  }, [fetchLatest, fetchTrends]);

  const fmt = (v, { decimals = 0 } = {}) =>
    v === null || v === undefined ? "—" : Number(v).toFixed(decimals);

  const lastUpdated =
    metrics.timestamp ? new Date(metrics.timestamp).toLocaleString() : "—";

  const classify = (row) => {
    const flags = [];

    if (row.pm25_raw >= 55.5)
      flags.push({ key: "PM2.5", level: "danger", value: `${fmt(row.pm25_raw, { decimals: 1 })} µg/m³` });
    else if (row.pm25_raw >= 35.5)
      flags.push({ key: "PM2.5", level: "warning", value: `${fmt(row.pm25_raw, { decimals: 1 })} µg/m³` });
    else flags.push({ key: "PM2.5", level: "good", value: `${fmt(row.pm25_raw, { decimals: 1 })} µg/m³` });

    if (row.pm10_raw >= 155)
      flags.push({ key: "PM10", level: "danger", value: `${fmt(row.pm10_raw, { decimals: 1 })} µg/m³` });
    else if (row.pm10_raw >= 55)
      flags.push({ key: "PM10", level: "warning", value: `${fmt(row.pm10_raw, { decimals: 1 })} µg/m³` });
    else flags.push({ key: "PM10", level: "good", value: `${fmt(row.pm10_raw, { decimals: 1 })} µg/m³` });

    if (row.co_raw >= 1000)
      flags.push({ key: "CO", level: "danger", value: `${fmt(row.co_raw, { decimals: 0 })} ppm` });
    else if (row.co_raw >= 700)
      flags.push({ key: "CO", level: "warning", value: `${fmt(row.co_raw, { decimals: 0 })} ppm` });
    else flags.push({ key: "CO", level: "good", value: `${fmt(row.co_raw, { decimals: 0 })} ppm` });

    if (row.no2_raw >= 200)
      flags.push({ key: "NO₂", level: "danger", value: `${fmt(row.no2_raw, { decimals: 0 })} ppb` });
    else if (row.no2_raw >= 100)
      flags.push({ key: "NO₂", level: "warning", value: `${fmt(row.no2_raw, { decimals: 0 })} ppb` });
    else flags.push({ key: "NO₂", level: "good", value: `${fmt(row.no2_raw, { decimals: 0 })} ppb` });

    const order = { danger: 3, warning: 2, good: 1 };
    const worst = flags.sort((a, b) => order[b.level] - order[a.level])[0];

    return worst;
  };

  // ---- helpers for charting (must be declared before useMemo) ----
  const bucket5mKey = (iso) => {
    const d = new Date(iso);
    const m = d.getMinutes();
    d.setSeconds(0, 0);
    d.setMinutes(m - (m % 5));
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return { key: `${yy}-${mm}-${dd} ${hh}:${mi}`, label: `${mm}/${dd} ${hh}:${mi}` };
  };

  const palette = [
    "#4F46E5", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4",
    "#A855F7", "#10B981", "#E11D48", "#84CC16", "#0EA5E9",
  ];
  const colorFor = (i) => palette[i % palette.length];

  const buildPollutantSeries = (rows, devs, pollutantKey) => {
    const meta = {
      pm25_raw: { name: "PM2.5", unit: "µg/m³" },
      pm10_raw: { name: "PM10", unit: "µg/m³" },
      co_raw: { name: "CO", unit: "ppm" },
      no2_raw: { name: "NO₂", unit: "ppb" },
    }[pollutantKey];

    const bucket = new Map();
    for (const r of rows) {
      if (!r?.timestamp || !r?.device_id) continue;
      const v = Number(r[pollutantKey]);
      if (Number.isNaN(v)) continue;

      const { key, label } = bucket5mKey(r.timestamp);
      if (!bucket.has(key)) bucket.set(key, { time: label });
      const b = bucket.get(key);
      b[r.device_id] = v;
    }

    const data = Array.from(bucket.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([, v]) => v);

    return { data, yUnit: meta.unit, name: meta.name };
  };

  // ---- useMemo hooks MUST be before any early return ----
  const pm25Series = useMemo(
    () => buildPollutantSeries(trendRows, devices, "pm25_raw"),
    [trendRows, devices]
  );
  const pm10Series = useMemo(
    () => buildPollutantSeries(trendRows, devices, "pm10_raw"),
    [trendRows, devices]
  );
  const coSeries = useMemo(
    () => buildPollutantSeries(trendRows, devices, "co_raw"),
    [trendRows, devices]
  );
  const no2Series = useMemo(
    () => buildPollutantSeries(trendRows, devices, "no2_raw"),
    [trendRows, devices]
  );

  // ---- child component (not a hook, safe anywhere) ----
  const PollutantTrend = ({ title, series, devices }) => {
    return (
      <div className="chart-section">
        <h3>{title}</h3>
        <div className="chart-placeholder" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: series.yUnit, angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Brush dataKey="time" height={20} travellerWidth={8} />
              {devices.map((dev, idx) => (
                <Line
                  key={dev}
                  type="monotone"
                  dataKey={dev}
                  name={dev}
                  stroke={colorFor(idx)}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // ---- early return AFTER all hooks ----
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
        {/* Metric cards */}
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
          <div className="notifications-section">
            <h3>⚠️ Notifications</h3>
            <div className="notifications-content">
              {recent.map((row, idx) => {
                const t = new Date(row.timestamp);
                const worst = classify(row);
                const dotClass =
                  worst.level === "danger" ? "red" : worst.level === "warning" ? "yellow" : "green";
                const itemClass =
                  worst.level === "danger" ? "danger" : worst.level === "warning" ? "warning" : "good";

                return (
                  <div key={idx} className={`notification-item ${itemClass}`}>
                    <span className={`notification-dot ${dotClass}`}></span>
                    <div>
                      <strong>
                        {worst.key}{" "}
                        {worst.level === "good"
                          ? "Good"
                          : worst.level === "warning"
                          ? "Elevated"
                          : "Unhealthy"}
                      </strong>
                      <p>
                        {worst.value} •{" "}
                        {t.toLocaleDateString()}{" "}
                        {t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <PollutantTrend title="📊 PM2.5 – Last 7 Days" series={pm25Series} devices={devices} />
          <PollutantTrend title="📊 PM10 – Last 7 Days"  series={pm10Series} devices={devices} />
          <PollutantTrend title="📊 CO – Last 7 Days"    series={coSeries}   devices={devices} />
          <PollutantTrend title="📊 NO₂ – Last 7 Days"   series={no2Series}  devices={devices} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
