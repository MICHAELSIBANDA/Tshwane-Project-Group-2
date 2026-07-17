import { NavLink, Outlet } from 'react-router-dom';
import { useAppState } from '../AppState';
import tshwaneLogo from '../../images/tshwane.gif';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/register', label: 'Register' },
  { to: '/login', label: 'Login' },
  { to: '/top-up', label: 'Top up' },
];

function SiteLayout() {
  const { access, handleLogout } = useAppState();
  const isLoggedIn = access.loggedIn && access.user;

  return (
    <div className="shell">
      <div className="backdrop backdrop-left" />
      <div className="backdrop backdrop-right" />

      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src={tshwaneLogo} alt="" aria-hidden="true" />
          <div>
            <p className="eyebrow">A Re Yeng/Tshwane Bus Service</p>
            <h1>Tshwane Bus Services</h1>
          </div>
        </div>
        <nav className="topbar-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-chip">
          <span className="chip-dot" />
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>{access.user.name}</span>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            'Client self-service portal'
          )}
        </div>
      </header>

      <main className="layout">
        <Outlet />
      </main>
    </div>
  );
}

export default SiteLayout;
