// src/pages/SensorSettings.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import '../css/SensorSettings.css';
import { supabase } from '../Database';

const SensorSettings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Name (A-Z)');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live sensors from DB (mapped to your UI shape)
  const [sensors, setSensors] = useState([]);
  const [filteredSensors, setFilteredSensors] = useState([]);

  // Static thresholds (Warning / Danger)
  const THRESHOLDS = {
    pm25: { label: 'PM2.5', warning: '>35 µg/m³', danger: '>150 µg/m³' },
    pm10: { label: 'PM10',  warning: '>100 µg/m³', danger: '>300 µg/m³' },
    no2:  { label: 'NO₂',   warning: '>100 ppb',   danger: '>650 ppb'   },
    co:   { label: 'CO',    warning: '>9 ppm',     danger: '>15 ppm'    },
  };

  const fetchDevices = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // 1) Devices
      const { data: deviceRows, error: devErr } = await supabase
        .from('Arduino devices')
        .select('device_id, device_name, location');
      if (devErr) throw devErr;

      const deviceIds = (deviceRows ?? [])
        .map(d => d.device_id)
        .filter(Boolean);

      // 2) Who is active in the last 10 minutes?
      const sinceIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      let activeSet = new Set();
      if (deviceIds.length > 0) {
        const { data: recentRows, error: readErr } = await supabase
          .from('air_quality_readings')
          .select('device_id, timestamp')
          .gte('timestamp', sinceIso)
          .in('device_id', deviceIds);
        if (readErr) throw readErr;

        activeSet = new Set((recentRows ?? []).map(r => r.device_id));
      }

      // 3) Map to UI
      const mapped = (deviceRows ?? []).map((row) => {
        const isActive = activeSet.has(row.device_id);
        return {
          id: row.device_id,
          name: row.device_name || 'Unnamed Device',
          location: row.location || '—',
          status: isActive ? 'Active' : 'Inactive',
          isActive,
        };
      });

      setSensors(mapped);
      setFilteredSensors(mapped);
    } catch (e) {
      console.error('Failed to load sensors:', e.message);
      setError(e.message);
      setSensors([]);
      setFilteredSensors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleSearch = (query) => setSearchQuery(query);
  const handleSort = (sortOption) => setSortBy(sortOption);

  // Filter + sort
  const visibleSensors = useMemo(() => {
    let list = [...sensors];

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.id || '').toLowerCase().includes(q) ||
        (s.location || '').toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'Name (A-Z)':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'Name (Z-A)':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'Status':
        list.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });
        break;
      case 'Location':
        list.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        break;
      default:
        break;
    }

    return list;
  }, [sensors, searchQuery, sortBy]);

  // Sync derived list
  useEffect(() => {
    setFilteredSensors(visibleSensors);
  }, [visibleSensors]);

  const handleEdit = (sensorId) => {
    alert(
      `Edit sensor ${sensorId}\n\nTip: Implement a dialog to update 'device_name' or 'location' via Supabase .update().`
    );
  };

  const handleAddSensor = () => {
    alert('Add new sensor — show a form to insert into "Arduino devices" via .insert({ device_id, device_name, location })');
  };

  const sortOptions = ['Name (A-Z)', 'Name (Z-A)', 'Status', 'Location'];

  return {
    /* JSX below */
  } && (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Sensor Settings</h1>
          <p>Configure Deployed Sensors – De La Salle Lipa Campus</p>
        </div>
        <div className="header-right">
          {loading && <span className="updating-text">Loading…</span>}
          <button className="notification-btn">🔔</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="sensor-controls">
        <div className="search-sort-controls">
          <div className="search-group">
            <label htmlFor="sensor-search">Search</label>
            <div className="search-input-wrapper">
              <input
                id="sensor-search"
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Sensor name, ID, or location…"
                className="search-input"
              />
              <button className="search-btn" type="button">🔍</button>
            </div>
          </div>

          <div className="sort-group">
            <label htmlFor="sort-by">Sort By</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="sort-select"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="add-sensor-btn" onClick={handleAddSensor}>
          ➕ Add Sensor
        </button>
      </div>

      {/* Sensors Grid */}
      <div className="sensors-section">
        <div className="sensors-grid">
          {filteredSensors.map((sensor) => (
            <div key={sensor.id} className="sensor-card">
              <div className="sensor-card-header">
                <div className="sensor-info">
                  <div className="sensor-icon">📡</div>
                  <div className="sensor-details">
                    <h3 className="sensor-id">{sensor.id}</h3>
                    <p className="sensor-name">{sensor.name}</p>
                    <p className="sensor-location">📍 {sensor.location}</p>
                  </div>
                </div>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(sensor.id)}
                  title="Edit Sensor"
                >
                  ✏️ Edit
                </button>
              </div>

              {/* Computed status (last 10 mins), no toggle */}
              <div className="sensor-status-row">
                <span className="status-label">Status:</span>
                <span className={`status-text ${sensor.isActive ? 'active' : 'inactive'}`}>
                  {sensor.status}
                </span>
              </div>

              {/* Thresholds (Warning / Danger) */}
              <div className="thresholds-section">
                <div className="threshold-item">
                  <span className="threshold-label">{THRESHOLDS.pm25.label} Thresholds:</span>
                  <span className="threshold-value">
                    Warning {THRESHOLDS.pm25.warning} • Danger {THRESHOLDS.pm25.danger}
                  </span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">{THRESHOLDS.pm10.label} Thresholds:</span>
                  <span className="threshold-value">
                    Warning {THRESHOLDS.pm10.warning} • Danger {THRESHOLDS.pm10.danger}
                  </span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">{THRESHOLDS.no2.label} Thresholds:</span>
                  <span className="threshold-value">
                    Warning {THRESHOLDS.no2.warning} • Danger {THRESHOLDS.no2.danger}
                  </span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">{THRESHOLDS.co.label} Thresholds:</span>
                  <span className="threshold-value">
                    Warning {THRESHOLDS.co.warning} • Danger {THRESHOLDS.co.danger}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && filteredSensors.length === 0 && (
          <div className="no-sensors">
            <p>No sensors found matching your search criteria.</p>
          </div>
        )}

        {error && (
          <div className="no-sensors">
            <p>Error loading sensors: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorSettings;
