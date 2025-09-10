import React, { useState } from 'react';
import '../css/HistoricalData.css';

const HistoricalData = () => {
  const [filters, setFilters] = useState({
    startDate: '2024-05-16',
    endDate: '2024-05-22',
    location: 'All Locations'
  });

  // Sample summary statistics data
  const [summaryStats] = useState([
    {
      type: 'PM2.5',
      icon: '🌱',
      avg: 32,
      peak: 61,
      unit: 'μg/m³',
      color: 'green'
    },
    {
      type: 'PM10',
      icon: '💨',
      avg: 44,
      peak: 90,
      unit: 'μg/m³',
      color: 'yellow'
    },
    {
      type: 'CO₂',
      icon: '☁️',
      avg: 898,
      peak: 1240,
      unit: 'ppm',
      color: 'blue'
    }
  ]);

  // Sample trend data for the chart
  const [trendData] = useState([
    { date: '2024-05-16', pm25: 25, pm10: 35, co2: 820 },
    { date: '2024-05-17', pm25: 45, pm10: 55, co2: 1200 },
    { date: '2024-05-18', pm25: 38, pm10: 48, co2: 950 },
    { date: '2024-05-19', pm25: 28, pm10: 38, co2: 880 },
    { date: '2024-05-20', pm25: 42, pm10: 52, co2: 1050 },
    { date: '2024-05-21', pm25: 35, pm10: 45, co2: 780 },
    { date: '2024-05-22', pm25: 30, pm10: 40, co2: 850 }
  ]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleExport = (format) => {
    // Placeholder for export functionality
    console.log(`Exporting data as ${format}`);
    alert(`Exporting data as ${format} - Feature to be implemented`);
  };

  const locations = [
    'All Locations',
    'Main Gate',
    'Sports Complex', 
    'Gym',
    'CBEAM Gate Entrance',
    'Side Gate',
    'Main Building'
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Historical Data</h1>
          <p>Analyze Past Air Quality Trends – DLSL Campus</p>
        </div>
        <div className="header-right">
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
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="filter-input date-input"
              />
              <span className="date-separator">–</span>
              <input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="filter-input date-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="location-filter">Location</label>
            <select
              id="location-filter"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="filter-select location-select"
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="export-controls">
          <button 
            className="export-btn csv-btn"
            onClick={() => handleExport('CSV')}
          >
            📊 Export CSV
          </button>
          <button 
            className="export-btn pdf-btn"
            onClick={() => handleExport('PDF')}
          >
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
            {summaryStats.map((stat, index) => (
              <div key={index} className={`stat-card stat-${stat.color}`}>
                <div className="stat-icon">
                  {stat.icon}
                </div>
                <div className="stat-content">
                  <h3 className="stat-type">{stat.type}</h3>
                  <div className="stat-values">
                    <div className="stat-item">
                      <span className="stat-label">Avg:</span>
                      <span className="stat-value">{stat.avg} {stat.unit}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Peak:</span>
                      <span className="stat-value">{stat.peak} {stat.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pollutant Trends Chart */}
        <div className="trends-section">
          <h2 className="section-title">
            <span className="section-icon">📈</span>
            Pollutant Trends Over Time
          </h2>
          
          <div className="chart-container">
            <div className="chart-placeholder">
              <div className="chart-content">
                <div className="sample-chart">
                  {/* Simple chart representation */}
                  <div className="chart-y-axis">
                    <div className="y-label">1,400</div>
                    <div className="y-label">1,200</div>
                    <div className="y-label">1,000</div>
                    <div className="y-label">800</div>
                    <div className="y-label">600</div>
                    <div className="y-label">400</div>
                    <div className="y-label">200</div>
                    <div className="y-label">0</div>
                  </div>
                  
                  <div className="chart-area">
                    <svg viewBox="0 0 600 300" className="trend-chart">
                      {/* CO2 line (blue) */}
                      <polyline 
                        points="50,180 120,60 190,120 260,160 330,90 400,200 470,170"
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="3"
                      />
                      {/* PM10 line (yellow) */}
                      <polyline 
                        points="50,240 120,220 190,215 260,225 330,210 400,220 470,230"
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="3"
                      />
                      {/* PM2.5 line (green) */}
                      <polyline 
                        points="50,250 120,230 190,235 260,245 330,232 400,240 470,245"
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="3"
                      />
                    </svg>
                  </div>
                  
                  <div className="chart-x-axis">
                    <div className="x-label">2024-05-16</div>
                    <div className="x-label">2024-05-17</div>
                    <div className="x-label">2024-05-18</div>
                    <div className="x-label">2024-05-19</div>
                    <div className="x-label">2024-05-20</div>
                    <div className="x-label">2024-05-21</div>
                    <div className="x-label">2024-05-22</div>
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default HistoricalData;