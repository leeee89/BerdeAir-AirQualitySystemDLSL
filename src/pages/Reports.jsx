import React, { useState } from 'react';
import '../css/Reports.css';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    sensorLocation: 'All Locations',
    pollutant: 'All'
  });

  // Sample reports data
  const [reports] = useState([
    {
      id: 'REP-20240521-01',
      dateGenerated: '2024-05-21 13:55',
      sensorLocation: 'Main Gate',
      pollutants: ['PM2.5', 'CO₂'],
      aqiSummary: 'Unhealthy (CO₂: 1048 ppm)',
      status: 'unhealthy'
    },
    {
      id: 'REP-20240521-02',
      dateGenerated: '2024-05-21 13:30',
      sensorLocation: 'Sport Complex',
      pollutants: ['PM2.5', 'PM10'],
      aqiSummary: 'Moderate (PM10: 38 μg/m³)',
      status: 'moderate'
    },
    {
      id: 'REP-20240521-03',
      dateGenerated: '2024-05-21 13:30',
      sensorLocation: 'Oval',
      pollutants: ['PM2.5'],
      aqiSummary: 'Good (PM2.5: 17 μg/m³)',
      status: 'good'
    },
    {
      id: 'REP-20240520-01',
      dateGenerated: '2024-05-20 16:10',
      sensorLocation: 'CBEAM Gate Entrance',
      pollutants: ['CO₂', 'PM10'],
      aqiSummary: 'Unhealthy (CO₂: 1150 ppm)',
      status: 'unhealthy'
    }
  ]);

  const [filteredReports, setFilteredReports] = useState(reports);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    let filtered = reports.filter(report => {
      // Date range filter
      if (filters.startDate && filters.endDate) {
        const reportDate = new Date(report.dateGenerated.split(' ')[0]);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        if (reportDate < startDate || reportDate > endDate) {
          return false;
        }
      }
      
      // Location filter
      if (filters.sensorLocation !== 'All Locations' && 
          report.sensorLocation !== filters.sensorLocation) {
        return false;
      }
      
      // Pollutant filter
      if (filters.pollutant !== 'All') {
        const hasPollutant = report.pollutants.some(pollutant => 
          pollutant.includes(filters.pollutant)
        );
        if (!hasPollutant) {
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

  const handleNewReport = () => {
    console.log('Generating new report');
    alert('Generating new report - Feature to be implemented');
  };

  const getPollutantBadge = (pollutant) => {
    const pollutantStyles = {
      'PM2.5': 'pollutant-badge pm25',
      'PM10': 'pollutant-badge pm10',
      'CO₂': 'pollutant-badge co2'
    };
    return pollutantStyles[pollutant] || 'pollutant-badge';
  };

  const getStatusClass = (status) => {
    return `status-indicator ${status}`;
  };

  const locations = [
    'All Locations',
    'Main Gate',
    'Sport Complex',
    'Oval',
    'CREAM Gate Entrance',
    'Library',
    'Main Building',
    'Gym'
  ];

  const pollutants = [
    'All',
    'PM2.5',
    'PM10',
    'CO₂'
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Reports</h1>
          <p>Comprehensive Air Quality Reports – De La Salle Lipa</p>
        </div>
        <div className="header-right">
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
        >
          🔍 Apply Filters
        </button>
      </div>

      {/* Generated Reports Section */}
      <div className="reports-section">
        <div className="reports-header">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Generated Reports
          </h2>
          <button 
            className="new-report-btn"
            onClick={handleNewReport}
          >
            ➕ New Report
          </button>
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
                  <td className="report-date">
                    {report.dateGenerated}
                  </td>
                  <td className="report-location">
                    {report.sensorLocation}
                  </td>
                  <td className="report-pollutants">
                    <div className="pollutants-list">
                      {report.pollutants.map((pollutant, index) => (
                        <span 
                          key={index} 
                          className={getPollutantBadge(pollutant)}
                        >
                          {pollutant}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="report-aqi">
                    <div className="aqi-summary">
                      <span className={getStatusClass(report.status)}></span>
                      <span className="aqi-text">{report.aqiSummary}</span>
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

          {filteredReports.length === 0 && (
            <div className="no-reports">
              <p>No reports found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;