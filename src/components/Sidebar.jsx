import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-green-100 p-5 fixed">
      <h2 className="text-2xl font-bold text-green-700 mb-6">BerdeAir</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/" className="hover:text-green-600">Dashboard</Link>
        <Link to="/alerts" className="hover:text-green-600">Alerts</Link>
        <Link to="/reports" className="hover:text-green-600">Reports</Link>
        <Link to="/sensor-settings" className="hover:text-green-600">Sensor Settings</Link>
        <Link to="/historical-data" className="hover:text-green-600">Historical Data</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
