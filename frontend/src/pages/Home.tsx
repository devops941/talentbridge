import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
  GitBranch
} from 'lucide-react';

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

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
            <a href="#features" className="text-decoration-none text-secondary small fw-medium d-none d-md-inline">Features</a>
            <a href="#algorithm" className="text-decoration-none text-secondary small fw-medium d-none d-md-inline">Scoring Formula</a>
            <a href="#architecture" className="text-decoration-none text-secondary small fw-medium d-none d-md-inline">Architecture</a>
            <a href="#database" className="text-decoration-none text-secondary small fw-medium d-none d-md-inline">MongoDB Atlas</a>

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

      {/* Hero Section */}
      <section className="bg-gradient-hero py-5 py-lg-6 border-bottom">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-white border shadow-sm mb-3">
                <Sparkles size={16} className="text-teal" />
                <span className="small fw-semibold text-secondary">
                  Natural Language Processing & Explainable Decision Support
                </span>
              </div>
              <h1 className="display-4 fw-bold text-dark lh-sm mb-3">
                Intelligent Candidate <span className="text-teal">Screening & Ranking</span> System
              </h1>
              <p className="lead text-secondary mb-4" style={{ fontSize: '1.15rem' }}>
                TalentBridge automates PDF resume extraction, identifies technical skills through a curated NLP taxonomy, and calculates explainable suitability scores with zero algorithmic bias.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link 
                  to={isAuthenticated ? "/dashboard" : "/login"} 
                  className="btn btn-teal px-4 py-2.5 rounded-3 fs-6 d-flex align-items-center gap-2"
                >
                  {isAuthenticated ? "Open Dashboard" : "Access Recruiter Portal"} <ArrowRight size={18} />
                </Link>
                <a 
                  href="#algorithm" 
                  className="btn btn-outline-secondary px-4 py-2.5 rounded-3 fs-6"
                >
                  Explore Scoring Formula
                </a>
              </div>

              {/* Highlight Badges */}
              <div className="d-flex flex-wrap gap-3 text-secondary small pt-2">
                <div className="d-flex align-items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-teal" /> PyMuPDF PDF Engine
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-teal" /> spaCy Skill Mining
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-teal" /> TF-IDF Cosine Sim
                </div>
                <div className="d-flex align-items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-teal" /> MongoDB Atlas Cloud
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-lg rounded-4 p-4 glass-card position-relative overflow-hidden">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="p-2 rounded-circle bg-success text-white" style={{ width: '10px', height: '10px' }}></span>
                    <span className="fw-bold small text-dark">Live MongoDB Candidate Match</span>
                  </div>
                  <span className="badge bg-success-subtle text-success">Rank #1</span>
                </div>

                <div className="mb-3">
                  <h5 className="fw-bold text-dark m-0">John Doe</h5>
                  <div className="small text-muted">Senior Python Backend Engineer Applicant</div>
                </div>

                {/* Score Pill */}
                <div className="p-3 rounded-3 bg-light border mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold text-secondary">Suitability Score</span>
                    <span className="fs-4 fw-bold text-teal">78.87%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-teal" style={{ width: '78.87%' }}></div>
                  </div>
                  <div className="d-flex justify-content-between small text-muted mt-2" style={{ fontSize: '11px' }}>
                    <span>Skill Coverage: <strong>100% (70% weight)</strong></span>
                    <span>TF-IDF Text: <strong>29.6% (30% weight)</strong></span>
                  </div>
                </div>

                {/* Extracted Evidence */}
                <div className="mb-3">
                  <div className="small fw-bold text-dark mb-1">Identified Required Skills:</div>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="badge bg-success">✓ Python</span>
                    <span className="badge bg-success">✓ FastAPI</span>
                    <span className="badge bg-success">✓ PostgreSQL</span>
                    <span className="badge bg-success">✓ REST API</span>
                    <span className="badge bg-info text-dark">★ Docker</span>
                  </div>
                </div>

                <div className="small bg-teal-subtle text-teal p-2.5 rounded-2" style={{ fontSize: '12px', backgroundColor: '#CCFBF1', color: '#0F766E' }}>
                  <strong>Evidence Snippet:</strong> "...Senior Python Backend Engineer with expertise in FastAPI microservices and PostgreSQL database architecture..."
                </div>
              </div>
            </div>
          </div>
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

      {/* Features Grid */}
      <section id="features" className="py-5 bg-light border-bottom">
        <div className="container py-4">
          <div className="text-center mb-5" style={{ maxWidth: '650px', margin: '0 auto' }}>
            <span className="badge bg-primary-subtle text-primary px-3 py-1.5 mb-2">Platform Capabilities</span>
            <h2 className="fw-bold text-dark">Comprehensive Recruiter Features</h2>
            <p className="text-secondary small">
              End-to-end recruitment management from vacancy publishing to final candidate shortlisting and compliance auditing.
            </p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 card-hover">
                <div className="p-3 rounded-3 bg-teal-subtle text-teal d-inline-flex mb-3" style={{ width: 'fit-content', backgroundColor: '#CCFBF1', color: '#0F766E' }}>
                  <FileSearch size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">PyMuPDF Text Extractor</h5>
                <p className="small text-secondary m-0">
                  Page-by-page PDF extraction preserving critical technical symbols (C++, C#, .NET, Node.js) with quality threshold checks for scanned or unreadable files.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 card-hover">
                <div className="p-3 rounded-3 bg-primary-subtle text-primary d-inline-flex mb-3" style={{ width: 'fit-content' }}>
                  <Sparkles size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">spaCy NLP Skill Miner</h5>
                <p className="small text-secondary m-0">
                  Curated technical skill dictionary mapping synonyms (e.g. Postgres, PSQL $\rightarrow$ PostgreSQL) with extracted ~60 character evidence context snippets.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 card-hover">
                <div className="p-3 rounded-3 bg-warning-subtle text-warning d-inline-flex mb-3" style={{ width: 'fit-content' }}>
                  <Award size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Ranking Leaderboard</h5>
                <p className="small text-secondary m-0">
                  Deterministic tie-breaking candidate review board with color-coded score badges, matched vs missing required skills, and click-to-explain modals.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 card-hover">
                <div className="p-3 rounded-3 bg-info-subtle text-info d-inline-flex mb-3" style={{ width: 'fit-content' }}>
                  <GitBranch size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Recruitment Pipeline</h5>
                <p className="small text-secondary m-0">
                  Interactive stage board supporting 8 candidate progression stages, 1-5 star recruiter qualitative rating, and interview observation logs.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 card-hover">
                <div className="p-3 rounded-3 bg-success-subtle text-success d-inline-flex mb-3" style={{ width: 'fit-content' }}>
                  <Database size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">MongoDB Atlas Cloud</h5>
                <p className="small text-secondary m-0">
                  Direct connection to MongoDB Atlas Cluster0 with collections for users, candidates, resumes, applications, and tamper-evident audit logs.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 card-hover">
                <div className="p-3 rounded-3 bg-danger-subtle text-danger d-inline-flex mb-3" style={{ width: 'fit-content' }}>
                  <ShieldCheck size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Responsible AI & Privacy</h5>
                <p className="small text-secondary m-0">
                  Protected characteristics (age, gender, photo, background) are strictly excluded from mathematical ranking. No autonomous rejections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section id="architecture" className="py-5 bg-white border-bottom">
        <div className="container py-3">
          <div className="text-center mb-4">
            <h4 className="fw-bold text-dark m-0">Full-Stack Technology Architecture</h4>
            <p className="text-muted small">Standard open-source modern stack designed for reliability and scalability</p>
          </div>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
            {[
              "React 18", "TypeScript", "Vite", "Bootstrap 5", "Recharts", "Lucide",
              "Python 3.12", "FastAPI", "MongoDB Atlas", "PyMuPDF", "spaCy", "Scikit-Learn", "Bcrypt", "JWT"
            ].map((tech) => (
              <span key={tech} className="badge bg-light text-dark border px-3 py-2 fs-6 fw-normal">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-gradient-dark-hero text-white py-5 text-center mt-auto">
        <div className="container py-4">
          <h2 className="fw-bold mb-3">Ready to Experience TalentBridge?</h2>
          <p className="text-secondary max-w-600 mx-auto mb-4" style={{ maxWidth: '540px' }}>
            Sign in as an Administrator, Recruiter, or HR Manager to view live candidate scorings and pipeline workflows.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link 
              to="/login" 
              className="btn btn-teal px-4 py-2.5 rounded-pill fs-6 d-flex align-items-center gap-2"
            >
              Sign In to Recruiter Portal <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mt-4 pt-3 border-top border-secondary small text-muted">
            TalentBridge – Academic Project Implementation & Viva Demonstration Baseline © 2026
          </div>
        </div>
      </section>
    </div>
  );
};

