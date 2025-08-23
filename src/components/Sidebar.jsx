import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'alerts', icon: '🔔', label: 'Alerts' },
    { id: 'reports', icon: '📄', label: 'Reports' },
    { id: 'sensor-settings', icon: '⚙️', label: 'Sensor Settings' },
    { id: 'historical', icon: '📈', label: 'Historical Data' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🌱</div>
          <div className="logo-text">
            <h3>BerdeAir</h3>
            <span>DLSL Air Quality Monitoring System</span>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">JD</div>
          <div className="user-details">
            <span className="user-name">Juan Dela Cruz</span>
            <span className="user-role">BERSERC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;