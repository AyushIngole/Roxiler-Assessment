import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import SortableTable from '../components/SortableTable';
import { validateName, validateAddress, validateEmail, validatePassword } from '../utils/validation';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'role', label: 'Role' },
  { key: 'view', label: '', sortable: false },
];

const EMPTY_FORM = { name: '', email: '', address: '', password: '', role: 'USER' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [detail, setDetail] = useState(null);

  const fetchUsers = useCallback(async () => {
    const params = { ...filters, sortBy, sortOrder };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    const { data } = await client.get('/admin/users', { params });
    setUsers(data.users);
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSort(key) {
    if (key === sortBy) setSortOrder((p) => (p === 'ASC' ? 'DESC' : 'ASC'));
    else {
      setSortBy(key);
      setSortOrder('ASC');
    }
  }

  function validate() {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    try {
      await client.post('/admin/users', form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create user');
    }
  }

  async function viewDetails(id) {
    const { data } = await client.get(`/admin/users/${id}`);
    setDetail(data);
  }

  return (
    <div>
      <div className="section-header">
        <h3>Users</h3>
        <button onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          {serverError && <div className="error-banner">{serverError}</div>}
          <label>
            Name
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
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="USER">Normal User</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
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
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
      </div>

      <SortableTable
        columns={COLUMNS}
        rows={users}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        renderRow={(u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.address}</td>
            <td>{u.role}</td>
            <td>
              <button onClick={() => viewDetails(u.id)}>View</button>
            </td>
          </tr>
        )}
      />

      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{detail.user.name}</h3>
            <p>Email: {detail.user.email}</p>
            <p>Address: {detail.user.address}</p>
            <p>Role: {detail.user.role}</p>
            {detail.user.role === 'STORE_OWNER' && <p>Rating: {detail.rating ?? 'N/A'}</p>}
            <button onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
