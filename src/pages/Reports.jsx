// src/pages/Reports.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import '../css/Reports.css';
import { supabase } from "../Database";

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    sensorLocation: 'All Locations',
    pollutant: 'All'
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);     // <-- NEW
  const [rawReports, setRawReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [locations, setLocations] = useState(['All Locations']);

  const getStatusClass = (status) => `status-indicator ${status || ''}`;
  const pollutants = useMemo(() => ['All', 'PM2.5', 'PM10', 'CO', 'NO2'], []);

  // ---- Fetcher (now reusable) ----
  const fetchData = useCallback(async () => {
    try {
      // If we already have data, show the "refreshing" state; otherwise show full "loading"
      setLoading(rawReports.length === 0);
      setRefreshing(rawReports.length > 0);

      // 1) Pull reports
      const { data: reportsData, error: reportsErr } = await supabase
        .from('reports')
        .select('*');
      if (reportsErr) throw reportsErr;

      const safeReports = Array.isArray(reportsData) ? reportsData : [];

      // 2) Collect device_ids for join
      const deviceIds = Array.from(
        new Set(safeReports.map(r => r.device_id).filter(Boolean))
      );

      // 3) Pull devices
      let devicesData = [];
      if (deviceIds.length > 0) {
        const { data, error } = await supabase
          .from('Arduino devices')  // you confirmed no quotes needed
          .select('device_id, location, device_name')
          .in('device_id', deviceIds);
        if (error) throw error;
        devicesData = data || [];
      }

      const devicesById = new Map(devicesData.map(d => [d.device_id, d]));

      // 4) Build rows for UI
      const joined = safeReports.map((rep, idx) => {
        const device = rep.device_id ? devicesById.get(rep.device_id) : null;

        const whenRaw = rep.report_time || null;
        const when = whenRaw ? new Date(whenRaw) : null;

        const reportId = rep.report_id;
        const pollutant = rep.pollutant; // string (e.g., "PM2.5")

        return {
          id: reportId,
          dateGenerated: when ? when.toLocaleString() : '—',
          sensorLocation: device?.location ?? 'Unknown Location',
          pollutants: pollutant ?? '—', // you’re rendering as plain text in the cell
          aqiSummary: null,
          status: '',
          _deviceFound: !!device
        };
      });

      setRawReports(joined);
      setFilteredReports(joined);

      // Dynamic locations dropdown
      const uniqueLocs = Array.from(
        new Set(joined.map(j => j.sensorLocation).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b));
      setLocations(['All Locations', ...uniqueLocs]);
    } catch (e) {
      console.error('Reports fetch error:', e);
      setRawReports([]);
      setFilteredReports([]);
      setLocations(['All Locations']);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rawReports.length, supabase]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manual refresh click
  const handleManualRefresh = () => {
    fetchData();
  };

  // Filters
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const applyFilters = () => {
    let filtered = rawReports.filter(report => {
      // Date range
      if (filters.startDate && filters.endDate && report.dateGenerated && report.dateGenerated !== '—') {
        const d = new Date(report.dateGenerated);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (d < start || d > end) return false;
      }

      // Location
      if (filters.sensorLocation !== 'All Locations' &&
          report.sensorLocation !== filters.sensorLocation) {
        return false;
      }

      // Pollutant (your `pollutants` is currently a string in report)
      if (filters.pollutant !== 'All') {
        if (!report.pollutants || !String(report.pollutants).includes(filters.pollutant)) {
          return false;
        }
      }

      return true;
    });

    setFilteredReports(filtered);
  };

  const handleDownload = (reportId) => {
    console.log(`Downloading report: ${reportId}`);
    alert(`Downloading ${reportId} - Feature to be implemented`);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Reports</h1>
          <p>Comprehensive Air Quality Reports – De La Salle Lipa</p>
        </div>
        <div className="header-right">
          <button
            className={`refresh-btn ${refreshing ? "refreshing" : ""}`} // <-- NEW
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            {refreshing ? "⟳ Refreshing..." : "⟳ Refresh"}
          </button>
          <button className="notification-btn">🔔</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="reports-filters">
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="date-range">Date Range</label>
            <div className="date-range-inputs">
              <input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="filter-input date-input"
                placeholder="mm/dd/yyyy"
              />
              <span className="date-separator">to</span>
              <input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="filter-input date-input"
                placeholder="mm/dd/yyyy"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="sensor-location">Sensor Location</label>
            <select
              id="sensor-location"
              value={filters.sensorLocation}
              onChange={(e) => handleFilterChange('sensorLocation', e.target.value)}
              className="filter-select"
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="pollutant">Pollutant</label>
            <select
              id="pollutant"
              value={filters.pollutant}
              onChange={(e) => handleFilterChange('pollutant', e.target.value)}
              className="filter-select"
            >
              {pollutants.map(pollutant => (
                <option key={pollutant} value={pollutant}>{pollutant}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="apply-filters-btn"
          onClick={applyFilters}
          disabled={loading || refreshing}
        >
          {(loading || refreshing) ? 'Loading…' : '🔍 Apply Filters'}
        </button>
      </div>

      {/* Generated Reports Section */}
      <div className="reports-section">
        <div className="reports-header">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Generated Reports
          </h2>
        </div>

        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Date & Time Generated</th>
                <th>Sensor Location</th>
                <th>Pollutants Recorded</th>
                <th>AQI Summary</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="report-row">
                  <td className="report-id">
                    <span className="report-id-text">{report.id}</span>
                  </td>
                  <td className="report-date">{report.dateGenerated}</td>
                  <td className="report-location">{report.sensorLocation}</td>
                  <td className="report-pollutant">{report.pollutants}</td>
                  <td className="report-aqi">
                    <div className="aqi-summary">
                      <span className={getStatusClass(report.status)}></span>
                      <span className="aqi-text">{report.aqiSummary ?? '—'}</span>
                    </div>
                  </td>
                  <td className="report-download">
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(report.id)}
                      title="Download Report"
                    >
                      💾
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && !refreshing && filteredReports.length === 0 && (
            <div className="no-reports">
              <p>No reports found matching your criteria.</p>
            </div>
          )}

          {(loading || refreshing) && (
            <div className="no-reports">
              <p>Loading reports…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
