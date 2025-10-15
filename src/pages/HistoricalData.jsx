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

const HistoricalData = () => {
  // Filters
  const [filters, setFilters] = useState({
    startDate: "2024-05-16",
    endDate: "2024-05-22",
    location: "All Locations",
  });

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
          .select("timestamp, device_id, pm2_5, pm10, co")
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

  // Compute summary stats + trend data
  const { summaryStats, trendData } = useMemo(() => {
    // group by YYYY-MM-DD
    const byDate = new Map();

    rawRows.forEach((r) => {
      if (!r?.timestamp) return;
      const d = new Date(r.timestamp);
      // format to YYYY-MM-DD (local)
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey).push(r);
    });

    const trend = Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, rows]) => {
        const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + (Number(v) || 0), 0) / arr.length : 0);
        return {
          date,
          pm25: avg(rows.map((r) => r.pm2_5)),
          pm10: avg(rows.map((r) => r.pm10)),
          co2: avg(rows.map((r) => r.co)), // assuming 'co' = CO₂ (ppm)
        };
      });

    const allPM25 = rawRows.map((r) => Number(r.pm2_5) || 0);
    const allPM10 = rawRows.map((r) => Number(r.pm10) || 0);
    const allCO2 = rawRows.map((r) => Number(r.co) || 0);

    const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);
    const max = (arr) => (arr.length ? Math.max(...arr) : 0);

    const summary = [
      {
        type: "PM2.5",
        icon: "🌱",
        avg: Number(avg(allPM25).toFixed(1)),
        peak: Number(max(allPM25).toFixed(1)),
        unit: "μg/m³",
        color: "green",
      },
      {
        type: "PM10",
        icon: "💨",
        avg: Number(avg(allPM10).toFixed(1)),
        peak: Number(max(allPM10).toFixed(1)),
        unit: "μg/m³",
        color: "yellow",
      },
      {
        type: "CO₂",
        icon: "☁️",
        avg: Number(avg(allCO2).toFixed(0)),
        peak: Number(max(allCO2).toFixed(0)),
        unit: "ppm",
        color: "blue",
      },
    ];

    return { summaryStats: summary, trendData: trend };
  }, [rawRows]);

  const handleExport = (format) => {
    alert(`Export ${format} coming soon ✨`);
  };

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
            <label htmlFor="date-range">Date Range</label>
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
            Pollutant Trends Over Time
          </h2>

          <div className="chart-container">
            <div className="chart-content" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {/* Recharts will use default colors unless you specify; keeping it simple */}
                  <Line type="monotone" dataKey="co2" name="CO₂ (ppm)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pm10" name="PM10 (µg/m³)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pm25" name="PM2.5 (µg/m³)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color pm25"></span>
                <span className="legend-label">PM2.5</span>
              </div>
              <div className="legend-item">
                <span className="legend-color pm10"></span>
                <span className="legend-label">PM10</span>
              </div>
              <div className="legend-item">
                <span className="legend-color co2"></span>
                <span className="legend-label">CO₂</span>
              </div>
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
