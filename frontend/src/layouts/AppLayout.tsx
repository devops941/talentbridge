import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Award, 
  GitBranch, 
  PieChart, 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Cpu, 
  CheckCircle2,
  Home as HomeIcon,
  User
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Only the actual existing functional modules in TalentBridge
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Job Vacancies', icon: Briefcase },
    { to: '/candidates', label: 'Candidates', icon: Users },
    { to: '/resumes', label: 'Resume Screening', icon: FileText },
    { to: '/matching', label: 'AI Match & Ranking', icon: Award },
    { to: '/pipeline', label: 'Pipeline Board', icon: GitBranch },
    { to: '/reports', label: 'Reports & Analytics', icon: PieChart },
  ];

  // Helper to determine active page title
  const getPageTitle = () => {
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard';
    if (location.pathname.startsWith('/jobs')) return 'Job Vacancies';
    if (location.pathname.startsWith('/candidates')) return 'Candidates Directory';
    if (location.pathname.startsWith('/resumes')) return 'Resume Screening & Parsing';
    if (location.pathname.startsWith('/matching')) return 'AI Match & Ranking';
    if (location.pathname.startsWith('/pipeline')) return 'Pipeline Board';
    if (location.pathname.startsWith('/reports')) return 'Reports & Analytics Audit';
    return 'Dashboard';
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F4F7FB' }}>
      {/* Dark Navy Sidebar */}
      <aside className="tb-sidebar p-3 d-flex flex-column" style={{ minWidth: '255px', maxWidth: '255px' }}>
        {/* Brand Header with Stylized Teal 'T' Logo */}
        <div className="d-flex align-items-center gap-2 mb-4 px-2 pt-2">
          <div 
            className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
            style={{ 
              width: '38px', 
              height: '38px', 
              background: 'linear-gradient(135deg, #00D2B4 0%, #00A896 100%)',
              color: '#FFFFFF' 
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M12 6V20M8 10L12 6L16 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h5 className="m-0 fw-bold text-white tracking-wide" style={{ fontSize: '18px', letterSpacing: '-0.3px' }}>
              Talent<span style={{ color: '#00D2B4' }}>Bridge</span>
            </h5>
            <div style={{ color: '#94A3B8', fontSize: '10.5px', fontWeight: 500 }}>
              AI Recruitment Platform
            </div>
          </div>
        </div>

        {/* Quick Link to Landing Page */}
        <div className="px-1 mb-3">
          <Link
            to="/"
            className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none border-0"
            style={{
              backgroundColor: '#16243D',
              color: '#94A3B8',
              fontSize: '11.5px',
              borderRadius: '8px',
              padding: '7px 12px'
            }}
          >
            <HomeIcon size={13} /> Product Overview
          </Link>
        </div>

        {/* Primary Navigation List - Only Real Existing Modules */}
        <nav className="nav flex-column gap-1 flex-grow-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`tb-nav-link ${active ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: AI Candidate Screening Card + User Profile with Logout */}
        <div className="mt-auto pt-3 d-flex flex-column gap-2">
          {/* Bottom AI-Powered Screening Card Widget */}
          <div 
            className="p-3 rounded-4 position-relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #0E2B38 0%, #091D26 100%)',
              border: '1px solid rgba(0, 210, 180, 0.22)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <div 
                className="rounded-2 p-1.5 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'rgba(0, 210, 180, 0.2)', color: '#00D2B4' }}
              >
                <Cpu size={15} />
              </div>
              <div className="text-white fw-bold" style={{ fontSize: '11.5px' }}>
                AI Candidate Screening
              </div>
            </div>
            <div className="d-flex flex-column gap-1 text-light" style={{ fontSize: '10.5px', opacity: 0.9 }}>
              <div className="d-flex align-items-center gap-1.5">
                <CheckCircle2 size={12} color="#00D2B4" />
                <span>PyMuPDF Text Parsing</span>
              </div>
              <div className="d-flex align-items-center gap-1.5">
                <CheckCircle2 size={12} color="#00D2B4" />
                <span>70% Skill Coverage NLP</span>
              </div>
              <div className="d-flex align-items-center gap-1.5">
                <CheckCircle2 size={12} color="#00D2B4" />
                <span>30% TF-IDF Cosine Match</span>
              </div>
            </div>
          </div>

          {/* User Profile & Logout Footer */}
          <div 
            className="p-2.5 rounded-4 d-flex flex-column gap-2"
            style={{
              backgroundColor: '#111E33',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #00A896 0%, #028090 100%)',
                    fontSize: '13px'
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="overflow-hidden text-start">
                  <div className="text-white fw-semibold text-truncate" style={{ fontSize: '12px' }}>
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-truncate" style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                    {user?.email || 'admin@talentbridge.io'}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-sm d-flex align-items-center justify-content-center gap-2 w-100 rounded-3 py-1.5 fw-semibold transition-all"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.14)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EF4444';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.14)';
                e.currentTarget.style.color = '#F87171';
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
        {/* Top Navbar */}
        <header className="tb-topbar">
          <div>
            <h4 className="m-0 fw-bold text-dark" style={{ fontSize: '20px', letterSpacing: '-0.3px' }}>
              {getPageTitle()}
            </h4>
            <div className="text-muted" style={{ fontSize: '12px' }}>
              Welcome back! Here's your real-time recruitment overview.
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Search Bar with rounded pill */}
            <div className="tb-search-box d-none d-md-flex">
              <Search size={16} className="text-muted" />
              <input
                type="text"
                className="tb-search-input"
                placeholder="Search candidates, jobs, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* User Profile Avatar with dropdown */}
            <div className="position-relative">
              <div 
                className="d-flex align-items-center gap-2.5 p-1 rounded-3 cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs flex-shrink-0"
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    backgroundColor: '#0B1528', 
                    border: '1.5px solid #00A896',
                    color: '#00D2B4'
                  }}
                >
                  <User size={18} />
                </div>
                <div className="d-none d-sm-block text-start">
                  <div className="fw-bold text-dark small m-0 leading-tight">
                    {user?.name || 'System Administrator'}
                  </div>
                  <div className="fw-semibold" style={{ fontSize: '10.5px', color: '#00A896' }}>
                    {user?.role ? user.role.toUpperCase() : 'ADMIN'}
                  </div>
                </div>
                <ChevronDown size={14} className="text-muted" />
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div 
                  className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2"
                  style={{ width: '180px', zIndex: 1060 }}
                >
                  <div className="px-3 py-1.5 border-bottom mb-1">
                    <div className="fw-semibold text-dark small">{user?.email || 'admin@talentbridge.com'}</div>
                    <div className="text-muted" style={{ fontSize: '10px' }}>Role: {user?.role || 'Admin'}</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-sm btn-link text-danger w-100 d-flex align-items-center gap-2 px-3 py-1 text-decoration-none"
                    style={{ fontSize: '12.5px' }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Outlet Canvas */}
        <main className="flex-grow-1 overflow-auto p-4" style={{ backgroundColor: '#F4F7FB' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
