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
  Cpu,
  BarChart2
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
    <div className="min-vh-100 d-flex flex-column flex-lg-row bg-white">
      {/* LEFT SHOWCASE PANEL (Branding, App Preview & Value Props) */}
      <div 
        className="col-12 col-lg-6 d-flex flex-column justify-content-between p-4 p-md-5 text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #091E28 0%, #064E3B 50%, #0F766E 100%)',
          minHeight: '400px'
        }}
      >
        {/* Subtle Decorative Background Circles */}
        <div 
          className="position-absolute rounded-circle" 
          style={{
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
            top: '-10%',
            right: '-10%',
            pointerEvents: 'none'
          }}
        />
        <div 
          className="position-absolute rounded-circle" 
          style={{
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
            bottom: '-5%',
            left: '-5%',
            pointerEvents: 'none'
          }}
        />

        {/* Top Header */}
        <div className="position-relative z-1">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none text-white mb-4">
            <div className="p-2 rounded-3 bg-white text-teal shadow-sm d-flex align-items-center justify-content-center">
              <Award size={22} color="#0D9488" />
            </div>
            <span className="fs-4 fw-bold tracking-tight">Talent<span style={{ color: '#2DD4BF' }}>Bridge</span></span>
            <span className="badge rounded-pill bg-dark-subtle text-teal border border-teal-subtle px-2.5 py-1 small" style={{ fontSize: '10px' }}>
              Decision Support AI
            </span>
          </Link>
          <h2 className="display-6 fw-bold lh-sm mb-3">
            Intelligent Screening & Transparent Candidate Ranking.
          </h2>
          <p className="text-light opacity-75 small mb-4" style={{ maxWidth: '480px', lineHeight: '1.6' }}>
            Empowering HR recruiters with PyMuPDF resume parsing, spaCy skill extraction, and explainable 70/30 suitability scoring backed by MongoDB Atlas.
          </p>
        </div>

        {/* Middle Interactive App Preview Card */}
        <div className="position-relative z-1 my-3 my-lg-4">
          <div 
            className="p-3.5 p-md-4 rounded-4 shadow-lg text-dark"
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              maxWidth: '480px'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2.5 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="p-1.5 rounded-circle bg-success" style={{ width: '8px', height: '8px' }}></span>
                <span className="fw-bold small text-secondary">Live Candidate Match Preview</span>
              </div>
              <span className="badge bg-success-subtle text-success fw-bold">Rank #1 • 78.9% Match</span>
            </div>

            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="fw-bold text-dark m-0">John Doe</h6>
                <small className="text-muted">Python Backend Vacancy</small>
              </div>
              <div className="text-end">
                <span className="badge bg-light text-dark border">Interview Scheduled</span>
              </div>
            </div>

            {/* Micro Breakdown Bar */}
            <div className="bg-light p-2.5 rounded-3 mb-2.5">
              <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ fontSize: '11px' }}>
                <span className="text-teal" style={{ color: '#0F766E' }}>Skill Coverage (70%): <strong>100%</strong></span>
                <span className="text-primary">TF-IDF Sim (30%): <strong>29.6%</strong></span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div className="progress-bar bg-teal" style={{ width: '78.9%', backgroundColor: '#0D9488' }}></div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-1">
              <span className="badge bg-success" style={{ fontSize: '10px' }}>✓ Python</span>
              <span className="badge bg-success" style={{ fontSize: '10px' }}>✓ FastAPI</span>
              <span className="badge bg-success" style={{ fontSize: '10px' }}>✓ PostgreSQL</span>
              <span className="badge bg-success" style={{ fontSize: '10px' }}>✓ REST API</span>
              <span className="badge bg-info text-dark" style={{ fontSize: '10px' }}>★ Docker</span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Pillars */}
        <div className="position-relative z-1 pt-3 border-top border-light border-opacity-25">
          <div className="row g-2 text-light opacity-90 small">
            <div className="col-4 d-flex align-items-center gap-1.5">
              <CheckCircle2 size={15} style={{ color: '#2DD4BF' }} />
              <span style={{ fontSize: '12px' }}>Zero AI Bias</span>
            </div>
            <div className="col-4 d-flex align-items-center gap-1.5">
              <Database size={15} style={{ color: '#2DD4BF' }} />
              <span style={{ fontSize: '12px' }}>Atlas Cloud</span>
            </div>
            <div className="col-4 d-flex align-items-center gap-1.5">
              <Sparkles size={15} style={{ color: '#2DD4BF' }} />
              <span style={{ fontSize: '12px' }}>Explainable</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AUTHENTICATION PANEL */}
      <div className="col-12 col-lg-6 d-flex flex-column justify-content-between p-4 p-md-5 bg-white">
        {/* Top Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link 
            to="/" 
            className="text-decoration-none text-secondary small fw-semibold d-inline-flex align-items-center gap-1.5 py-1 px-2 rounded-2 hover-bg-light"
          >
            <ArrowLeft size={16} /> Back to Overview
          </Link>
          <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: '12px' }}>
            <span className="p-1 rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></span>
            MongoDB Atlas Online
          </div>
        </div>

        {/* Form Container */}
        <div className="mx-auto w-100 my-auto" style={{ maxWidth: '420px' }}>
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Recruiter Portal Sign In</h3>
            <p className="text-secondary small">
              Select your persona or enter your authorized credentials.
            </p>
          </div>

          {/* Quick Persona Switcher */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-muted d-block mb-2" style={{ fontSize: '12px' }}>
              Select Demo Role (1-Click Fill):
            </label>
            <div className="row g-2">
              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN', 'admin@talentbridge.com', 'Admin@12345')}
                  className={`btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center gap-1 transition-all ${
                    selectedRole === 'ADMIN'
                      ? 'btn-dark text-white fw-bold shadow-sm'
                      : 'btn-outline-light text-dark border bg-light'
                  }`}
                  style={{ fontSize: '12px' }}
                >
                  <Shield size={18} />
                  <span>Admin</span>
                </button>
              </div>

              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('RECRUITER', 'recruiter@talentbridge.com', 'Recruiter@12345')}
                  className={`btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center gap-1 transition-all ${
                    selectedRole === 'RECRUITER'
                      ? 'btn-teal text-white fw-bold shadow-sm'
                      : 'btn-outline-light text-dark border bg-light'
                  }`}
                  style={{ fontSize: '12px' }}
                >
                  <Briefcase size={18} />
                  <span>Recruiter</span>
                </button>
              </div>

              <div className="col-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('MANAGER', 'manager@talentbridge.com', 'Manager@12345')}
                  className={`btn w-100 p-2.5 rounded-3 d-flex flex-column align-items-center gap-1 transition-all ${
                    selectedRole === 'MANAGER'
                      ? 'btn-primary text-white fw-bold shadow-sm'
                      : 'btn-outline-light text-dark border bg-light'
                  }`}
                  style={{ fontSize: '12px' }}
                >
                  <UserCheck size={18} />
                  <span>Manager</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2.5 mb-3 rounded-3">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@talentbridge.com"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-dark m-0">Password</label>
                <span className="text-muted small" style={{ fontSize: '11px', cursor: 'pointer' }}>
                  Default: <code>Admin@12345</code>
                </span>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-light text-muted border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 small">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label text-secondary" htmlFor="rememberMe">
                  Remember session
                </label>
              </div>
              <span className="text-teal fw-medium" style={{ cursor: 'pointer' }}>
                Role: <strong>{selectedRole}</strong>
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-teal w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
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
        </div>

        {/* Bottom Trust & Security Footnote */}
        <div className="mt-4 pt-3 border-top text-center text-muted small" style={{ fontSize: '11px' }}>
          <span>🔒 Secured via JWT Auth & Bcrypt • Database: <strong>MongoDB Atlas (Cluster0)</strong></span>
        </div>
      </div>
    </div>
  );
};
