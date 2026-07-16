import { NavLink, Outlet } from 'react-router-dom';
import tshwaneLogo from '../../images/tshwane.gif';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/register', label: 'Register' },
  { to: '/login', label: 'Login' },
  { to: '/top-up', label: 'Top up' },
];

function SiteLayout() {
  return (
    <div className="shell">
      <div className="backdrop backdrop-left" />
      <div className="backdrop backdrop-right" />

      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src={tshwaneLogo} alt="" aria-hidden="true" />
          <div>
            <p className="eyebrow">A Re Yeng inspired palette</p>
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
          Client self-service portal
        </div>
      </header>

      <main className="layout">
        <Outlet />
      </main>
    </div>
  );
}

export default SiteLayout;
