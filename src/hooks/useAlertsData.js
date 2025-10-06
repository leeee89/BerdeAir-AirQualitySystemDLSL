import { useState, useEffect } from "react";
import { supabase } from "../Database";

export default function useAlertsData() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // single fetch logic, reusable by both auto and manual refresh
  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("air_quality_readings")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchAlerts();
  }, []);

  return { alerts, loading, error, fetchAlerts };
}
