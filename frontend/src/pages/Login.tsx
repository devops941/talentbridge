import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Lock, Mail, Award, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@talentbridge.com');
  const [password, setPassword] = useState('Admin@12345');
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

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: '440px', width: '100%', borderRadius: '12px' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle bg-teal-subtle mb-3" style={{ backgroundColor: '#E6FFFA' }}>
              <Award size={36} color="#0D9488" />
            </div>
            <h3 className="fw-bold text-dark">TalentBridge</h3>
            <p className="text-muted small">Sign in to your recruiter account</p>
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
                <span className="input-group-text bg-white text-muted"><Mail size={16} /></span>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@talentbridge.com"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted"><Lock size={16} /></span>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              style={{ backgroundColor: '#0D9488', borderColor: '#0D9488' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-light rounded text-center small text-muted">
            <div className="fw-semibold mb-1">Demo Credentials:</div>
            <div>Admin: <code>admin@talentbridge.com</code> / <code>Admin@12345</code></div>
            <div>Recruiter: <code>recruiter@talentbridge.com</code> / <code>Recruiter@12345</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};
