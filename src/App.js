import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Alerts from './pages/Alerts.jsx';
import Reports from './pages/Reports.jsx';
import HistoricalData from './pages/HistoricalData.jsx';
import SensorSettings from './pages/SensorSettings.jsx';
import Settings from './pages/Settings.jsx';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'alerts':
        return <Alerts />;
      case 'reports':
        return <Reports />;
      case 'historical':
        return <HistoricalData />;
      case 'sensor-settings':
        return <SensorSettings />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;