import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Statistik() {
  const [stats, setStats] = useState({ peserta: {}, marketing: {} });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card p-3 shadow-sm">
      <h5>📊 Statistik</h5>
      <div className="row">
        <div className="col-md-6">
          <h6>Peserta</h6>
          <p>Hari ini: {stats.peserta.today || 0}</p>
          <p>Kemarin: {stats.peserta.yesterday || 0}</p>
          <p>Total: {stats.peserta.total || 0}</p>
        </div>
        <div className="col-md-6">
          <h6>Marketing</h6>
          <p>Hari ini: {stats.marketing.today || 0}</p>
          <p>Kemarin: {stats.marketing.yesterday || 0}</p>
          <p>Total: {stats.marketing.total || 0}</p>
        </div>
      </div>
    </div>
  );
}
