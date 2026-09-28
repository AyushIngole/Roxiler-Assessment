import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import client from '../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const location = useLocation();
  const isRoot = location.pathname === '/admin';

  useEffect(() => {
    client.get('/admin/dashboard').then((res) => setStats(res.data));
  }, []);

  return (
    <div className="page">
      <div className="admin-tabs">
        <Link to="/admin" className={isRoot ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/stores">Stores</Link>
      </div>

      {isRoot &&
        (stats ? (
          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-value">{stats.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.totalStores}</span>
              <span className="stat-label">Total Stores</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.totalRatings}</span>
              <span className="stat-label">Total Ratings</span>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        ))}

      <Outlet />
    </div>
  );
}
