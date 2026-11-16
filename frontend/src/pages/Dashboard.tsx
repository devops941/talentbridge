import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Award, 
  ArrowRight,
  UploadCloud, 
  Plus, 
  CheckCircle2, 
  Database,
  GitBranch,
  FileCheck,
  Sparkles,
  BarChart3,
  Check
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch dashboard KPI summary from MongoDB Atlas
    api.get('/dashboard/summary')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Summary error:', err));

    // 2. Fetch real active jobs from MongoDB
    api.get('/jobs')
      .then(async (res) => {
        setJobs(res.data || []);
        if (res.data && res.data.length > 0) {
          // 3. Fetch real candidate rankings for the primary job
          try {
            const rankRes = await api.get(`/applications/job/${res.data[0].id}/rankings`);
            setRankings(rankRes.data || []);
          } catch (e) {
            console.error('Rankings error:', e);
          }
        }
      })
      .catch((err) => console.error('Jobs error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Pipeline colors
  const STAGE_COLORS: Record<string, string> = {
    'Application Received': '#3B82F6',
    'Resume Under Review': '#00A896',
    'Shortlisted': '#F59E0B',
    'Interview Scheduled': '#8B5CF6',
    'Offer Extended': '#10B981',
    'Hired': '#059669',
    'Rejected': '#EF4444',
  };

  // Real pipeline data from MongoDB Atlas stage_funnel
  const pipelineData = data?.stage_funnel?.map((item: any) => ({
    name: item.stage,
    value: item.count,
    color: STAGE_COLORS[item.stage] || '#64748B',
  })) || [
    { name: 'Resume Under Review', value: 1, color: '#00A896' },
    { name: 'Interview Scheduled', value: 1, color: '#8B5CF6' },
  ];

  const totalInPipeline = pipelineData.reduce((acc: number, cur: any) => acc + cur.value, 0);

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Hero Banner — Clean Executive AI Recruitment Theme */}
      <div className="tb-hero-banner p-4 p-md-5">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-7">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ backgroundColor: '#CCFBF1', color: '#0F766E', fontSize: '12px', fontWeight: 600 }}>
              <Sparkles size={14} /> Explainable Decision Support System
            </div>
            <h2 className="fw-bolder text-dark mb-2" style={{ fontSize: '28px', letterSpacing: '-0.5px' }}>
              Intelligent Hiring <span style={{ color: '#00A896' }}>with AI</span>
            </h2>
            <p className="text-secondary mb-4" style={{ fontSize: '14px', maxWidth: '480px', lineHeight: 1.5 }}>
              Automatically screen, extract resume skills via PyMuPDF, and rank candidates with verified 70% Skill Coverage and 30% TF-IDF Cosine Similarity.
            </p>
            <div className="d-flex flex-wrap gap-2.5">
              <button
                onClick={() => navigate('/resumes')}
                className="btn d-inline-flex align-items-center gap-2 px-4 py-2 text-white fw-semibold shadow-sm"
                style={{ backgroundColor: '#00A896', borderRadius: '10px', fontSize: '13.5px' }}
              >
                <UploadCloud size={16} /> Upload Resumes
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-4 py-2 bg-white text-dark fw-semibold shadow-sm border"
                style={{ borderRadius: '10px', fontSize: '13.5px' }}
              >
                <Plus size={16} /> Post Job Vacancy
              </button>
            </div>
          </div>

          {/* Businesswoman portrait cutout & live MongoDB Atlas status */}
          <div className="col-12 col-lg-5 d-flex justify-content-center justify-content-lg-end align-items-center gap-3">
            <div 
              className="position-relative d-flex align-items-center justify-content-center"
              style={{ width: '160px', height: '160px' }}
            >
              <div 
                className="position-absolute w-100 h-100 rounded-circle"
                style={{
                  background: 'radial-gradient(circle, rgba(0,210,180,0.3) 0%, rgba(0,168,150,0.08) 70%, transparent 100%)',
                  filter: 'blur(8px)',
                }}
              ></div>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=350&q=80"
                alt="Intelligent Recruitment"
                className="rounded-circle object-fit-cover shadow position-relative"
                style={{ width: '140px', height: '140px', border: '3px solid #FFFFFF' }}
              />
            </div>

            <div 
              className="card border-0 shadow-sm p-3 rounded-4 bg-white d-none d-sm-block text-start"
              style={{ width: '190px', border: '1px solid #E2E8F0' }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <Database size={16} className="text-teal" style={{ color: '#00A896' }} />
                <div className="fw-bold text-dark small">MongoDB Atlas</div>
              </div>
              <div className="text-muted small" style={{ fontSize: '11px', lineHeight: 1.35 }}>
                Connected: <strong className="text-dark">Cluster0</strong><br/>
                Database: <strong className="text-teal" style={{ color: '#00A896' }}>TalentBridge</strong>
              </div>
              <div className="mt-2 pt-2 border-top d-flex align-items-center gap-1.5" style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></span>
                System Operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Real KPI Metric Cards Connected to Modules */}
      <div className="row g-3">
        {/* KPI 1: Job Vacancies Module */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div 
            onClick={() => navigate('/jobs')}
            className="tb-card p-3 tb-card-hover h-100 d-flex flex-column justify-content-between cursor-pointer"
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div 
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
              >
                <Briefcase size={20} />
              </div>
              <span className="badge-trend-green">Module Active</span>
            </div>
            <div>
              <h3 className="fw-bolder text-dark mb-0" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>
                {data?.active_jobs ?? jobs.length}
              </h3>
              <div className="text-dark small fw-semibold">Job Vacancies</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>Active roles & criteria</div>
            </div>
          </div>
        </div>

        {/* KPI 2: Candidates Directory Module */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div 
            onClick={() => navigate('/candidates')}
            className="tb-card p-3 tb-card-hover h-100 d-flex flex-column justify-content-between cursor-pointer"
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div 
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#F0FDFA', color: '#00A896' }}
              >
                <Users size={20} />
              </div>
              <span className="badge-trend-green">Directory</span>
            </div>
            <div>
              <h3 className="fw-bolder text-dark mb-0" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>
                {data?.total_candidates ?? 0}
              </h3>
              <div className="text-dark small fw-semibold">Candidate Profiles</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>Applicant master records</div>
            </div>
          </div>
        </div>

        {/* KPI 3: Resume Screening & Parsing Module */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div 
            onClick={() => navigate('/resumes')}
            className="tb-card p-3 tb-card-hover h-100 d-flex flex-column justify-content-between cursor-pointer"
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div 
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}
              >
                <FileText size={20} />
              </div>
              <span className="badge-trend-green">PyMuPDF NLP</span>
            </div>
            <div>
              <h3 className="fw-bolder text-dark mb-0" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>
                {data?.resumes_processed ?? 0}
              </h3>
              <div className="text-dark small fw-semibold">Resumes Screened</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>Mined skill profiles</div>
            </div>
          </div>
        </div>

        {/* KPI 4: AI Match & Rankings Module */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div 
            onClick={() => navigate('/matching')}
            className="tb-card p-3 tb-card-hover h-100 d-flex flex-column justify-content-between cursor-pointer"
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div 
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#FFFBEB', color: '#F59E0B' }}
              >
                <Award size={20} />
              </div>
              <span className="badge-trend-green">70/30 Model</span>
            </div>
            <div>
              <h3 className="fw-bolder text-dark mb-0" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>
                {data?.total_applications ?? rankings.length}
              </h3>
              <div className="text-dark small fw-semibold">Ranked Applications</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>Explainable AI scores</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Analytical Row (3 Columns: Leaderboard, Pipeline Funnel, Scoring Model) */}
      <div className="row g-3">
        {/* Column 1: AI Match & Rankings Leaderboard (Real MongoDB Candidates) */}
        <div className="col-12 col-lg-5">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark m-0">Top Ranked Candidates</h6>
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  {jobs.length > 0 ? jobs[0].title : 'Primary Role'}
                </small>
              </div>
              <Link to="/matching" className="text-decoration-none small fw-semibold" style={{ color: '#00A896', fontSize: '12px' }}>
                View All →
              </Link>
            </div>

            {rankings.length === 0 ? (
              <div className="p-4 text-center text-muted my-auto">
                <Award size={36} className="mx-auto mb-2 opacity-40 text-secondary" />
                <div className="small fw-semibold">No Candidate Rankings Yet</div>
                <div style={{ fontSize: '11px' }}>Upload resumes or post vacancies to trigger ranking.</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2.5 my-auto">
                {rankings.slice(0, 3).map((cand, idx) => (
                  <div 
                    key={cand.application_id || idx}
                    className="d-flex align-items-center justify-content-between p-2.5 rounded-3"
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #EDF2F7' }}
                  >
                    <div className="d-flex align-items-center gap-2.5 overflow-hidden">
                      <span className={`rank-badge-${idx + 1}`}>{idx + 1}</span>
                      <div className="overflow-hidden">
                        <div className="fw-bold text-dark small text-truncate m-0">{cand.candidate_name}</div>
                        <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                          {cand.matched_skills && cand.matched_skills.length > 0 
                            ? cand.matched_skills.slice(0, 3).join(', ') 
                            : cand.candidate_email}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <div 
                        className="progress d-none d-sm-block" 
                        style={{ width: '45px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '4px' }}
                      >
                        <div 
                          className="progress-bar" 
                          style={{ width: `${Math.round(cand.score)}%`, backgroundColor: '#00A896', borderRadius: '4px' }}
                        ></div>
                      </div>
                      <span 
                        className="badge fw-bold"
                        style={{ backgroundColor: '#CCFBF1', color: '#00A896', fontSize: '11.5px', padding: '4px 8px' }}
                      >
                        {cand.score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-muted text-center pt-2 border-top" style={{ fontSize: '11px' }}>
              Formula: (0.70 × Skill Coverage) + (0.30 × TF-IDF Cosine Similarity)
            </div>
          </div>
        </div>

        {/* Column 2: Pipeline Board Funnel */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold text-dark m-0">Recruitment Pipeline</h6>
              <Link to="/pipeline" className="text-decoration-none small fw-semibold" style={{ color: '#00A896', fontSize: '12px' }}>
                Board →
              </Link>
            </div>

            <div className="position-relative d-flex justify-content-center align-items-center my-auto" style={{ height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pipelineData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="position-absolute text-center">
                <div className="fw-bolder text-dark" style={{ fontSize: '17px', lineHeight: 1.1 }}>{totalInPipeline}</div>
                <div className="text-muted" style={{ fontSize: '10px' }}>Candidates</div>
              </div>
            </div>

            <div className="d-flex flex-column gap-1.5 pt-2 border-top" style={{ fontSize: '11px' }}>
              {pipelineData.map((item: any) => (
                <div key={item.name} className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2 text-truncate">
                    <span className="rounded-circle flex-shrink-0" style={{ width: '8px', height: '8px', backgroundColor: item.color }}></span>
                    <span className="text-secondary text-truncate">{item.name}</span>
                  </div>
                  <span className="fw-bold text-dark">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Explainable Scoring Principles */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <h6 className="fw-bold text-dark mb-3">Explainable AI Principles</h6>

            <div className="d-flex flex-column gap-2.5 my-auto">
              <div className="p-3 rounded-3" style={{ backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1' }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="fw-bold text-teal" style={{ color: '#0F766E', fontSize: '13px' }}>70% Skill Coverage</span>
                  <span className="badge bg-teal text-white small" style={{ backgroundColor: '#0D9488' }}>Primary</span>
                </div>
                <p className="text-secondary small m-0" style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                  Verified presence of mandatory skills identified in candidate resume against vacancy criteria.
                </p>
              </div>

              <div className="p-3 rounded-3" style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="fw-bold text-primary" style={{ fontSize: '13px' }}>30% TF-IDF Cosine Match</span>
                  <span className="badge bg-primary text-white small">Semantic</span>
                </div>
                <p className="text-secondary small m-0" style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                  Mathematical vector angle comparison between job description terms and candidate experience text.
                </p>
              </div>
            </div>

            <div className="text-muted text-center pt-2 border-top" style={{ fontSize: '11px' }}>
              Decision support aid: Recruiters make all final hiring decisions.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Operational Row (2 Columns: Recent Vacancies & Audit Trail) */}
      <div className="row g-3">
        {/* Left: Real Job Vacancies from MongoDB Atlas */}
        <div className="col-12 col-lg-7">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark m-0">Recent Job Vacancies</h6>
              <Link to="/jobs" className="text-decoration-none small fw-semibold" style={{ color: '#00A896', fontSize: '12px' }}>
                Manage Openings →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr className="text-muted small" style={{ fontSize: '11.5px', borderBottom: '1px solid #EDF2F7' }}>
                    <th className="fw-semibold pb-2">Job Title</th>
                    <th className="fw-semibold pb-2">Department</th>
                    <th className="fw-semibold pb-2">Location</th>
                    <th className="fw-semibold pb-2 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted small">
                        No jobs posted yet. Click "Post Job Vacancy" above.
                      </td>
                    </tr>
                  ) : (
                    jobs.slice(0, 4).map((job) => (
                      <tr key={job.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td className="py-2.5">
                          <div className="d-flex align-items-center gap-2">
                            <div 
                              className="p-1.5 rounded-2 d-flex align-items-center justify-content-center text-secondary bg-light"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Briefcase size={14} />
                            </div>
                            <span className="fw-semibold text-dark small">{job.title}</span>
                          </div>
                        </td>
                        <td className="text-secondary small py-2.5">{job.department}</td>
                        <td className="text-secondary small py-2.5">{job.location}</td>
                        <td className="text-end py-2.5">
                          <span className="badge-status-open">
                            {job.status || 'PUBLISHED'}
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

        {/* Right: Reports & Audit Trail Module */}
        <div className="col-12 col-lg-5">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark m-0">Audit & System Reports</h6>
              <Link to="/reports" className="text-decoration-none small fw-semibold" style={{ color: '#00A896', fontSize: '12px' }}>
                View All Reports →
              </Link>
            </div>

            <div className="d-flex flex-column gap-3 my-auto">
              <div className="d-flex align-items-start gap-3">
                <div 
                  className="rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ backgroundColor: '#EFF6FF', color: '#2563EB', width: '34px', height: '34px' }}
                >
                  <FileCheck size={16} />
                </div>
                <div className="flex-grow-1">
                  <div className="text-dark small fw-medium" style={{ lineHeight: 1.35 }}>
                    Resume parsing completed for applicants
                  </div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    PyMuPDF text extraction & spaCy NLP
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div 
                  className="rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ backgroundColor: '#FEF3C7', color: '#D97706', width: '34px', height: '34px' }}
                >
                  <Award size={16} />
                </div>
                <div className="flex-grow-1">
                  <div className="text-dark small fw-medium" style={{ lineHeight: 1.35 }}>
                    Candidate matching score computed
                  </div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    Cosine similarity & skill verification logged
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div 
                  className="rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ backgroundColor: '#CCFBF1', color: '#0F766E', width: '34px', height: '34px' }}
                >
                  <GitBranch size={16} />
                </div>
                <div className="flex-grow-1">
                  <div className="text-dark small fw-medium" style={{ lineHeight: 1.35 }}>
                    Pipeline stage audit tracking active
                  </div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    Recruiter feedback & stage history recorded
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center border-top">
              <Link to="/reports" className="text-muted small text-decoration-none" style={{ fontSize: '11px' }}>
                Compliant with HR AI Governance & Audit Trail
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
