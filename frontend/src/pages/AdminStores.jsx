import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import SortableTable from '../components/SortableTable';
import { validateAddress, validateEmail } from '../utils/validation';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'rating', label: 'Rating' },
];

const EMPTY_FORM = { name: '', email: '', address: '', ownerId: '' };

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const fetchStores = useCallback(async () => {
    const params = { ...filters, sortBy, sortOrder };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    const { data } = await client.get('/admin/stores', { params });
    setStores(data.stores);
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  function handleSort(key) {
    if (key === sortBy) setSortOrder((p) => (p === 'ASC' ? 'DESC' : 'ASC'));
    else {
      setSortBy(key);
      setSortOrder('ASC');
    }
  }

  function validate() {
    const next = {
      name: !form.name || form.name.length > 60 ? 'Store name is required (max 60 chars)' : '',
      email: validateEmail(form.email),
      address: validateAddress(form.address),
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    try {
      const payload = { ...form, ownerId: form.ownerId ? Number(form.ownerId) : null };
      await client.post('/admin/stores', payload);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchStores();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create store');
    }
  }

  return (
    <div>
      <div className="section-header">
        <h3>Stores</h3>
        <button onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : 'Add Store'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          {serverError && <div className="error-banner">{serverError}</div>}
          <label>
            Store Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>
          <label>
            Address
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </label>
          <label>
            Owner User ID (optional, promotes user to Store Owner)
            <input
              value={form.ownerId}
              onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
            />
          </label>
          <button type="submit">Create</button>
        </form>
      )}

      <div className="filter-bar">
        <input
          placeholder="Filter by name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Filter by email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          placeholder="Filter by address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
      </div>

      <SortableTable
        columns={COLUMNS}
        rows={stores}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        renderRow={(s) => (
          <tr key={s.id}>
            <td>{s.name}</td>
            <td>{s.email}</td>
            <td>{s.address}</td>
            <td>{Number(s.rating).toFixed(2)}</td>
          </tr>
        )}
      />
    </div>
  );
}
