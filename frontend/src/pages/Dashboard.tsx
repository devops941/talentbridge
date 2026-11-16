import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Briefcase, 
  Users, 
  FileCheck, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Database, 
  Plus, 
  UploadCloud, 
  Sliders, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [recentRankings, setRecentRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch dashboard KPI summary
    api.get('/dashboard/summary')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));

    // 2. Fetch top candidates from default job
    api.get('/jobs')
      .then(async (res) => {
        if (res.data && res.data.length > 0) {
          const rankRes = await api.get(`/applications/job/${res.data[0].id}/rankings`);
          setRecentRankings(rankRes.data.slice(0, 5));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '350px' }}>
        <div className="spinner-border text-teal" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Active Job Postings', value: data?.active_jobs ?? 0, icon: Briefcase, color: '#2563EB', bg: '#EFF6FF', link: '/jobs' },
    { label: 'Total Candidate Profiles', value: data?.total_candidates ?? 0, icon: Users, color: '#10B981', bg: '#ECFDF5', link: '/candidates' },
    { label: 'Resumes Extracted & Mined', value: data?.resumes_processed ?? 0, icon: FileCheck, color: '#8B5CF6', bg: '#F5F3FF', link: '/resumes' },
    { label: 'Shortlisted / Scheduled', value: (data?.shortlisted_candidates ?? 0) + (data?.interviews_scheduled ?? 0), icon: CheckCircle2, color: '#0D9488', bg: '#F0FDFA', link: '/pipeline' },
  ];

  const chartData = data?.stage_funnel?.map((item: any) => ({
    name: item.stage,
    candidates: item.count,
  })) || [];

  return (
    <div>
      {/* Header Banner & Quick Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Recruitment Operations Dashboard</h3>
          <p className="text-secondary small m-0">Real-time candidate pipelines powered by MongoDB Atlas & Explainable NLP</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button 
            onClick={() => navigate('/jobs')} 
            className="btn btn-sm btn-outline-teal d-flex align-items-center gap-1.5 px-3 py-2 rounded-2"
          >
            <Plus size={16} /> Post Vacancy
          </button>
          <button 
            onClick={() => navigate('/resumes')} 
            className="btn btn-sm btn-teal d-flex align-items-center gap-1.5 px-3 py-2 rounded-2"
          >
            <UploadCloud size={16} /> Ingest Resume
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div className="col-12 col-sm-6 col-xl-3" key={idx}>
              <div 
                onClick={() => navigate(kpi.link)}
                className="card border-0 shadow-sm rounded-3 p-3 bg-white card-hover cursor-pointer"
                style={{ cursor: 'pointer', borderTop: `3px solid ${kpi.color}` }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-secondary small fw-semibold">{kpi.label}</span>
                  <div className="p-2 rounded-2" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-end">
                  <h2 className="fw-bold text-dark m-0">{kpi.value}</h2>
                  <span className="small text-muted d-flex align-items-center gap-0.5" style={{ fontSize: '11px' }}>
                    View <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left Charts + Recent, Right: Explainability & Database */}
      <div className="row g-4">
        {/* Left Column */}
        <div className="col-12 col-lg-8">
          {/* Stage Funnel Bar Chart */}
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark m-0">Recruitment Funnel by Stage</h5>
              <span className="badge bg-light text-secondary border">Live Distribution</span>
            </div>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    angle={-20} 
                    textAnchor="end" 
                    interval={0} 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Bar dataKey="candidates" fill="#0D9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Ranked Candidates Leaderboard Preview */}
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
            <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Award size={18} className="text-teal" />
                <h6 className="fw-bold text-dark m-0">Top Ranked Candidates Preview</h6>
              </div>
              <button 
                onClick={() => navigate('/matching')}
                className="btn btn-sm btn-link text-teal text-decoration-none fw-semibold p-0"
              >
                Full Leaderboard →
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle m-0 small">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-2.5">Candidate</th>
                    <th>Combined Score</th>
                    <th>Skill Coverage (70%)</th>
                    <th>Text Sim (30%)</th>
                    <th>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRankings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">No candidates scored yet.</td>
                    </tr>
                  ) : (
                    recentRankings.map((r, idx) => (
                      <tr key={r.application_id}>
                        <td className="px-4 py-3">
                          <div className="fw-bold text-dark">{r.candidate_name}</div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>{r.candidate_email}</div>
                        </td>
                        <td>
                          <span className="badge rounded-pill px-2.5 py-1.5 fw-bold text-white" style={{
                            backgroundColor: r.score >= 70 ? '#10B981' : '#3B82F6'
                          }}>
                            {r.score.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <span className="fw-semibold text-teal">{r.skill_score.toFixed(1)}%</span>
                        </td>
                        <td>
                          <span className="text-secondary">{r.text_score.toFixed(1)}%</span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {r.current_stage}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-12 col-lg-4">
          {/* MongoDB Atlas Status Card */}
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4 card-hover">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="p-2 rounded-2 bg-success-subtle text-success">
                <Database size={20} />
              </div>
              <div>
                <h6 className="fw-bold text-dark m-0">MongoDB Atlas Cloud</h6>
                <small className="text-success fw-medium">● Connected & Synchronized</small>
              </div>
            </div>

            <div className="small bg-light p-3 rounded-3 mb-3">
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Cluster:</span>
                <strong className="text-dark">Cluster0</strong>
              </div>
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Database:</span>
                <strong className="text-teal">TalentBridge</strong>
              </div>
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Driver:</span>
                <strong className="text-dark">PyMongo 4.20</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Active Collections:</span>
                <strong className="text-dark">9 Collections</strong>
              </div>
            </div>

            <div className="text-muted" style={{ fontSize: '11px' }}>
              All application states, resumes, match scores, and audit logs persist directly in your MongoDB cloud cluster.
            </div>
          </div>

          {/* Explainable AI Formula Card */}
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white card-hover">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="p-2 rounded-2 bg-teal-subtle text-teal" style={{ backgroundColor: '#CCFBF1', color: '#0F766E' }}>
                <Sliders size={20} />
              </div>
              <h6 className="fw-bold text-dark m-0">Explainable Scoring Rule</h6>
            </div>

            <div className="p-3 bg-light rounded-3 mb-3 border-start border-3 border-teal">
              <div className="fw-bold text-dark small mb-1">Final Suitability Formula:</div>
              <code className="text-teal fw-bold d-block" style={{ fontSize: '12px' }}>
                Score = (0.70 × Skill) + (0.30 × Cosine)
              </code>
            </div>

            <div className="small text-secondary mb-3">
              <div className="mb-2">
                <strong>✓ Skill Coverage (70%):</strong> Based on verified required skills mined by spaCy with evidence snippets.
              </div>
              <div>
                <strong>✓ Cosine Similarity (30%):</strong> Scikit-learn TF-IDF vector text comparison.
              </div>
            </div>

            <button 
              onClick={() => navigate('/matching')}
              className="btn btn-sm btn-outline-teal w-100 d-flex align-items-center justify-content-center gap-1.5"
            >
              <Award size={14} /> Open Ranking Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
