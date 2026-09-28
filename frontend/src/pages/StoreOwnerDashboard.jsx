import { useEffect, useState } from 'react';
import client from '../api/client';
import SortableTable from '../components/SortableTable';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'rating', label: 'Rating' },
];

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get('/store-owner/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return <div className="page error-banner">{error}</div>;
  if (!data) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>{data.store.name}</h2>
      <p>{data.store.address}</p>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{data.averageRating}</span>
          <span className="stat-label">Average Rating</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.raters.length}</span>
          <span className="stat-label">Total Ratings</span>
        </div>
      </div>

      <h3>Users who rated your store</h3>
      <SortableTable
        columns={COLUMNS}
        rows={data.raters}
        sortBy={null}
        sortOrder="ASC"
        onSort={() => {}}
        renderRow={(rater) => (
          <tr key={rater.id}>
            <td>{rater.name}</td>
            <td>{rater.email}</td>
            <td>{rater.address}</td>
            <td>{rater.rating}</td>
          </tr>
        )}
      />
    </div>
  );
}
