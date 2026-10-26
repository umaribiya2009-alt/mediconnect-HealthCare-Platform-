import { Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export function Logo() {
  return (
    <div className="brand">
      <svg width="42" height="42" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="12" fill="#0b2a4a" />
        <path d="M20 10h8v10h10v8H28v10h-8V28H10v-8h10z" fill="#3b9aee" />
      </svg>
      <div>
        <div className="brand-name">Medi<span>Connect</span></div>
        <div className="brand-tag">Your healthcare, connected</div>
      </div>
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <Logo />
      {user && (
        <nav className="header-right">
          <Link className="nav-link" to="/">Dashboard</Link>
          <span className="user-chip">{user.name}</span>
          <button className="btn btn-light btn-small" onClick={logout}>Log out</button>
        </nav>
      )}
    </header>
  );
}
