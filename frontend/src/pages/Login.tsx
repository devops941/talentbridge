import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { 
  Lock, 
  Mail, 
  Award, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Database, 
  Sparkles, 
  ArrowRight,
  Shield,
  Briefcase,
  UserCheck,
  Zap,
  ChevronRight,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@talentbridge.com');
  const [password, setPassword] = useState('Admin@12345');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'RECRUITER' | 'MANAGER'>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, {
        id: res.data.user_id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: 'ADMIN' | 'RECRUITER' | 'MANAGER', roleEmail: string, rolePwd: string) => {
    setSelectedRole(role);
    setEmail(roleEmail);
    setPassword(rolePwd);
    setError(null);
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column justify-content-between position-relative overflow-x-hidden"
      style={{
        backgroundColor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(0, 168, 150, 0.04) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.04) 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, rgba(241, 245, 249, 0.8) 0%, transparent 100%)
        `,
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Subtle Dot Matrix Grid in Background */}
      <div 
        className="position-absolute w-100 h-100 top-0 start-0 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.45,
          zIndex: 0
        }}
      />

      {/* TOP CLEAN FLOATING NAVBAR */}
      <header className="position-relative w-100 px-3 px-md-5 py-3 z-2">
        <div className="container-fluid d-flex justify-content-between align-items-center p-0" style={{ maxWidth: '1200px' }}>
          {/* Brand Logo */}
          <Link to="/" className="d-inline-flex align-items-center gap-2.5 text-decoration-none">
            <div 
              className="p-2 rounded-3 text-white shadow-sm d-flex align-items-center justify-content-center"
              style={{ background: 'linear-gradient(135deg, #00A896 0%, #028090 100%)' }}
            >
              <Award size={22} color="#FFFFFF" />
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="fs-4 fw-bold tracking-tight text-dark">
                Talent<span style={{ color: '#00A896' }}>Bridge</span>
              </span>
              <span 
                className="badge rounded-pill border d-none d-sm-inline-flex align-items-center gap-1 px-2.5 py-1"
                style={{ 
                  backgroundColor: '#E6FFFA', 
                  borderColor: '#B2F5EA', 
                  color: '#0D9488', 
                  fontSize: '11px',
                  fontWeight: 600
                }}
              >
                <Sparkles size={11} /> Decision Support AI
              </span>
            </div>
          </Link>

          {/* Right Action */}
          <Link 
            to="/" 
            className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-2 py-2 px-3.5 rounded-pill shadow-xs transition-all"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderColor: '#E2E8F0',
              borderWidth: '1px',
              borderStyle: 'solid',
              color: '#475569',
              fontSize: '13px'
            }}
          >
            <ArrowLeft size={14} /> Back to Open Vacancies
          </Link>
        </div>
      </header>

      {/* CENTRAL AUTHENTICATION CARD */}
      <main className="container position-relative z-2 my-auto py-4 px-3" style={{ maxWidth: '490px' }}>
        <div 
          className="bg-white rounded-4 p-4 p-sm-5 position-relative"
          style={{
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.04)'
          }}
        >
          {/* Top Subtle Teal Brand Stripe */}
          <div 
            className="position-absolute top-0 start-0 w-100 rounded-top-4" 
            style={{ 
              height: '4px', 
              background: 'linear-gradient(90deg, #00A896 0%, #00D2B4 50%, #3B82F6 100%)' 
            }} 
          />

          {/* Card Header */}
          <div className="text-center mb-4 pt-1">
            <div 
              className="d-inline-flex align-items-center justify-content-center p-2.5 rounded-circle mb-2.5 shadow-xs"
              style={{
                backgroundColor: '#F0FDFA',
                border: '1px solid #CCFBF1',
                color: '#00A896'
              }}
            >
              <Cpu size={24} />
            </div>
            <h2 className="fw-bold mb-1 text-dark" style={{ fontSize: '23px', letterSpacing: '-0.4px' }}>
              Recruiter Portal Sign In
            </h2>
            <p className="text-secondary small mb-0" style={{ fontSize: '13px' }}>
              Deterministic 70/30 Candidate Screening & Transparent Ranking
            </p>
          </div>

          {/* 1-Click Role Switcher */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="small fw-semibold text-secondary mb-0" style={{ fontSize: '12px' }}>
                Select Active Persona (1-Click Fill):
              </label>
              <span 
                className="badge rounded-pill border px-2 py-0.5" 
                style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#64748B', fontSize: '10.5px' }}
              >
                Auto-Fills Form
              </span>
            </div>
            <div className="row g-2">
              {/* Admin Persona */}
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN', 'admin@talentbridge.com', 'Admin@12345')}
                  className="btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center gap-1.5 transition-all text-center position-relative"
                  style={{
                    backgroundColor: selectedRole === 'ADMIN' ? '#0F172A' : '#F8FAFC',
                    color: selectedRole === 'ADMIN' ? '#FFFFFF' : '#334155',
                    border: selectedRole === 'ADMIN' ? '1px solid #0F172A' : '1px solid #E2E8F0',
                    boxShadow: selectedRole === 'ADMIN' ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'none',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <Shield size={17} color={selectedRole === 'ADMIN' ? '#00D2B4' : '#64748B'} />
                  <span>Admin</span>
                  {selectedRole === 'ADMIN' && (
                    <span 
                      className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-success p-1"
                      style={{ fontSize: '9px' }}
                    >
                      <CheckCircle2 size={10} />
                    </span>
                  )}
                </button>
              </div>

              {/* Recruiter Persona */}
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('RECRUITER', 'recruiter@talentbridge.com', 'Recruiter@12345')}
                  className="btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center gap-1.5 transition-all text-center position-relative"
                  style={{
                    backgroundColor: selectedRole === 'RECRUITER' ? '#00A896' : '#F8FAFC',
                    color: selectedRole === 'RECRUITER' ? '#FFFFFF' : '#334155',
                    border: selectedRole === 'RECRUITER' ? '1px solid #00A896' : '1px solid #E2E8F0',
                    boxShadow: selectedRole === 'RECRUITER' ? '0 4px 12px rgba(0, 168, 150, 0.25)' : 'none',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <Briefcase size={17} color={selectedRole === 'RECRUITER' ? '#FFFFFF' : '#64748B'} />
                  <span>Recruiter</span>
                  {selectedRole === 'RECRUITER' && (
                    <span 
                      className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-dark p-1"
                      style={{ fontSize: '9px' }}
                    >
                      <CheckCircle2 size={10} />
                    </span>
                  )}
                </button>
              </div>

              {/* Manager Persona */}
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('MANAGER', 'manager@talentbridge.com', 'Manager@12345')}
                  className="btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center gap-1.5 transition-all text-center position-relative"
                  style={{
                    backgroundColor: selectedRole === 'MANAGER' ? '#2563EB' : '#F8FAFC',
                    color: selectedRole === 'MANAGER' ? '#FFFFFF' : '#334155',
                    border: selectedRole === 'MANAGER' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    boxShadow: selectedRole === 'MANAGER' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <UserCheck size={17} color={selectedRole === 'MANAGER' ? '#FFFFFF' : '#64748B'} />
                  <span>Manager</span>
                  {selectedRole === 'MANAGER' && (
                    <span 
                      className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-dark p-1"
                      style={{ fontSize: '9px' }}
                    >
                      <CheckCircle2 size={10} />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2.5 mb-3 rounded-3 border-danger shadow-xs">
              <AlertCircle size={17} className="flex-shrink-0 text-danger" />
              <span style={{ fontSize: '12.5px' }}>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            {/* Email Address */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark mb-1.5" style={{ fontSize: '13px' }}>
                Email Address
              </label>
              <div className="input-group">
                <span 
                  className="input-group-text border-end-0 text-muted" 
                  style={{ 
                    backgroundColor: '#F8FAFC', 
                    borderColor: '#CBD5E1',
                    borderRadius: '10px 0 0 10px' 
                  }}
                >
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 py-2.5 text-dark"
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#CBD5E1',
                    borderRadius: '0 10px 10px 0', 
                    fontSize: '13.5px' 
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@talentbridge.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3.5">
              <div className="d-flex justify-content-between align-items-center mb-1.5">
                <label className="form-label small fw-semibold text-dark m-0" style={{ fontSize: '13px' }}>
                  Password
                </label>
                <span 
                  className="badge rounded-pill border px-2 py-0.5" 
                  style={{ 
                    fontSize: '10.5px', 
                    backgroundColor: '#F0FDFA', 
                    borderColor: '#CCFBF1', 
                    color: '#0D9488' 
                  }}
                >
                  Pre-filled &bull; Ready to Sign In
                </span>
              </div>
              <div className="input-group">
                <span 
                  className="input-group-text border-end-0 text-muted" 
                  style={{ 
                    backgroundColor: '#F8FAFC', 
                    borderColor: '#CBD5E1',
                    borderRadius: '10px 0 0 10px' 
                  }}
                >
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 py-2.5 text-dark"
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#CBD5E1',
                    fontSize: '13.5px' 
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="input-group-text border-start-0 text-muted"
                  style={{ 
                    backgroundColor: '#F8FAFC', 
                    borderColor: '#CBD5E1',
                    borderRadius: '0 10px 10px 0' 
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Current Role */}
            <div className="d-flex justify-content-between align-items-center mb-4 small">
              <div className="form-check d-flex align-items-center gap-1.5">
                <input
                  type="checkbox"
                  className="form-check-input mt-0"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label text-secondary cursor-pointer" htmlFor="rememberMe" style={{ fontSize: '12.5px' }}>
                  Remember session
                </label>
              </div>
              <span 
                className="badge border px-2.5 py-1"
                style={{ 
                  backgroundColor: '#F8FAFC', 
                  borderColor: '#E2E8F0',
                  fontSize: '11px',
                  color: '#475569'
                }}
              >
                Role: <strong style={{ color: '#00A896' }}>{selectedRole}</strong>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn w-100 py-2.5 text-white fw-bold d-flex align-items-center justify-content-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, #00A896 0%, #028090 100%)',
                borderRadius: '10px',
                fontSize: '14.5px',
                border: 'none',
                boxShadow: '0 6px 18px rgba(0, 168, 150, 0.3)'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Recruiter Portal</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Candidate Portal Switcher */}
          <div 
            className="mt-4 p-3 rounded-3 text-center border"
            style={{
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0'
            }}
          >
            <div className="text-secondary small mb-1" style={{ fontSize: '12px' }}>
              Are you a job applicant submitting your resume?
            </div>
            <Link 
              to="/" 
              className="fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
              style={{ color: '#00A896', fontSize: '12.5px' }}
            >
              Browse Open Roles & Apply <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      {/* BOTTOM FEATURE CARDS DOCK (Horizontal Enterprise Capabilities) */}
      <footer className="position-relative w-100 px-3 px-md-5 py-4 z-2">
        <div className="container-fluid p-0" style={{ maxWidth: '1200px' }}>
          {/* 4 Feature Pill Cards on Light Background */}
          <div className="row g-3 justify-content-center mb-3">
            <div className="col-12 col-sm-6 col-md-3">
              <div 
                className="p-3 rounded-3 d-flex align-items-center gap-2.5 bg-white border shadow-xs"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div 
                  className="p-2 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ backgroundColor: '#F0FDFA', color: '#00A896', width: '36px', height: '36px' }}
                >
                  <Zap size={18} />
                </div>
                <div className="text-truncate">
                  <div className="text-dark fw-bold small" style={{ fontSize: '12.5px' }}>&lt; 0.45s PyMuPDF</div>
                  <div className="text-muted small" style={{ fontSize: '11px' }}>Sub-second text extraction</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div 
                className="p-3 rounded-3 d-flex align-items-center gap-2.5 bg-white border shadow-xs"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div 
                  className="p-2 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ backgroundColor: '#EFF6FF', color: '#3B82F6', width: '36px', height: '36px' }}
                >
                  <Sparkles size={18} />
                </div>
                <div className="text-truncate">
                  <div className="text-dark fw-bold small" style={{ fontSize: '12.5px' }}>70/30 Explainable AI</div>
                  <div className="text-muted small" style={{ fontSize: '11px' }}>70% Skills + 30% TF-IDF Cosine</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div 
                className="p-3 rounded-3 d-flex align-items-center gap-2.5 bg-white border shadow-xs"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div 
                  className="p-2 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ backgroundColor: '#F0FDF4', color: '#16A34A', width: '36px', height: '36px' }}
                >
                  <Shield size={18} />
                </div>
                <div className="text-truncate">
                  <div className="text-dark fw-bold small" style={{ fontSize: '12.5px' }}>100% Unbiased & Audited</div>
                  <div className="text-muted small" style={{ fontSize: '11px' }}>Zero demographic bias</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div 
                className="p-3 rounded-3 d-flex align-items-center gap-2.5 bg-white border shadow-xs"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div 
                  className="p-2 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ backgroundColor: '#FAF5FF', color: '#9333EA', width: '36px', height: '36px' }}
                >
                  <Database size={18} />
                </div>
                <div className="text-truncate">
                  <div className="text-dark fw-bold small" style={{ fontSize: '12.5px' }}>MongoDB Atlas</div>
                  <div className="text-muted small" style={{ fontSize: '11px' }}>Encrypted cloud database</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Footnote */}
          <div className="text-center text-muted small" style={{ fontSize: '11.5px' }}>
            <span>🔒 256-bit JWT Encryption &bull; Role-Based Access Control (RBAC) &bull; TalentBridge Enterprise v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
