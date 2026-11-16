import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { 
  Award, 
  Sparkles, 
  FileSearch, 
  Database, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  BarChart3, 
  Users, 
  Briefcase, 
  Sliders, 
  Cpu, 
  Lock,
  GitBranch,
  MapPin,
  Clock,
  Send,
  Search,
  Filter
} from 'lucide-react';
import { ApplyModal } from '../components/candidate/ApplyModal';

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Public Jobs State
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Application Modal State
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    // Fetch live active jobs from MongoDB
    api.get('/jobs')
      .then((res) => setJobs(res.data || []))
      .catch((err) => console.error('Failed to load jobs:', err))
      .finally(() => setLoadingJobs(false));
  }, []);

  const handleOpenApply = (job: any) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  // Filter jobs based on search term & department
  const filteredJobs = jobs.filter((j) => {
    const isOpen = j.status === 'PUBLISHED' || j.status === 'OPEN';
    if (!isOpen) return false;

    const matchesSearch = 
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.skills?.some((s: any) => s.skill_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || j.department.toLowerCase().includes(selectedDept.toLowerCase());

    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = Array.from(new Set(jobs.map((j) => j.department))).filter(Boolean);

  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      {/* Top Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 m-0">
            <div className="p-2 rounded-3 bg-gradient-teal text-white shadow-sm d-flex align-items-center justify-content-center">
              <Award size={22} />
            </div>
            <span className="text-dark">Talent<span className="text-teal">Bridge</span></span>
            <span className="badge badge-teal ms-1 small" style={{ fontSize: '10px' }}>AI 2.0</span>
          </Link>

          <div className="d-flex align-items-center gap-3">
            <a href="#open-roles" className="text-decoration-none text-secondary small fw-medium d-none d-md-inline">Open Positions</a>
            <a href="#features" className="text-decoration-none text-secondary small fw-medium d-none d-md-inline">Features</a>
            <a href="#algorithm" className="text-decoration-none text-secondary small fw-medium d-none d-md-inline">Scoring Formula</a>
            <a href="#architecture" className="text-decoration-none text-secondary small fw-medium d-none d-md-inline">Architecture</a>

            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn-teal btn-sm px-4 py-2 rounded-pill d-flex align-items-center gap-2"
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="btn btn-teal btn-sm px-4 py-2 rounded-pill d-flex align-items-center gap-2"
              >
                Recruiter Portal <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section — Revamped Executive Modern AI Studio Theme */}
      <section 
        className="py-5 py-lg-6 border-bottom position-relative overflow-hidden"
        style={{
          background: 'radial-gradient(120% 90% at 50% 0%, #ECFDF5 0%, #F0FDFA 35%, #F8FAFC 75%, #FFFFFF 100%)'
        }}
      >
        {/* Subtle Ambient Light Orbs */}
        <div 
          className="position-absolute rounded-circle" 
          style={{
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(0, 168, 150, 0.12) 0%, transparent 70%)',
            top: '-10%',
            left: '5%',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />
        <div 
          className="position-absolute rounded-circle" 
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            top: '20%',
            right: '0%',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />

        <div className="container py-4 position-relative z-1">
          <div className="row align-items-center g-5">
            {/* Left Column: Headline, Description & Calls to Action */}
            <div className="col-12 col-lg-6">
              <div 
                className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3 border shadow-xs"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#CCFBF1' }}
              >
                <Sparkles size={15} style={{ color: '#00A896' }} />
                <span className="small fw-semibold" style={{ color: '#0F766E', fontSize: '12.5px' }}>
                  Next-Gen AI Recruitment &bull; Explainable Decision Support
                </span>
              </div>

              <h1 className="display-4 fw-bolder text-dark lh-sm mb-3" style={{ letterSpacing: '-1px' }}>
                Intelligent Candidate{' '}
                <span 
                  style={{
                    background: 'linear-gradient(135deg, #00A896 0%, #028090 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Screening & Ranking
                </span>
              </h1>

              <p className="lead text-secondary mb-4" style={{ fontSize: '15px', lineHeight: 1.65, maxWidth: '520px' }}>
                Automate candidate PDF resume ingestion with PyMuPDF, extract technical skill taxonomies, and rank applicants across your recruitment pipeline with deterministic 70% Skill Coverage & 30% TF-IDF Cosine Similarity.
              </p>

              <div className="d-flex flex-wrap gap-2.5 mb-4">
                <a 
                  href="#open-roles" 
                  className="btn px-4 py-2.5 text-white fw-semibold shadow-sm d-inline-flex align-items-center gap-2 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #00A896 0%, #0D7B6E 100%)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    boxShadow: '0 4px 14px rgba(0, 168, 150, 0.3)'
                  }}
                >
                  <Briefcase size={17} /> Browse {filteredJobs.length > 0 ? filteredJobs.length : 5} Open Vacancies
                </a>
                <Link 
                  to={isAuthenticated ? "/dashboard" : "/login"} 
                  className="btn btn-outline-secondary px-4 py-2.5 bg-white text-dark fw-semibold border shadow-xs d-inline-flex align-items-center gap-2"
                  style={{ borderRadius: '10px', fontSize: '14px' }}
                >
                  {isAuthenticated ? "Open Dashboard" : "Access Recruiter Portal"} <ArrowRight size={16} />
                </Link>
              </div>

              {/* 4 Clean Metric Pillars */}
              <div className="row g-2.5 pt-2" style={{ maxWidth: '520px' }}>
                <div className="col-6">
                  <div className="p-2.5 rounded-3 bg-white border shadow-xs d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} style={{ color: '#00A896' }} className="flex-shrink-0" />
                    <span className="text-secondary small fw-medium" style={{ fontSize: '12px' }}>&lt; 0.45s PyMuPDF Engine</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2.5 rounded-3 bg-white border shadow-xs d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} style={{ color: '#00A896' }} className="flex-shrink-0" />
                    <span className="text-secondary small fw-medium" style={{ fontSize: '12px' }}>70/30 Explainable Math</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2.5 rounded-3 bg-white border shadow-xs d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} style={{ color: '#00A896' }} className="flex-shrink-0" />
                    <span className="text-secondary small fw-medium" style={{ fontSize: '12px' }}>Zero-PII Compliance</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2.5 rounded-3 bg-white border shadow-xs d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} style={{ color: '#00A896' }} className="flex-shrink-0" />
                    <span className="text-secondary small fw-medium" style={{ fontSize: '12px' }}>MongoDB Atlas Cloud</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Executive Studio Window Visualizer */}
            <div className="col-12 col-lg-6">
              <div 
                className="rounded-4 shadow-xl overflow-hidden border"
                style={{ 
                  backgroundColor: '#0B1528',
                  borderColor: '#1E293B',
                  boxShadow: '0 20px 50px rgba(11, 21, 40, 0.25)'
                }}
              >
                {/* Window Top Bar (macOS Dots & Title) */}
                <div 
                  className="px-4 py-3 d-flex justify-content-between align-items-center border-bottom"
                  style={{ backgroundColor: '#070F1E', borderColor: '#1E293B' }}
                >
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#EF4444' }}></span>
                    <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#F59E0B' }}></span>
                    <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#10B981' }}></span>
                    <span className="text-light opacity-50 small ms-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                      TalentBridge AI Engine v2.0
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
                    <span className="text-light opacity-75 small" style={{ fontSize: '11px' }}>Deterministic Active</span>
                  </div>
                </div>

                {/* Window Body: Live Matching Leaderboard Preview */}
                <div className="p-4 text-white">
                  {/* Vacancy Context Banner */}
                  <div 
                    className="p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center border"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                  >
                    <div>
                      <div className="text-light opacity-60 text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>
                        Active Vacancy In Focus
                      </div>
                      <div className="fw-bold text-white small" style={{ fontSize: '13.5px' }}>
                        Senior Python & AI Backend Engineer
                      </div>
                    </div>
                    <span 
                      className="badge rounded-pill border px-2.5 py-1"
                      style={{ backgroundColor: 'rgba(0, 168, 150, 0.15)', borderColor: 'rgba(0, 210, 180, 0.3)', color: '#2DD4BF', fontSize: '11px' }}
                    >
                      5 Applicants Scored
                    </span>
                  </div>

                  {/* Top 3 Live Scored Candidates Leaderboard */}
                  <div className="d-flex flex-column gap-2.5 mb-3">
                    {/* Rank 1: Gokul Nath */}
                    <div 
                      className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between transition-all"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 overflow-hidden me-2">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs flex-shrink-0"
                          style={{ width: '32px', height: '32px', backgroundColor: '#FEF08A', color: '#854D0E', border: '1.5px solid #FACC15', fontSize: '13px' }}
                        >
                          🥇
                        </div>
                        <div className="overflow-hidden">
                          <div className="fw-bold text-white small text-truncate leading-tight mb-1">
                            Gokul Nath
                          </div>
                          <div className="d-flex flex-wrap gap-1">
                            {['Python', 'FastAPI', 'PostgreSQL'].map(s => (
                              <span key={s} className="badge rounded-pill" style={{ backgroundColor: 'rgba(0, 210, 180, 0.2)', color: '#2DD4BF', fontSize: '9.5px', padding: '2px 6px' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2.5 flex-shrink-0">
                        <div className="progress d-none d-sm-block" style={{ width: '65px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                          <div className="progress-bar rounded-pill" style={{ width: '82.8%', backgroundColor: '#10B981' }}></div>
                        </div>
                        <span 
                          className="badge rounded-pill fw-bold"
                          style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: '11.5px', padding: '4px 8px' }}
                        >
                          82.8%
                        </span>
                      </div>
                    </div>

                    {/* Rank 2: Rajesh Kumar */}
                    <div 
                      className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between transition-all"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 overflow-hidden me-2">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs flex-shrink-0"
                          style={{ width: '32px', height: '32px', backgroundColor: '#F1F5F9', color: '#334155', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
                        >
                          🥈
                        </div>
                        <div className="overflow-hidden">
                          <div className="fw-bold text-white small text-truncate leading-tight mb-1">
                            Rajesh Kumar
                          </div>
                          <div className="d-flex flex-wrap gap-1">
                            {['Docker', 'AWS', 'Linux'].map(s => (
                              <span key={s} className="badge rounded-pill" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#CBD5E1', fontSize: '9.5px', padding: '2px 6px' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2.5 flex-shrink-0">
                        <div className="progress d-none d-sm-block" style={{ width: '65px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                          <div className="progress-bar rounded-pill" style={{ width: '51.2%', backgroundColor: '#0D9488' }}></div>
                        </div>
                        <span 
                          className="badge rounded-pill fw-bold"
                          style={{ backgroundColor: '#F0FDFA', color: '#0D9488', border: '1px solid #99F6E4', fontSize: '11.5px', padding: '4px 8px' }}
                        >
                          51.2%
                        </span>
                      </div>
                    </div>

                    {/* Rank 3: Priya Sharma */}
                    <div 
                      className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between transition-all"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 overflow-hidden me-2">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs flex-shrink-0"
                          style={{ width: '32px', height: '32px', backgroundColor: '#FFEDD5', color: '#9A3412', border: '1.5px solid #FDBA74', fontSize: '13px' }}
                        >
                          🥉
                        </div>
                        <div className="overflow-hidden">
                          <div className="fw-bold text-white small text-truncate leading-tight mb-1">
                            Priya Sharma
                          </div>
                          <div className="d-flex flex-wrap gap-1">
                            {['React', 'TypeScript', 'FastAPI'].map(s => (
                              <span key={s} className="badge rounded-pill" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#CBD5E1', fontSize: '9.5px', padding: '2px 6px' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2.5 flex-shrink-0">
                        <div className="progress d-none d-sm-block" style={{ width: '65px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                          <div className="progress-bar rounded-pill" style={{ width: '49.7%', backgroundColor: '#F59E0B' }}></div>
                        </div>
                        <span 
                          className="badge rounded-pill fw-bold"
                          style={{ backgroundColor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', fontSize: '11.5px', padding: '4px 8px' }}
                        >
                          49.7%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Window Footer Formula */}
                  <div 
                    className="p-2.5 rounded-2 text-center small text-light opacity-80"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '11px' }}
                  >
                    <span style={{ color: '#2DD4BF' }}>Formula:</span> (0.70 &times; Skill Coverage) + (0.30 &times; TF-IDF Cosine Sim)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC CAREER BOARD / OPEN POSITIONS SECTION */}
      <section id="open-roles" className="py-5 bg-light border-bottom">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
            <div>
              <div className="d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-pill mb-2" style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '12px', fontWeight: 600 }}>
                <Briefcase size={14} /> Open Vacancies
              </div>
              <h2 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.5px' }}>
                Explore Open Career Opportunities
              </h2>
              <p className="text-muted small m-0 mt-1">
                Browse positions posted by recruiters. Apply with instant Gmail OTP verification and AI resume screening.
              </p>
            </div>

            {/* Search Box */}
            <div className="d-flex gap-2" style={{ minWidth: '280px' }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted"><Search size={14} /></span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by role, skill, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Department Filter Pills */}
          {uniqueDepartments.length > 0 && (
            <div className="d-flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setSelectedDept('ALL')}
                className={`btn btn-sm rounded-pill px-3 py-1 ${selectedDept === 'ALL' ? 'btn-teal text-white' : 'btn-white border text-secondary'}`}
                style={{ fontSize: '12px' }}
              >
                All Departments ({jobs.filter((j) => j.status === 'PUBLISHED' || j.status === 'OPEN').length})
              </button>
              {uniqueDepartments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`btn btn-sm rounded-pill px-3 py-1 ${selectedDept === dept ? 'btn-teal text-white' : 'btn-white border text-secondary'}`}
                  style={{ fontSize: '12px' }}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}

          {/* Jobs Listing Grid */}
          {loadingJobs ? (
            <div className="text-center py-5">
              <div className="spinner-border text-teal" role="status"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="card border-0 shadow-sm p-5 text-center text-muted rounded-4 bg-white">
              <Briefcase size={48} className="mx-auto mb-3 opacity-40 text-secondary" />
              <h5>No Matching Openings Found</h5>
              <p className="small">Try clearing search filters or check back later for new career postings.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredJobs.map((job) => (
                <div className="col-12 col-md-6 col-xl-4" key={job.id}>
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between card-hover position-relative">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {job.department}
                        </span>
                        <span className="badge-status-open d-inline-flex align-items-center gap-1">
                          <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></span>
                          Open
                        </span>
                      </div>

                      <h5 className="fw-bold text-dark mb-2">{job.title}</h5>

                      <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                        <span className="d-flex align-items-center gap-1"><MapPin size={14} /> {job.location}</span>
                        <span className="d-flex align-items-center gap-1"><Clock size={14} /> {job.experience_min}-{job.experience_max} yrs</span>
                      </div>

                      <p className="text-secondary small mb-3 text-truncate-2" style={{ maxHeight: '42px', overflow: 'hidden' }}>
                        {job.description}
                      </p>
                    </div>

                    <div>
                      <div className="border-top pt-3 mb-3">
                        <div className="small fw-semibold text-muted mb-2">Required Skills (70% Weight):</div>
                        <div className="d-flex flex-wrap gap-1">
                          {job.skills?.filter((s: any) => s.requirement_type === 'REQUIRED').map((s: any) => (
                            <span key={s.id || s.skill_name} className="badge bg-light text-dark border">
                              {s.skill_name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenApply(job)}
                        className="btn btn-teal w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 fw-semibold shadow-sm"
                      >
                        <Send size={15} /> Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Scoring Methodology Section */}
      <section id="algorithm" className="py-5 bg-white border-bottom">
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5" style={{ maxWidth: '650px' }}>
            <span className="badge badge-teal text-uppercase px-3 py-1.5 mb-2">Transparent Math</span>
            <h2 className="fw-bold text-dark">70/30 Explainable Scoring Formula</h2>
            <p className="text-secondary small">
              Unlike opaque neural networks, TalentBridge operates strictly on explainable mathematics so recruiters always understand why a candidate received a given rank.
            </p>
          </div>

          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-light h-100 card-hover">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-white text-teal shadow-sm">
                    <Sliders size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark m-0">70% Skill Coverage Score</h5>
                    <small className="text-muted">Deterministic Taxonomy Matching</small>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Calculates the proportion of mandatory job skills satisfied in the candidate's parsed resume. Each skill is matched against canonical taxonomy and synonym aliases with boundary detection.
                </p>
                <div className="bg-white p-3 rounded-3 border mt-auto">
                  <code className="text-dark fw-bold">
                    Skill Score = (Matched Required Skills / Total Required Skills) × 100
                  </code>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-light h-100 card-hover">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-white text-primary shadow-sm">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark m-0">30% TF-IDF Cosine Similarity</h5>
                    <small className="text-muted">Mathematical Vector Angle Metric</small>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Transforms both the job description and the full resume text into 5000-feature term frequency-inverse document frequency vectors, computing the cosine of the angle between them.
                </p>
                <div className="bg-white p-3 rounded-3 border mt-auto">
                  <code className="text-dark fw-bold">
                    Combined = (0.70 × Skill Score) + (0.30 × Cosine Similarity)
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-5 bg-light border-bottom">
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5" style={{ maxWidth: '650px' }}>
            <span className="badge badge-teal text-uppercase px-3 py-1.5 mb-2">Core Capabilities</span>
            <h2 className="fw-bold text-dark">Engineered for Technical Recruitment</h2>
            <p className="text-secondary small">
              From raw unstructured PDF ingestion to explainable leaderboards and audit-ready governance.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 card-hover">
                <div className="p-3 rounded-3 bg-light text-teal d-inline-block mb-3" style={{ width: 'fit-content' }}>
                  <FileSearch size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">PyMuPDF Document Parser</h5>
                <p className="text-secondary small mb-0">
                  Reliable extraction of multi-column, formatted PDF resumes with fallback boundary cleansing for C++, C#, .NET, and modern tech terms.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 card-hover">
                <div className="p-3 rounded-3 bg-light text-teal d-inline-block mb-3" style={{ width: 'fit-content' }}>
                  <Layers size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Curated Skill Taxonomy</h5>
                <p className="text-secondary small mb-0">
                  Taxonomy matching supporting multi-word phrases and alias variations with exact word boundary verification and context sentence extraction.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 card-hover">
                <div className="p-3 rounded-3 bg-light text-teal d-inline-block mb-3" style={{ width: 'fit-content' }}>
                  <ShieldCheck size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Blind AI Scoring</h5>
                <p className="text-secondary small mb-0">
                  Algorithms strictly evaluate verified technical competency and experience text, completely detached from demographic or PII variables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-auto">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <Award size={18} className="text-teal" />
              <span className="fw-bold">TalentBridge</span>
              <span className="text-secondary small ms-2">Explainable AI Candidate Screening & Ranking</span>
            </div>
            <div className="text-secondary small">
              Connected to MongoDB Atlas Cluster0 • TalentBridge Database
            </div>
          </div>
        </div>
      </footer>

      {/* Multi-Step Candidate Apply Modal with Live Gmail OTP */}
      <ApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          // Refresh jobs or notify
        }}
      />
    </div>
  );
};
