import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileUp, 
  Award, 
  GitBranch, 
  BarChart3, 
  LogOut,
  Home as HomeIcon,
  Database
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Job Openings', icon: Briefcase },
    { to: '/candidates', label: 'Candidates', icon: Users },
    { to: '/resumes', label: 'Upload Resume', icon: FileUp },
    { to: '/matching', label: 'Matching & Rank', icon: Award },
    { to: '/pipeline', label: 'Pipeline Board', icon: GitBranch },
    { to: '/reports', label: 'Reports & Audit', icon: BarChart3 },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Sidebar */}
      <div 
        className="bg-dark text-white p-3 d-flex flex-column shadow" 
        style={{ width: '260px', flexShrink: 0, backgroundColor: '#0F172A' }}
      >
        {/* Brand */}
        <div className="d-flex align-items-center gap-2 mb-4 px-2 pt-2">
          <div className="p-2 rounded-3 bg-gradient-teal text-white shadow-sm d-flex align-items-center justify-content-center">
            <Award size={20} />
          </div>
          <div>
            <h5 className="m-0 fw-bold tracking-wide text-white">Talent<span className="text-teal">Bridge</span></h5>
            <div className="text-secondary" style={{ fontSize: '10px' }}>AI Decision Support</div>
          </div>
        </div>

        {/* Quick link to Landing / Home Page */}
        <div className="px-2 mb-3">
          <Link 
            to="/" 
            className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none"
            style={{ fontSize: '12px' }}
          >
            <HomeIcon size={14} /> Product Overview
          </Link>
        </div>

        <div className="small text-uppercase text-muted px-2 mb-2 fw-semibold" style={{ fontSize: '10px' }}>
          Portal Navigation
        </div>

        <nav className="nav flex-column gap-1 flex-grow-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 text-decoration-none transition-all ${
                  active 
                    ? 'bg-gradient-teal text-white fw-bold shadow-sm' 
                    : 'text-secondary hover-white'
                }`}
                style={{ fontSize: '13px' }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="border-top border-secondary pt-3 px-2 mt-auto">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="rounded-circle bg-teal text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="fw-semibold text-white text-truncate small m-0">{user?.name || 'Recruiter'}</div>
              <div className="text-muted" style={{ fontSize: '10px' }}>{user?.role}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-1.5"
            style={{ fontSize: '12px' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        {/* Top Navbar */}
        <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
          <div>
            <h5 className="m-0 fw-bold text-dark">Candidate Screening & Ranking Platform</h5>
            <small className="text-secondary">Explainable AI • PyMuPDF • spaCy • Scikit-learn TF-IDF</small>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-sm-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-light border small">
              <Database size={14} className="text-success" />
              <span className="text-secondary">MongoDB Atlas: <strong>TalentBridge</strong></span>
            </div>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
              ● Live Cluster0
            </span>
          </div>
        </header>

        {/* Routed View */}
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
