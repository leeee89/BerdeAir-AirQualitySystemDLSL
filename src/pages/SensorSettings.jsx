import React, { useEffect, useMemo, useState } from 'react';
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

  // Fetch devices from Supabase
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setError(null);
        setLoading(true);

        const { data, error } = await supabase
          .from('Arduino devices') // table name with space, as provided
          .select('device_id, device_name, location');

        if (error) throw error;

        // Map to your UI shape; keep defaults for fields not in DB
        const mapped = (data || []).map((row) => ({
          id: row.device_id,
          name: row.device_name || 'Unnamed Device',
          location: row.location || '—',
          status: 'Active',
          isActive: true,
          thresholds: {
            pm25: null,
            pm10: null,
            co2: null,
          },
        }));

        setSensors(mapped);
        setFilteredSensors(mapped);
      } catch (e) {
        console.error('Failed to load sensors:', e.message);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSort = (sortOption) => {
    setSortBy(sortOption);
  };

  // Filter + sort (derived whenever inputs change)
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

  // Keep filteredSensors in sync (only if you still need the state)
  useEffect(() => {
    setFilteredSensors(visibleSensors);
  }, [visibleSensors]);

  const toggleSensorStatus = (sensorId) => {
    // Local-only toggle for now (no DB column yet)
    const updated = sensors.map((s) =>
      s.id === sensorId
        ? { ...s, isActive: !s.isActive, status: !s.isActive ? 'Active' : 'Inactive' }
        : s
    );
    setSensors(updated);
  };

  const handleEdit = (sensorId) => {
    alert(`Edit sensor ${sensorId} - (DB fields: device_name, location)\n\nTip: We can add an "Edit" dialog to update these fields in Supabase via .update().`);
  };

  const handleAddSensor = () => {
    alert('Add new sensor - We can show a form to insert into "Arduino devices" via .insert({ device_id, device_name, location })');
  };

  const sortOptions = ['Name (A-Z)', 'Name (Z-A)', 'Status', 'Location'];

  return (
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

              <div className="sensor-status-row">
                <span className="status-label">Status:</span>
                <div className="status-toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={sensor.isActive}
                      onChange={() => toggleSensorStatus(sensor.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`status-text ${sensor.isActive ? 'active' : 'inactive'}`}>
                    {sensor.status}
                  </span>
                </div>
              </div>

              <div className="thresholds-section">
                <div className="threshold-item">
                  <span className="threshold-label">PM2.5 Threshold:</span>
                  <span className="threshold-value">
                    {sensor.thresholds.pm25 ?? '—'} {sensor.thresholds.pm25 ? 'μg/m³' : ''}
                  </span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">PM10 Threshold:</span>
                  <span className="threshold-value">
                    {sensor.thresholds.pm10 ?? '—'} {sensor.thresholds.pm10 ? 'μg/m³' : ''}
                  </span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">CO₂ Threshold:</span>
                  <span className="threshold-value">
                    {sensor.thresholds.co2 ?? '—'} {sensor.thresholds.co2 ? 'ppm' : ''}
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
