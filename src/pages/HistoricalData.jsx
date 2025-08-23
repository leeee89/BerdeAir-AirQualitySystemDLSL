import React from 'react';

const HistoricalData = () => {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Historical Data</h1>
          <p>Historical Air Quality Data Analysis</p>
        </div>
        <div className="header-right">
          <button className="notification-btn">🔔</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>
      <div className="content-placeholder">
        <h3>Historical Data page content will go here</h3>
      </div>
    </div>
  );
};

export default HistoricalData;