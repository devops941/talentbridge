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
  LogOut 
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
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* Sidebar Navigation */}
      <div className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '260px', flexShrink: 0 }}>
        <div className="d-flex align-items-center gap-2 mb-4 px-2">
          <Award size={28} className="text-info" />
          <h4 className="m-0 fw-bold tracking-wide" style={{ color: '#14B8A6' }}>TalentBridge</h4>
        </div>
        <div className="small text-uppercase text-muted px-2 mb-2 fw-semibold">Navigation</div>
        <nav className="nav flex-column gap-1 flex-grow-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 text-decoration-none ${
                  active ? 'bg-primary text-white fw-semibold' : 'text-secondary hover-white'
                }`}
                style={{ transition: 'all 0.2s' }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-top border-secondary pt-3 px-2">
          <div className="fw-medium text-light mb-0">{user?.name || 'Recruiter'}</div>
          <div className="small text-muted mb-2">{user?.role}</div>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
          <div>
            <h5 className="m-0 fw-bold text-dark">Intelligent Candidate Screening & Ranking</h5>
            <small className="text-muted">Explainable AI Recruitment Decision Support</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
              ● System Active
            </span>
          </div>
        </header>
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

