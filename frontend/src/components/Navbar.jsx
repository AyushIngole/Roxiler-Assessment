import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  const homeByRole = {
    ADMIN: '/admin',
    USER: '/stores',
    STORE_OWNER: '/store-owner',
  };

  return (
    <nav className="navbar">
      <Link to={homeByRole[user.role]} className="brand">
        Store Ratings
      </Link>
      <div className="nav-links">
        <span className="nav-user">
          {user.name} ({user.role})
        </span>
        <Link to="/update-password">Update Password</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
