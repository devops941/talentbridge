import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Lock, Mail, Award, AlertCircle, Eye, EyeOff, ArrowLeft, Shield, UserCheck, Briefcase } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@talentbridge.com');
  const [password, setPassword] = useState('Admin@12345');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleRoleSelect = (roleEmail: string, rolePwd: string) => {
    setEmail(roleEmail);
    setPassword(rolePwd);
    setError(null);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-gradient-hero">
      {/* Top Bar with Home Link */}
      <div className="p-3 px-4">
        <Link to="/" className="text-decoration-none text-secondary small fw-semibold d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to Product Overview
        </Link>
      </div>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
        <div className="card shadow-lg border-0 rounded-4 glass-card" style={{ maxWidth: '460px', width: '100%' }}>
          <div className="card-body p-4 p-md-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex p-3 rounded-3 bg-gradient-teal text-white shadow-sm mb-3">
                <Award size={32} />
              </div>
              <h3 className="fw-bold text-dark m-0">TalentBridge</h3>
              <p className="text-muted small mt-1">Sign in to the Candidate Screening Portal</p>
            </div>

            {/* Quick One-Click Demo Role Switcher */}
            <div className="mb-4">
              <label className="form-label small fw-semibold text-muted d-block text-center mb-2">
                Quick Role Selection for Demo:
              </label>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin@talentbridge.com', 'Admin@12345')}
                  className={`btn btn-sm d-flex align-items-center gap-1 px-2.5 py-1.5 rounded-2 ${
                    email === 'admin@talentbridge.com' 
                      ? 'btn-dark text-white fw-bold shadow-sm' 
                      : 'btn-outline-secondary'
                  }`}
                  style={{ fontSize: '11px' }}
                >
                  <Shield size={13} /> Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('recruiter@talentbridge.com', 'Recruiter@12345')}
                  className={`btn btn-sm d-flex align-items-center gap-1 px-2.5 py-1.5 rounded-2 ${
                    email === 'recruiter@talentbridge.com' 
                      ? 'btn-teal text-white fw-bold shadow-sm' 
                      : 'btn-outline-secondary'
                  }`}
                  style={{ fontSize: '11px' }}
                >
                  <Briefcase size={13} /> Recruiter
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('manager@talentbridge.com', 'Manager@12345')}
                  className={`btn btn-sm d-flex align-items-center gap-1 px-2.5 py-1.5 rounded-2 ${
                    email === 'manager@talentbridge.com' 
                      ? 'btn-primary text-white fw-bold shadow-sm' 
                      : 'btn-outline-secondary'
                  }`}
                  style={{ fontSize: '11px' }}
                >
                  <UserCheck size={13} /> Manager
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted border-end-0">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 ps-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@talentbridge.com"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted border-end-0">
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
                    className="input-group-text bg-white text-muted border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-teal w-100 py-2.5 rounded-3 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-top text-center small text-muted">
              <div>Connected to <strong>MongoDB Atlas (Cluster0)</strong></div>
              <div className="text-secondary" style={{ fontSize: '11px' }}>Database: <code>TalentBridge</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
