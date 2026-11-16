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
  CheckCircle2, 
  Database, 
  Sparkles, 
  ArrowRight,
  Shield,
  Briefcase,
  UserCheck,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@talentbridge.io');
  const [password, setPassword] = useState('Admin@123');
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
    <div className="min-vh-100 d-flex flex-column flex-lg-row" style={{ backgroundColor: '#F8FAFC' }}>
      {/* LEFT SHOWCASE PANEL (Enterprise Deep Navy, Glassmorphic AI Intelligence Card) */}
      <div 
        className="col-12 col-lg-6 d-flex flex-column justify-content-between p-4 p-md-5 text-white position-relative overflow-hidden"
        style={{
          background: 'radial-gradient(130% 120% at 20% 15%, #0F253E 0%, #0B192C 45%, #050D1A 100%)',
          minHeight: '480px'
        }}
      >
        {/* Subtle Ambient Glow Mesh */}
        <div 
          className="position-absolute rounded-circle" 
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(0, 168, 150, 0.22) 0%, transparent 70%)',
            top: '-15%',
            right: '-10%',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }}
        />
        <div 
          className="position-absolute rounded-circle" 
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, transparent 70%)',
            bottom: '-10%',
            left: '-10%',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }}
        />

        {/* 1. Top Logo */}
        <div className="position-relative z-1">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none text-white">
            <div 
              className="p-2 rounded-3 text-white shadow-sm d-flex align-items-center justify-content-center"
              style={{ background: 'linear-gradient(135deg, #00A896 0%, #028090 100%)' }}
            >
              <Award size={22} color="#FFFFFF" />
            </div>
            <span className="fs-4 fw-bold tracking-tight">Talent<span style={{ color: '#00D2B4' }}>Bridge</span></span>
            <span 
              className="badge rounded-pill border px-2.5 py-1"
              style={{ 
                backgroundColor: 'rgba(0, 168, 150, 0.15)', 
                borderColor: 'rgba(0, 210, 180, 0.3)', 
                color: '#2DD4BF', 
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              <Sparkles size={11} className="me-1 d-inline" /> Decision Support AI
            </span>
          </Link>
        </div>

        {/* 2. Unified Middle Body (Headline + Subtitle + 3 Feature Highlights Grouped Together) */}
        <div className="position-relative z-1 my-auto py-3" style={{ maxWidth: '490px' }}>
          <h2 className="display-6 fw-bold lh-sm mb-2" style={{ letterSpacing: '-0.8px', fontSize: '28px' }}>
            Intelligent Screening & <span style={{ color: '#00D2B4' }}>Transparent Ranking</span>.
          </h2>
          <p className="text-light opacity-75 small mb-3.5" style={{ lineHeight: '1.6', fontSize: '13.5px' }}>
            Empowering talent teams with PyMuPDF resume parsing, verified technical skill extraction, and explainable 70% Skill Coverage & 30% TF-IDF Cosine Similarity.
          </p>

          {/* Grouped Feature Highlights */}
          <div className="d-flex flex-column gap-2.5">
            <div 
              className="p-3 rounded-3 d-flex align-items-center gap-3 border transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div 
                className="p-2 rounded-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'rgba(0, 210, 180, 0.15)', color: '#00D2B4', width: '36px', height: '36px' }}
              >
                <Zap size={17} />
              </div>
              <div>
                <div className="fw-semibold text-white small" style={{ fontSize: '13px' }}>
                  Deterministic 70/30 Explainable AI
                </div>
                <div className="text-light opacity-75 small" style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                  70% verified skill presence + 30% TF-IDF cosine semantic similarity with zero protected bias.
                </div>
              </div>
            </div>

            <div 
              className="p-3 rounded-3 d-flex align-items-center gap-3 border transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div 
                className="p-2 rounded-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', width: '36px', height: '36px' }}
              >
                <Sparkles size={17} />
              </div>
              <div>
                <div className="fw-semibold text-white small" style={{ fontSize: '13px' }}>
                  PyMuPDF Automated Resume Mining
                </div>
                <div className="text-light opacity-75 small" style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                  Sub-second text extraction and evidence-backed skill discovery from candidate PDF documents.
                </div>
              </div>
            </div>

            <div 
              className="p-3 rounded-3 d-flex align-items-center gap-3 border transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div 
                className="p-2 rounded-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', width: '36px', height: '36px' }}
              >
                <Shield size={17} />
              </div>
              <div>
                <div className="fw-semibold text-white small" style={{ fontSize: '13px' }}>
                  Full Compliance & Tamper-Evident Audit
                </div>
                <div className="text-light opacity-75 small" style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                  Immutable audit logs for stage transitions, CSV exports, and recruiter reviews on MongoDB Atlas.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Feature Pillars */}
        <div className="position-relative z-1 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <div className="row g-2 text-light opacity-90 small">
            <div className="col-4 d-flex align-items-center gap-2">
              <Zap size={15} style={{ color: '#00D2B4' }} />
              <span style={{ fontSize: '12px' }}>&lt; 0.45s Parsing</span>
            </div>
            <div className="col-4 d-flex align-items-center gap-2">
              <Shield size={15} style={{ color: '#00D2B4' }} />
              <span style={{ fontSize: '12px' }}>100% Unbiased</span>
            </div>
            <div className="col-4 d-flex align-items-center gap-2">
              <Database size={15} style={{ color: '#00D2B4' }} />
              <span style={{ fontSize: '12px' }}>MongoDB Atlas</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AUTHENTICATION PANEL (Clean Modern Portal Card) */}
      <div className="col-12 col-lg-6 d-flex flex-column justify-content-between p-4 p-md-5 bg-white">
        {/* Top Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link 
            to="/" 
            className="text-decoration-none text-secondary small fw-semibold d-inline-flex align-items-center gap-1.5 py-1.5 px-3 rounded-2 border bg-light transition-all"
            style={{ fontSize: '12.5px' }}
          >
            <ArrowLeft size={15} /> Back to Open Vacancies
          </Link>
        </div>

        {/* Central Sign-In Container */}
        <div className="mx-auto w-100 my-auto" style={{ maxWidth: '440px' }}>
          <div className="mb-4">
            <h3 className="fw-bolder text-dark mb-1" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>
              Recruiter Portal Sign In
            </h3>
            <p className="text-secondary small" style={{ fontSize: '13px' }}>
              Select your persona below to 1-click autofill or enter authorized credentials.
            </p>
          </div>

          {/* Quick Demo Persona Switcher (High Fidelity Segmented Cards) */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-muted d-block mb-2" style={{ fontSize: '12px' }}>
              Select Active Persona (1-Click Fill):
            </label>
            <div className="row g-2">
              {/* Admin Persona */}
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN', 'admin@talentbridge.io', 'Admin@123')}
                  className="btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center gap-1.5 transition-all text-center border"
                  style={{
                    backgroundColor: selectedRole === 'ADMIN' ? '#0B1528' : '#F8FAFC',
                    color: selectedRole === 'ADMIN' ? '#FFFFFF' : '#334155',
                    borderColor: selectedRole === 'ADMIN' ? '#0B1528' : '#E2E8F0',
                    boxShadow: selectedRole === 'ADMIN' ? '0 4px 12px rgba(11, 21, 40, 0.25)' : 'none',
                    fontSize: '12px',
                    fontWeight: selectedRole === 'ADMIN' ? 600 : 500
                  }}
                >
                  <Shield size={17} style={{ color: selectedRole === 'ADMIN' ? '#00D2B4' : '#64748B' }} />
                  <span>Admin</span>
                </button>
              </div>

              {/* Recruiter Persona */}
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('RECRUITER', 'recruiter@talentbridge.io', 'Recruiter@123')}
                  className="btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center gap-1.5 transition-all text-center border"
                  style={{
                    backgroundColor: selectedRole === 'RECRUITER' ? '#00A896' : '#F8FAFC',
                    color: selectedRole === 'RECRUITER' ? '#FFFFFF' : '#334155',
                    borderColor: selectedRole === 'RECRUITER' ? '#00A896' : '#E2E8F0',
                    boxShadow: selectedRole === 'RECRUITER' ? '0 4px 12px rgba(0, 168, 150, 0.3)' : 'none',
                    fontSize: '12px',
                    fontWeight: selectedRole === 'RECRUITER' ? 600 : 500
                  }}
                >
                  <Briefcase size={17} style={{ color: selectedRole === 'RECRUITER' ? '#FFFFFF' : '#64748B' }} />
                  <span>Recruiter</span>
                </button>
              </div>

              {/* Manager Persona */}
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('MANAGER', 'manager@talentbridge.com', 'Manager@12345')}
                  className="btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center gap-1.5 transition-all text-center border"
                  style={{
                    backgroundColor: selectedRole === 'MANAGER' ? '#2563EB' : '#F8FAFC',
                    color: selectedRole === 'MANAGER' ? '#FFFFFF' : '#334155',
                    borderColor: selectedRole === 'MANAGER' ? '#2563EB' : '#E2E8F0',
                    boxShadow: selectedRole === 'MANAGER' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                    fontSize: '12px',
                    fontWeight: selectedRole === 'MANAGER' ? 600 : 500
                  }}
                >
                  <UserCheck size={17} style={{ color: selectedRole === 'MANAGER' ? '#FFFFFF' : '#64748B' }} />
                  <span>Manager</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2.5 mb-3 rounded-3 border-danger shadow-xs">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark mb-1.5">Email Address</label>
              <div className="input-group shadow-xs">
                <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px', borderColor: '#CBD5E1' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 py-2.5"
                  style={{ borderRadius: '0 10px 10px 0', borderColor: '#CBD5E1', fontSize: '13.5px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@talentbridge.io"
                  required
                />
              </div>
            </div>

            <div className="mb-3.5">
              <div className="d-flex justify-content-between align-items-center mb-1.5">
                <label className="form-label small fw-semibold text-dark m-0">Password</label>
                <span className="badge rounded-pill bg-light text-secondary border px-2 py-0.5" style={{ fontSize: '10.5px' }}>
                  Pre-filled &bull; Ready to Sign In
                </span>
              </div>
              <div className="input-group shadow-xs">
                <span className="input-group-text bg-light border-end-0 text-muted" style={{ borderRadius: '10px 0 0 10px', borderColor: '#CBD5E1' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 py-2.5"
                  style={{ borderColor: '#CBD5E1', fontSize: '13.5px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-light text-muted border-start-0"
                  style={{ borderRadius: '0 10px 10px 0', borderColor: '#CBD5E1' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

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
              <span className="badge bg-light text-dark border px-2.5 py-1" style={{ fontSize: '11px' }}>
                Role: <strong style={{ color: '#00A896' }}>{selectedRole}</strong>
              </span>
            </div>

            <button
              type="submit"
              className="btn w-100 py-2.5 text-white fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #00A896 0%, #0D7B6E 100%)',
                borderRadius: '10px',
                fontSize: '14px',
                border: 'none',
                boxShadow: '0 4px 14px rgba(0, 168, 150, 0.35)'
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
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Direct Public Candidate Flow Link */}
          <div className="mt-4 p-3 rounded-3 border bg-light text-center">
            <div className="text-secondary small mb-1" style={{ fontSize: '12px' }}>
              Are you a job candidate applying for vacancies?
            </div>
            <Link 
              to="/" 
              className="fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
              style={{ color: '#00A896', fontSize: '12.5px' }}
            >
              Browse Open Roles & Submit Resume <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Bottom Trust & Security Footnote */}
        <div className="mt-4 pt-3 border-top text-center text-muted small" style={{ fontSize: '11px' }}>
          <span>🔒 256-bit JWT Encryption &bull; Role-Based Access Control &bull; TalentBridge Enterprise</span>
        </div>
      </div>
    </div>
  );
};
