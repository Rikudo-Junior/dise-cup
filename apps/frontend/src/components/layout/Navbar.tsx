import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Star, BarChart2, Clock, BookOpen, Shield, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';

const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#0891b2'];
const avatarBg = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { to: '/',         label: 'Accueil',    icon: Home },
    { to: '/matches',  label: 'Pronostics', icon: Star },
    { to: '/rankings', label: 'Classement', icon: BarChart2 },
    { to: '/profile',  label: 'Historique', icon: Clock },
    { to: '/guide',    label: 'Guide',      icon: BookOpen, disabled: true },
  ];

  const navLinks = links.filter(l => !l.disabled);

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
          <img src="/logo-ise.png" alt="2ALSY" className="brand-logo-img" />
          <div>
            <div className="brand-text"><span style={{ color: 'var(--primary)' }}>2ALSY</span> CUP</div>
            <div className="brand-sub">COUPE DU MONDE 2026</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links">
          {links.map(({ to, label, icon: Icon, disabled }) =>
            disabled ? (
              <span key={to} className="nav-link nav-link-disabled"><Icon size={15} /> {label}</span>
            ) : (
              <Link key={to} to={to} className={`nav-link ${pathname === to ? 'active' : ''}`}>
                <Icon size={15} /> {label}
              </Link>
            )
          )}
          {isAdmin() && (
            <Link to="/admin" className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}>
              <Shield size={15} /> Admin
            </Link>
          )}
        </div>

        {/* Right: user chip + icons */}
        <div className="navbar-user">
          {user && (
            <>
              <div className="user-chip">
                <div className="user-chip-avatar" style={{ background: avatarBg(user.username) }}>
                  {user.username[0].toUpperCase()}
                </div>
                <span className="user-chip-name">{user.username}</span>
                <span className="user-chip-promo">{user.promotion}</span>
                <span className="user-chip-pts">{user.totalPoints} pts</span>
              </div>
              <Link to="/profile" className="btn-icon" title="Profil" style={{ textDecoration: 'none' }}>
                <User size={17} />
              </Link>
              <button onClick={handleLogout} className="btn-icon" title="Déconnexion">
                <LogOut size={17} />
              </button>
            </>
          )}
          {/* Mobile hamburger */}
          <button className="btn-icon mobile-menu-btn" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            {user && (
              <div className="mobile-menu-user">
                <div className="mobile-menu-avatar" style={{ background: avatarBg(user.username) }}>
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="mobile-menu-username">{user.username}</div>
                  <div className="mobile-menu-sub">{user.promotion} · {user.totalPoints} pts</div>
                </div>
              </div>
            )}
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={`mobile-menu-link ${pathname === to ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}>
                <Icon size={18} /> {label}
              </Link>
            ))}
            {isAdmin() && (
              <Link to="/admin" className={`mobile-menu-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}>
                <Shield size={18} /> Admin
              </Link>
            )}
            <button className="mobile-menu-logout" onClick={handleLogout}>
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className={`mobile-nav-item ${pathname === to ? 'active' : ''}`}>
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
