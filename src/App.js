import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import SensorSettings from "./pages/SensorSettings";
import HistoricalData from "./pages/HistoricalData";
import Dashboard from "./pages/Dashboard";
import './App.css';

function App() {
  return (
    <Router>
      <Sidebar />
      <div className="ml-64">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/sensor-settings" element={<SensorSettings />} />
          <Route path="/historical-data" element={<HistoricalData />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
