import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

/**
 * Main layout component with navigation
 */
export default function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-brand">
          <span className="header-logo">📚</span>
          <h1 className="header-title">ClassCount</h1>
        </div>
        <nav className="nav">
          <Link to="/teacher" className="nav-link">
            Record Attendance
          </Link>
          <Link to="/schools" className="nav-link">
            Manage Schools
          </Link>
          <Link to="/admin" className="nav-link">
            Dashboard
          </Link>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

