import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  Filter,
  Search,
  RefreshCw,
  UserCheck,
  FileText,
  ArrowRight,
  Clock,
  Briefcase,
  MapPin,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Percent
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  experience_range: string;
  description: string;
  status: string;
  skills: Array<{
    skill_name: string;
    requirement_type: string;
  }>;
}

interface MatchResult {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  resume_id?: string;
  score: number;
  skill_score: number;
  text_score: number;
  model_version: string;
  explanation: string;
  matched_skills: string[];
  matched_skill_details?: Array<{
    skill_name: string;
    canonical_name: string;
    evidence_text?: string;
  }>;
  missing_required_skills: string[];
  current_stage: string;
  applied_at: string;
}

const STAGES = [
  'Application Received',
  'Resume Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Interview Completed',
  'Selected',
  'Not Selected',
  'On Hold',
];

export const MatchingRanking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [rankings, setRankings] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [scoringAll, setScoringAll] = useState(false);
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null);

  // Candidates for quick-evaluate modal
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [evalCandidateId, setEvalCandidateId] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [stageUpdatingId, setStageUpdatingId] = useState<string | null>(null);

  // Load jobs and candidates
  useEffect(() => {
    loadJobs();
    api.get('/candidates').then((res) => setAllCandidates(res.data)).catch(console.error);
  }, []);

  const loadJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
      if (res.data.length > 0) {
        // Use query param if provided, otherwise default to first job
        const paramJobId = searchParams.get('jobId');
        const defaultId = paramJobId && res.data.some((j: Job) => j.id === paramJobId)
          ? paramJobId
          : res.data[0].id;
        setSelectedJobId(defaultId);
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
    }
  };

  // Load rankings whenever selected job changes
  useEffect(() => {
    if (selectedJobId) {
      loadRankings(selectedJobId);
    }
  }, [selectedJobId]);

  const loadRankings = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/job/${jobId}/rankings`);
      setRankings(res.data);
    } catch (err) {
      console.error('Failed to load job rankings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreAll = async () => {
    if (!selectedJobId) return;
    setScoringAll(true);
    try {
      const res = await api.post(`/applications/job/${selectedJobId}/score-all`);
      setRankings(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to recalculate match rankings.');
    } finally {
      setScoringAll(false);
    }
  };

  const handleQuickEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !evalCandidateId) return;
    setEvaluating(true);
    try {
      const res = await api.post(`/applications/job/${selectedJobId}/evaluate-candidate`, {
        candidate_id: evalCandidateId
      });
      setShowEvaluateModal(false);
      setEvalCandidateId('');
      // Reload rankings
      await loadRankings(selectedJobId);
      setSelectedResult(res.data); // Open modal with result
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Candidate does not have an uploaded resume to evaluate.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleStageChange = async (applicationId: string, newStage: string) => {
    setStageUpdatingId(applicationId);
    try {
      await api.patch(`/pipeline/applications/${applicationId}/stage`, {
        to_stage: newStage,
      });
      setRankings((prev) =>
        prev.map((r) =>
          r.application_id === applicationId ? { ...r, current_stage: newStage } : r
        )
      );
      if (selectedResult && selectedResult.application_id === applicationId) {
        setSelectedResult((prev) => prev ? { ...prev, current_stage: newStage } : null);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update candidate stage.');
    } finally {
      setStageUpdatingId(null);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  // Filter rankings
  const filteredRankings = rankings.filter((r) => {
    // Search query
    const matchesSearch =
      r.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.candidate_email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Tier filter
    if (tierFilter === 'HIGH' && r.score < 70) return false;
    if (tierFilter === 'MODERATE' && (r.score < 50 || r.score >= 70)) return false;
    if (tierFilter === 'LOW' && r.score >= 50) return false;

    // Stage filter
    if (stageFilter !== 'ALL' && r.current_stage !== stageFilter) return false;

    return true;
  });

  // Top metrics calculations
  const totalApplicants = rankings.length;
  const topScore = rankings.length > 0 ? Math.max(...rankings.map((r) => r.score)) : 0;
  const avgScore =
    rankings.length > 0
      ? (rankings.reduce((acc, r) => acc + r.score, 0) / rankings.length).toFixed(1)
      : '0.0';
  const shortlistedCount = rankings.filter(
    (r) => r.current_stage === 'Shortlisted' || r.current_stage.includes('Interview') || r.current_stage === 'Selected'
  ).length;

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="badge rounded-pill px-2.5 py-1 text-dark fw-bold d-inline-flex align-items-center gap-1 shadow-xs" style={{ backgroundColor: '#FEF08A', border: '1px solid #FACC15', fontSize: '12px' }}>
          🥇 #1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="badge rounded-pill px-2.5 py-1 text-dark fw-bold d-inline-flex align-items-center gap-1 shadow-xs" style={{ backgroundColor: '#E2E8F0', border: '1px solid #CBD5E1', fontSize: '12px' }}>
          🥈 #2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="badge rounded-pill px-2.5 py-1 text-dark fw-bold d-inline-flex align-items-center gap-1 shadow-xs" style={{ backgroundColor: '#FFEDD5', border: '1px solid #FDBA74', fontSize: '12px' }}>
          🥉 #3
        </span>
      );
    }
    return (
      <span className="badge rounded-pill px-2 py-1 bg-light text-secondary border fw-semibold" style={{ fontSize: '11.5px' }}>
        #{index + 1}
      </span>
    );
  };

  return (
    <div className="container-fluid px-0 pb-5">
      {/* Top Header & Job Selector */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>
              Candidate Scoring & Ranking Leaderboard
            </h2>
            <span className="badge rounded-pill px-3 py-1 bg-teal-subtle text-teal fw-semibold border border-teal-subtle">
              70/30 Explainable AI
            </span>
          </div>
          <p className="text-secondary small mb-0 mt-1">
            Deterministic suitability ranking based on 70% Curated Skill Coverage + 30% TF-IDF Cosine Similarity.
          </p>
        </div>

        {/* Job Selection Dropdown */}
        <div style={{ minWidth: '320px' }}>
          <label className="form-label small fw-semibold text-secondary mb-1">Target Job Vacancy</label>
          <select
            className="form-select border-teal shadow-sm fw-semibold"
            style={{ borderColor: '#00A896', backgroundColor: '#FFFFFF' }}
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department}) &bull; {j.status || 'OPEN'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Job Brief Card */}
      {selectedJob && (
        <div className="tb-card p-3 mb-4 bg-white border-start border-4 border-teal" style={{ borderLeftColor: '#00A896' }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 p-2.5 d-flex align-items-center justify-content-center text-white" style={{ backgroundColor: '#0B1528' }}>
                <Briefcase size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="fw-bold text-dark m-0">{selectedJob.title}</h5>
                  <span className={`badge px-2.5 py-1 rounded-pill ${selectedJob.status === 'CLOSED' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`} style={{ fontSize: '11px' }}>
                    {selectedJob.status === 'CLOSED' ? 'CLOSED' : 'OPEN VACANCY'}
                  </span>
                  <span className="badge bg-light text-secondary border small" style={{ fontSize: '11px' }}>
                    {selectedJob.department}
                  </span>
                </div>
                <div className="text-muted small d-flex align-items-center gap-3 mt-1">
                  <span><MapPin size={13} className="inline me-1" /> {selectedJob.location || 'Remote'}</span>
                  <span>&bull;</span>
                  <span><Clock size={13} className="inline me-1" /> {selectedJob.experience_range || '1-3 yrs'}</span>
                </div>
              </div>
            </div>

            {/* Required Skills Badges */}
            <div className="d-flex flex-wrap align-items-center gap-1.5" style={{ maxWidth: '480px' }}>
              <span className="small text-muted fw-semibold me-1">Required Skills (70%):</span>
              {selectedJob.skills
                ?.filter((s) => s.requirement_type === 'REQUIRED')
                .map((s) => (
                  <span key={s.skill_name} className="badge bg-teal-subtle text-teal border border-teal-subtle small px-2 py-1" style={{ backgroundColor: '#E6FFFA', color: '#00A896', fontSize: '11px' }}>
                    {s.skill_name}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Operational Metrics Bar */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Evaluated Candidates</div>
              <div className="fs-4 fw-bold text-dark">{totalApplicants}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <Award size={24} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Top Match Score</div>
              <div className="fs-4 fw-bold text-dark">{topScore.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F0FDFA', color: '#00A896' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Average Match Score</div>
              <div className="fs-4 fw-bold text-dark">{avgScore}%</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Shortlisted / Interview</div>
              <div className="fs-4 fw-bold text-dark">{shortlistedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Actions & Filters */}
      <div className="tb-card p-3 mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Search & Tier Filters */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: '240px' }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search candidate or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${tierFilter === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setTierFilter('ALL')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn ${tierFilter === 'HIGH' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setTierFilter('HIGH')}
              >
                Match &ge; 70%
              </button>
              <button
                type="button"
                className={`btn ${tierFilter === 'MODERATE' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setTierFilter('MODERATE')}
              >
                50% &ndash; 69%
              </button>
              <button
                type="button"
                className={`btn ${tierFilter === 'LOW' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                onClick={() => setTierFilter('LOW')}
              >
                &lt; 50%
              </button>
            </div>

            {/* Stage Filter */}
            <select
              className="form-select form-select-sm"
              style={{ width: '180px' }}
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="ALL">All Pipeline Stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => setShowEvaluateModal(true)}
              className="btn btn-outline-teal btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3 fw-semibold"
              style={{ color: '#00A896', borderColor: '#00A896' }}
            >
              <UserCheck size={15} /> Evaluate Candidate
            </button>

            <button
              onClick={handleScoreAll}
              disabled={scoringAll}
              className="btn btn-teal btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-white fw-semibold shadow-sm"
              style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
            >
              <Sparkles size={15} className={scoringAll ? 'spin' : ''} />
              {scoringAll ? 'Scoring Candidates...' : 'Score All Available Candidates'}
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Canvas */}
      {loading ? (
        <div className="tb-card p-5 text-center">
          <div className="spinner-border text-teal mb-3" style={{ color: '#00A896' }} role="status"></div>
          <div className="text-secondary fw-semibold">Loading Candidate Suitability Rankings...</div>
        </div>
      ) : filteredRankings.length === 0 ? (
        <div className="tb-card p-5 text-center text-muted">
          <div className="rounded-circle p-4 d-inline-flex mb-3" style={{ backgroundColor: '#F8FAFC', color: '#64748B' }}>
            <Award size={48} />
          </div>
          <h5 className="fw-bold text-dark mb-1">No Candidates Ranked For This Opening</h5>
          <p className="small text-secondary mb-3" style={{ maxWidth: '480px', margin: '0 auto' }}>
            Candidates must apply or be evaluated against this job. Click the button below to score all candidates with uploaded resumes in MongoDB Atlas against this opening!
          </p>
          <button
            onClick={handleScoreAll}
            disabled={scoringAll}
            className="btn btn-teal px-4 py-2 text-white fw-semibold rounded-3 shadow-sm"
            style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
          >
            <Sparkles size={16} className="me-2 inline" />
            {scoringAll ? 'Evaluating...' : 'Score All Candidates Against This Job'}
          </button>
        </div>
      ) : (
        <div className="tb-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light border-bottom">
                <tr className="text-secondary" style={{ fontSize: '12px' }}>
                  <th className="px-4 py-3" style={{ width: '90px' }}>Rank</th>
                  <th style={{ minWidth: '220px' }}>Candidate</th>
                  <th style={{ minWidth: '170px' }}>Suitability Score</th>
                  <th style={{ minWidth: '160px' }}>Score Breakdown</th>
                  <th style={{ minWidth: '220px' }}>Matched Required Skills</th>
                  <th style={{ minWidth: '170px' }}>Missing Required</th>
                  <th style={{ minWidth: '180px' }}>Recruitment Stage</th>
                  <th className="text-end px-4" style={{ width: '130px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRankings.map((r, idx) => {
                  const scoreColor = r.score >= 70 ? '#10B981' : r.score >= 50 ? '#0D9488' : '#F59E0B';
                  return (
                    <tr key={r.application_id}>
                      {/* Rank Medal */}
                      <td className="px-4 py-3">
                        {getRankBadge(idx)}
                      </td>

                      {/* Candidate Details */}
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                            style={{
                              width: '36px',
                              height: '36px',
                              backgroundColor: '#0B1528',
                              fontSize: '13px',
                            }}
                          >
                            {r.candidate_name ? r.candidate_name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{r.candidate_name}</div>
                            <div className="text-muted small" style={{ fontSize: '11px' }}>{r.candidate_email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Combined Suitability Score & Progress Bar */}
                      <td>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span
                            className="badge rounded-pill px-2.5 py-1 fw-bold text-white shadow-xs"
                            style={{ backgroundColor: scoreColor, fontSize: '13px' }}
                          >
                            {r.score.toFixed(1)}%
                          </span>
                          <span className="small text-muted" style={{ fontSize: '11px' }}>
                            {r.score >= 70 ? 'Strong Fit' : r.score >= 50 ? 'Moderate' : 'Low Match'}
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px', width: '140px', backgroundColor: '#E2E8F0' }}>
                          <div
                            className="progress-bar rounded-pill"
                            role="progressbar"
                            style={{ width: `${Math.min(r.score, 100)}%`, backgroundColor: scoreColor }}
                          ></div>
                        </div>
                      </td>

                      {/* Score Breakdown (70/30) */}
                      <td>
                        <div className="small text-secondary" style={{ fontSize: '11.5px' }}>
                          <div>Skill: <strong className="text-dark">{r.skill_score.toFixed(1)}%</strong> <span className="text-muted" style={{ fontSize: '10px' }}>(70% wt)</span></div>
                          <div>Text: <strong className="text-dark">{r.text_score.toFixed(1)}%</strong> <span className="text-muted" style={{ fontSize: '10px' }}>(30% wt)</span></div>
                        </div>
                      </td>

                      {/* Matched Required Skills */}
                      <td>
                        <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '240px' }}>
                          {r.matched_skills.length === 0 ? (
                            <span className="text-muted small fst-italic">No required skills matched</span>
                          ) : (
                            r.matched_skills.map((s) => (
                              <span key={s} className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1" style={{ fontSize: '11px' }}>
                                &check; {s}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Missing Required Skills */}
                      <td>
                        <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '200px' }}>
                          {r.missing_required_skills.length === 0 ? (
                            <span className="badge bg-success-subtle text-success small px-2 py-1">
                              &check; 100% Covered
                            </span>
                          ) : (
                            r.missing_required_skills.map((s) => (
                              <span key={s} className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1" style={{ fontSize: '11px' }}>
                                &times; {s}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Inline Stage Selector */}
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <select
                            className="form-select form-select-sm fw-semibold"
                            style={{
                              fontSize: '11.5px',
                              backgroundColor: r.current_stage === 'Shortlisted' ? '#ECFDF5' : r.current_stage === 'Selected' ? '#E6FFFA' : '#F8FAFC',
                              borderColor: r.current_stage === 'Shortlisted' ? '#A7F3D0' : '#E2E8F0',
                              color: r.current_stage === 'Shortlisted' ? '#065F46' : '#334155'
                            }}
                            value={r.current_stage}
                            disabled={stageUpdatingId === r.application_id}
                            onChange={(e) => handleStageChange(r.application_id, e.target.value)}
                          >
                            {STAGES.map((stg) => (
                              <option key={stg} value={stg}>{stg}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="text-end px-4">
                        <button
                          onClick={() => setSelectedResult(r)}
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 rounded-3 px-2.5 py-1.5 fw-semibold"
                          style={{ fontSize: '12px' }}
                        >
                          <Info size={14} className="text-teal" style={{ color: '#00A896' }} /> Explain
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEEP EXPLAINABILITY & EVIDENCE MODAL */}
      {selectedResult && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(11, 21, 40, 0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header text-white p-4" style={{ backgroundColor: '#0B1528' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2.5 d-flex align-items-center justify-content-center text-dark fw-bold" style={{ backgroundColor: '#00D2B4', width: '42px', height: '42px' }}>
                    {selectedResult.candidate_name ? selectedResult.candidate_name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold m-0">{selectedResult.candidate_name}</h5>
                    <div className="small text-white-50">{selectedResult.candidate_email} &bull; Applied: {new Date(selectedResult.applied_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedResult(null)}></button>
              </div>

              <div className="modal-body p-4 bg-light">
                {/* Mathematical Formula Banner */}
                <div className="p-3 rounded-3 bg-white border mb-3 shadow-xs">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                      <ShieldCheck size={16} className="text-teal" style={{ color: '#00A896' }} />
                      70/30 Explainable Mathematical Breakdown
                    </span>
                    <span className="badge bg-light text-secondary border font-monospace small">
                      {selectedResult.model_version}
                    </span>
                  </div>

                  {/* KaTeX / Math Formula Rendering */}
                  <div className="p-2.5 rounded-2 bg-light font-monospace small text-dark border mb-2 text-center" style={{ fontSize: '13px' }}>
                    Final Score = (0.70 &times; {selectedResult.skill_score}%) + (0.30 &times; {selectedResult.text_score}%) = <strong className="text-teal" style={{ color: '#00A896' }}>{selectedResult.score}%</strong>
                  </div>

                  <div className="row g-2 text-center pt-2">
                    <div className="col-4">
                      <div className="p-2.5 rounded border bg-white">
                        <div className="text-muted small" style={{ fontSize: '11px' }}>Skill Coverage (70%)</div>
                        <div className="fs-5 fw-bold text-teal" style={{ color: '#00A896' }}>{selectedResult.skill_score}%</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2.5 rounded border bg-white">
                        <div className="text-muted small" style={{ fontSize: '11px' }}>TF-IDF Cosine (30%)</div>
                        <div className="fs-5 fw-bold text-primary">{selectedResult.text_score}%</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2.5 rounded border text-white" style={{ backgroundColor: selectedResult.score >= 70 ? '#059669' : '#0D9488' }}>
                        <div className="small" style={{ fontSize: '11px', opacity: 0.9 }}>Suitability Score</div>
                        <div className="fs-5 fw-bold">{selectedResult.score}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence-Backed Required Skills Verification */}
                <div className="p-3 rounded-3 bg-white border mb-3 shadow-xs">
                  <h6 className="fw-bold text-dark mb-2 small d-flex align-items-center justify-content-between">
                    <span>Verified Required Skills & Resume Evidence:</span>
                    <span className="text-muted font-normal" style={{ fontSize: '11px' }}>
                      {selectedResult.matched_skills.length} matched / {selectedResult.missing_required_skills.length} missing
                    </span>
                  </h6>

                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {/* Matched Skills with Context Quotes */}
                    {selectedResult.matched_skill_details && selectedResult.matched_skill_details.length > 0 ? (
                      selectedResult.matched_skill_details.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-2 bg-light border small">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold text-success d-flex align-items-center gap-1">
                              <CheckCircle2 size={14} /> {item.skill_name}
                            </span>
                            <span className="badge bg-success-subtle text-success small" style={{ fontSize: '10px' }}>
                              Canonical: {item.canonical_name}
                            </span>
                          </div>
                          {item.evidence_text ? (
                            <div className="text-secondary fst-italic" style={{ fontSize: '11.5px', borderLeft: '3px solid #10B981', paddingLeft: '8px' }}>
                              &ldquo;{item.evidence_text}&rdquo;
                            </div>
                          ) : (
                            <div className="text-muted fst-italic" style={{ fontSize: '11px' }}>Identified via ontology match in resume document.</div>
                          )}
                        </div>
                      ))
                    ) : (
                      selectedResult.matched_skills.map((s) => (
                        <div key={s} className="p-2 rounded bg-light border small text-success fw-semibold">
                          &check; {s} (Verified)
                        </div>
                      ))
                    )}

                    {/* Missing Required Skills */}
                    {selectedResult.missing_required_skills.map((s) => (
                      <div key={s} className="p-2.5 rounded-2 border bg-danger-subtle text-danger small d-flex align-items-center justify-content-between">
                        <span className="fw-bold d-flex align-items-center gap-1">
                          <XCircle size={14} /> Missing: {s}
                        </span>
                        <span className="badge bg-danger text-white small" style={{ fontSize: '10px' }}>Not Found in PDF</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Candidate Stage Progression Selector */}
                <div className="p-3 rounded-3 bg-white border d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-semibold text-dark small">Advance Candidate in Pipeline:</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>Current stage: <strong>{selectedResult.current_stage}</strong></div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={() => handleStageChange(selectedResult.application_id, 'Shortlisted')}
                      className="btn btn-sm btn-success px-3 fw-semibold rounded-3"
                      disabled={selectedResult.current_stage === 'Shortlisted'}
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleStageChange(selectedResult.application_id, 'Interview Scheduled')}
                      className="btn btn-sm btn-primary px-3 fw-semibold rounded-3"
                      disabled={selectedResult.current_stage === 'Interview Scheduled'}
                    >
                      Schedule Interview
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-3 px-3"
                  onClick={() => setSelectedResult(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-teal btn-sm text-white fw-semibold rounded-3 px-3 d-flex align-items-center gap-1"
                  style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
                  onClick={() => {
                    navigate('/resumes');
                  }}
                >
                  <FileText size={14} /> Open Resume Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK EVALUATE CANDIDATE MODAL */}
      {showEvaluateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(11, 21, 40, 0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header p-4" style={{ backgroundColor: '#0B1528', color: '#FFFFFF' }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <UserCheck size={20} className="text-teal" style={{ color: '#00D2B4' }} />
                  Evaluate Candidate Profile
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEvaluateModal(false)}></button>
              </div>

              <form onSubmit={handleQuickEvaluate}>
                <div className="modal-body p-4">
                  <p className="text-secondary small mb-3">
                    Select any candidate from your database. The system will load their parsed PDF resume from MongoDB Atlas and evaluate them against <strong>{selectedJob?.title}</strong> in real-time.
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Candidate <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={evalCandidateId}
                      onChange={(e) => setEvalCandidateId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Candidate --</option>
                      {allCandidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm rounded-3" onClick={() => setShowEvaluateModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={evaluating || !evalCandidateId}
                    className="btn btn-teal btn-sm text-white fw-semibold rounded-3 px-4 shadow-sm"
                    style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
                  >
                    {evaluating ? 'Calculating Score...' : 'Run Evaluation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
