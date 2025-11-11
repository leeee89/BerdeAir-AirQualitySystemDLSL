import React, { useEffect, useMemo, useState } from "react";
import "../css/HistoricalData.css";
import { supabase } from "../Database";
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

const toStartOfDayISO = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt.toISOString();
};

const toEndOfDayISO = (d) => {
  const dt = new Date(d);
  dt.setHours(23, 59, 59, 999);
  return dt.toISOString();
};

const sameDay = (a, b) => {
  const A = new Date(a);
  const B = new Date(b);
  return (
    A.getFullYear() === B.getFullYear() &&
    A.getMonth() === B.getMonth() &&
    A.getDate() === B.getDate()
  );
};

// Round timestamp to the minute for cross-device aggregation
const minuteKey = (isoOrDate) => {
  const d = new Date(isoOrDate);
  d.setSeconds(0, 0);
  // Keep local time semantics for readability on the chart
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  // Use a sortable key that includes full date for multi-day
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return { key: `${y}-${m}-${day} ${hh}:${mm}`, label: `${hh}:${mm}`, dateKey: `${y}-${m}-${day}` };
};

const dateKeyOf = (iso) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const HistoricalData = () => {
  // Filters
  const [filters, setFilters] = useState({
    startDate: "2024-05-16",
    endDate: "2024-05-16",
    location: "All Locations",
  });
  const [aggregateAll, setAggregateAll] = useState(true); // only relevant if All Locations

  // Data & UI state
  const [rawRows, setRawRows] = useState([]);
  const [locations, setLocations] = useState(["All Locations"]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch distinct device_ids for location dropdown (once)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from("air_quality_readings")
          .select("device_id")
          .not("device_id", "is", null);

        if (error) throw error;
        const unique = Array.from(new Set((data || []).map((r) => r.device_id))).sort();
        setLocations(["All Locations", ...unique]);
      } catch (e) {
        console.error("Failed to load locations:", e.message);
      }
    };
    fetchLocations();
  }, []);

  // Fetch rows whenever filters change
  useEffect(() => {
    const fetchBetween = async () => {
      try {
        setError(null);
        if (rawRows.length) setRefreshing(true);
        else setLoading(true);

        const startISO = toStartOfDayISO(filters.startDate);
        const endISO = toEndOfDayISO(filters.endDate);

        let query = supabase
          .from("air_quality_readings")
          .select("*")
          .gte("timestamp", startISO)
          .lte("timestamp", endISO)
          .order("timestamp", { ascending: true });

        if (filters.location !== "All Locations") {
          query = query.eq("device_id", filters.location);
        }

        const { data, error } = await query;
        if (error) throw error;
        setRawRows(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchBetween();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.location]);

  // Compute summary stats + chart data
  const { summaryStats, chartData, xKeyLabel } = useMemo(() => {
    const rows = rawRows || [];

    const avg = (arr) =>
      arr.length ? arr.reduce((s, v) => s + (Number(v) || 0), 0) / arr.length : 0;
    const max = (arr) =>
      arr.length ? Math.max(...arr.map((v) => Number(v) || 0)) : 0;

    // ---- Summary cards (based on the filtered rows as-is)
    const allPM25 = rows.map((r) => Number(r.pm25_raw) || 0);
    const allPM10 = rows.map((r) => Number(r.pm10_raw) || 0);
    const allCO = rows.map((r) => Number(r.co_raw) || 0);
    const allNO2 = rows.map((r) => Number(r.no2_raw) || 0);

    const summary = [
      { type: "PM2.5", icon: "🌫️", avg: Number(avg(allPM25).toFixed(1)), peak: Number(max(allPM25).toFixed(1)), unit: "raw", color: "green" },
      { type: "PM10",  icon: "💨", avg: Number(avg(allPM10).toFixed(1)), peak: Number(max(allPM10).toFixed(1)), unit: "raw", color: "yellow" },
      { type: "CO",    icon: "☁️", avg: Number(avg(allCO).toFixed(1)),   peak: Number(max(allCO).toFixed(1)),   unit: "raw", color: "blue" },
      { type: "NO₂",   icon: "🧪", avg: Number(avg(allNO2).toFixed(1)),  peak: Number(max(allNO2).toFixed(1)),  unit: "raw", color: "purple" },
    ];

    // ---- Chart data
    const singleDay = sameDay(filters.startDate, filters.endDate);

    // If single day: per-reading timeline (or aggregated per minute across devices if All Locations + aggregateAll)
    if (singleDay) {
      let points = [];

      if (filters.location === "All Locations" && aggregateAll) {
        // Group readings of the same minute across all devices
        const bucket = new Map(); // key => { pm25[], pm10[], co[], no2[], label }
        rows.forEach((r) => {
          if (!r?.timestamp) return;
          const mk = minuteKey(r.timestamp);
          if (!bucket.has(mk.key)) {
            bucket.set(mk.key, { pm25: [], pm10: [], co: [], no2: [], label: mk.label });
          }
          const b = bucket.get(mk.key);
          b.pm25.push(Number(r.pm25_raw) || 0);
          b.pm10.push(Number(r.pm10_raw) || 0);
          b.co.push(Number(r.co_raw) || 0);
          b.no2.push(Number(r.no2_raw) || 0);
        });

        points = Array.from(bucket.entries())
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([key, b]) => ({
            // x-axis label: HH:mm (still unique per minute within a day)
            time: b.label,
            pm25: avg(b.pm25),
            pm10: avg(b.pm10),
            co: avg(b.co),
            no2: avg(b.no2),
          }));
        return { summaryStats: summary, chartData: points, xKeyLabel: "time" };
      }

      // Otherwise, just plot each reading for the selected device (or all devices concatenated)
      points = rows
        .filter((r) => r?.timestamp)
        .map((r) => {
          const d = new Date(r.timestamp);
          const hh = String(d.getHours()).padStart(2, "0");
          const mm = String(d.getMinutes()).padStart(2, "0");
          const label = `${hh}:${mm}`;
          return {
            time: label,
            pm25: Number(r.pm25_raw) || 0,
            pm10: Number(r.pm10_raw) || 0,
            co: Number(r.co_raw) || 0,
            no2: Number(r.no2_raw) || 0,
            device_id: r.device_id,
          };
        })
        .sort((a, b) => (a.time < b.time ? -1 : 1));

      return { summaryStats: summary, chartData: points, xKeyLabel: "time" };
    }

    // Multi-day: keep daily aggregation, add Brush for zoom in the chart UI
    const byDate = new Map();
    rows.forEach((r) => {
      if (!r?.timestamp) return;
      const k = dateKeyOf(r.timestamp);
      if (!byDate.has(k)) byDate.set(k, []);
      byDate.get(k).push(r);
    });

    const daily = Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, group]) => ({
        date,
        pm25: avg(group.map((r) => r.pm25_raw)),
        pm10: avg(group.map((r) => r.pm10_raw)),
        co: avg(group.map((r) => r.co_raw)),
        no2: avg(group.map((r) => r.no2_raw)),
      }));

    return { summaryStats: summary, chartData: daily, xKeyLabel: "date" };
  }, [rawRows, filters.startDate, filters.endDate, filters.location, aggregateAll]);

  const handleExport = (format) => {
    alert(`Export ${format} coming soon ✨`);
  };

  const isAllLocations = filters.location === "All Locations";
  const singleDayRange = sameDay(filters.startDate, filters.endDate);

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Historical Data</h1>
          <p>Analyze Past Air Quality Trends – DLSL Campus</p>
        </div>
        <div className="header-right">
          {refreshing && <span className="updating-text">Updating…</span>}
          <button className="notification-btn">🔔</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Filters and Export Section */}
      <div className="historical-filters">
        <div className="filter-controls">
          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-range-inputs">
              <input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="filter-input date-input"
              />
              <span className="date-separator">–</span>
              <input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="filter-input date-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="location-filter">Location</label>
            <select
              id="location-filter"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="filter-select location-select"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {isAllLocations && (
            <div className="filter-group">
              <label htmlFor="aggregate-all">Aggregate across devices</label>
              <input
                id="aggregate-all"
                type="checkbox"
                checked={aggregateAll}
                onChange={(e) => setAggregateAll(e.target.checked)}
              />
            </div>
          )}
        </div>

        <div className="export-controls">
          <button className="export-btn csv-btn" onClick={() => handleExport("CSV")}>
            📊 Export CSV
          </button>
          <button className="export-btn pdf-btn" onClick={() => handleExport("PDF")}>
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Data Sections */}
      <div className="historical-data-grid">
        {/* Summary Statistics */}
        <div className="summary-section">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Summary Statistics
          </h2>

          <div className="stats-cards">
            {summaryStats.map((stat, idx) => (
              <div key={idx} className={`stat-card stat-${stat.color}`}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <h3 className="stat-type">{stat.type}</h3>
                  <div className="stat-values">
                    <div className="stat-item">
                      <span className="stat-label">Avg:</span>
                      <span className="stat-value">
                        {stat.avg} {stat.unit}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Peak:</span>
                      <span className="stat-value">
                        {stat.peak} {stat.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!rawRows.length && (
              <div className="no-alerts" style={{ width: "100%" }}>
                <p>No data for selected filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pollutant Trends Chart */}
        <div className="trends-section">
          <h2 className="section-title">
            <span className="section-icon">📈</span>
            {singleDayRange ? "Intra-day Pollutant Trends" : "Daily Pollutant Trends"}
          </h2>

          <div className="chart-container">
            <div className="chart-content" style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKeyLabel} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pm25" name="PM2.5 (raw)" stroke="#4CAF50" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pm10" name="PM10 (raw)"  stroke="#FFC107" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="co"   name="CO (raw)"    stroke="#2196F3" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="no2"  name="NO₂ (raw)"   stroke="#9C27B0" strokeWidth={2} dot={false} />
                  {/* Zoom control appears for multi-day ranges */}
                  {!singleDayRange && <Brush dataKey={xKeyLabel} height={24} travellerWidth={8} />}
                </LineChart>
              </ResponsiveContainer>
            </div>

  
          </div>
        </div>
      </div>

      {loading && <div className="no-alerts"><p>Loading data…</p></div>}
      {error && <div className="no-alerts"><p>Error: {error}</p></div>}
    </div>
  );
};

export default HistoricalData;
