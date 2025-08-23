import React from "react";

const Settings = () => {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <h1>Settings</h1>
          <p>System Configuration</p>
        </div>
        <div className="header-right">
          <button className="notification-btn">🔔</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>
      <div className="content-placeholder">
        <h3>Settings page content will go here</h3>
      </div>
    </div>
  );
};

export default Settings;
