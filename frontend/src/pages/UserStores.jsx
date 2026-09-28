import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import SortableTable from '../components/SortableTable';

const COLUMNS = [
  { key: 'name', label: 'Store Name' },
  { key: 'address', label: 'Address' },
  { key: 'rating', label: 'Overall Rating' },
  { key: 'userRating', label: 'Your Rating', sortable: false },
  { key: 'action', label: 'Action', sortable: false },
];

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [draftRatings, setDraftRatings] = useState({});

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy, sortOrder };
      const { data } = await client.get('/user/stores', { params });
      setStores(data.stores);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  function handleSort(key) {
    if (key === sortBy) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(key);
      setSortOrder('ASC');
    }
  }

  async function submitRating(storeId) {
    const value = Number(draftRatings[storeId]);
    if (!value || value < 1 || value > 5) return;
    setSavingId(storeId);
    try {
      await client.post(`/user/stores/${storeId}/ratings`, { value });
      await fetchStores();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="page">
      <h2>Browse Stores</h2>
      <div className="filter-bar">
        <input
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Search by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <SortableTable
          columns={COLUMNS}
          rows={stores}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          renderRow={(store) => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.address}</td>
              <td>{store.rating}</td>
              <td>{store.userRating ?? 'Not rated'}</td>
              <td>
                <select
                  value={draftRatings[store.id] ?? store.userRating ?? ''}
                  onChange={(e) =>
                    setDraftRatings({ ...draftRatings, [store.id]: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button
                  disabled={savingId === store.id}
                  onClick={() => submitRating(store.id)}
                >
                  {store.userRating != null ? 'Update' : 'Submit'}
                </button>
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}
