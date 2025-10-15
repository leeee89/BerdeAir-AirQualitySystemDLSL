import React, { useState } from 'react';
import '../css/SensorSettings.css';

const SensorSettings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Name (A-Z)');

  // Sample sensor data
  const [sensors, setSensors] = useState([
    {
      id: 'DLSL-S001',
      name: 'Main Gate',
      status: 'Active',
      isActive: true,
      thresholds: {
        pm25: 50,
        pm10: 70,
        co2: 1000
      }
    },
    {
      id: 'DLSL-S002',
      name: 'Sport Complex',
      status: 'Active',
      isActive: true,
      thresholds: {
        pm25: 55,
        pm10: 75,
        co2: 1050
      }
    },
    {
      id: 'DLSL-S003',
      name: 'CBEAM Gate Entrance',
      status: 'Inactive',
      isActive: false,
      thresholds: {
        pm25: 60,
        pm10: 80,
        co2: 1100
      }
    }
  ]);

  const [filteredSensors, setFilteredSensors] = useState(sensors);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterAndSortSensors(query, sortBy);
  };

  const handleSort = (sortOption) => {
    setSortBy(sortOption);
    filterAndSortSensors(searchQuery, sortOption);
  };

  const filterAndSortSensors = (query, sortOption) => {
    let filtered = sensors.filter(sensor =>
      sensor.name.toLowerCase().includes(query.toLowerCase()) ||
      sensor.id.toLowerCase().includes(query.toLowerCase())
    );

    // Sort the filtered results
    switch (sortOption) {
      case 'Name (A-Z)':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Name (Z-A)':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Status':
        filtered.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'Location':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredSensors(filtered);
  };

  const toggleSensorStatus = (sensorId) => {
    const updatedSensors = sensors.map(sensor => {
      if (sensor.id === sensorId) {
        return {
          ...sensor,
          isActive: !sensor.isActive,
          status: !sensor.isActive ? 'Active' : 'Inactive'
        };
      }
      return sensor;
    });
    
    setSensors(updatedSensors);
    filterAndSortSensors(searchQuery, sortBy);
  };

  const handleEdit = (sensorId) => {
    console.log(`Editing sensor: ${sensorId}`);
    alert(`Edit sensor ${sensorId} - Feature to be implemented`);
  };

  const handleAddSensor = () => {
    console.log('Adding new sensor');
    alert('Add new sensor - Feature to be implemented');
  };

  const sortOptions = [
    'Name (A-Z)',
    'Name (Z-A)',
    'Status',
    'Location'
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Sensor Settings</h1>
          <p>Configure Deployed Sensors – De La Salle Lipa Campus</p>
        </div>
        <div className="header-right">
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
                placeholder="Sensor name or location..."
                className="search-input"
              />
              <button className="search-btn" type="button">
                🔍
              </button>
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
              {sortOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          className="add-sensor-btn"
          onClick={handleAddSensor}
        >
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
                  <div className="sensor-icon">
                    📡
                  </div>
                  <div className="sensor-details">
                    <h3 className="sensor-id">{sensor.id}</h3>
                    <p className="sensor-name">{sensor.name}</p>
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
                  <span className="threshold-value">{sensor.thresholds.pm25} μg/m³</span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">PM10 Threshold:</span>
                  <span className="threshold-value">{sensor.thresholds.pm10} μg/m³</span>
                </div>
                <div className="threshold-item">
                  <span className="threshold-label">CO₂ Threshold:</span>
                  <span className="threshold-value">{sensor.thresholds.co2} ppm</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSensors.length === 0 && (
          <div className="no-sensors">
            <p>No sensors found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorSettings;