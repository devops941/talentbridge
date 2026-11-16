import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  GitBranch,
  MessageSquare,
  Star,
  ArrowRight,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Sparkles,
  UserCheck,
  Briefcase,
  Clock,
  CheckCircle2,
  Award,
  FileText,
  X,
  TrendingUp,
  User
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  skills: Array<{
    skill_name: string;
    requirement_type: string;
  }>;
}

interface ApplicationItem {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  resume_id?: string;
  score: number;
  skill_score: number;
  text_score: number;
  current_stage: string;
  applied_at: string;
  matched_skills: string[];
}

interface CandidateReview {
  id: string;
  reviewer_name: string;
  rating: number;
  notes: string;
  created_at: string;
}

const STAGES = [
  { id: 'Application Received', label: 'Application Received', color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' },
  { id: 'Resume Under Review', label: 'Resume Review', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { id: 'Shortlisted', label: 'Shortlisted', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  { id: 'Interview Scheduled', label: 'Interview Scheduled', color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE' },
  { id: 'Interview Completed', label: 'Interview Completed', color: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF' },
  { id: 'Selected', label: 'Selected / Offer', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  { id: 'On Hold', label: 'On Hold', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { id: 'Not Selected', label: 'Not Selected', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
];

export const Pipeline: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllStages, setShowAllStages] = useState(false);

  // Drag & Drop State
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Review Modal State
  const [activeApp, setActiveApp] = useState<ApplicationItem | null>(null);
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState('');
  const [reviewHistory, setReviewHistory] = useState<CandidateReview[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Quick Add Candidate Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [addingCandidate, setAddingCandidate] = useState(false);

  // Load jobs and candidate list on mount
  useEffect(() => {
    loadJobs();
    api.get('/candidates').then((res) => setAllCandidates(res.data)).catch(console.error);
  }, []);

  const loadJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
      if (res.data.length > 0) {
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

  const fetchApplications = async (jobId: string) => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await api.get(`/applications/job/${jobId}/rankings`);
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to load applications for pipeline', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      fetchApplications(selectedJobId);
    }
  }, [selectedJobId]);

  // Stage change API call
  const handleStageChange = async (appId: string, toStage: string) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((a) => (a.application_id === appId ? { ...a, current_stage: toStage } : a))
    );
    try {
      await api.patch(`/pipeline/applications/${appId}/stage`, { to_stage: toStage });
    } catch (err) {
      alert('Failed to update stage on server.');
      if (selectedJobId) fetchApplications(selectedJobId);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('text/plain', appId);
    setDraggedAppId(appId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    setDraggedAppId(null);

    if (appId) {
      const currentApp = applications.find((a) => a.application_id === appId);
      if (currentApp && currentApp.current_stage !== targetStage) {
        await handleStageChange(appId, targetStage);
      }
    }
  };

  // Populate Pipeline (Hydration)
  const handlePopulatePipeline = async () => {
    if (!selectedJobId) return;
    setHydrating(true);
    try {
      const res = await api.post(`/applications/job/${selectedJobId}/score-all`);
      setApplications(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to populate pipeline.');
    } finally {
      setHydrating(false);
    }
  };

  // Quick Add Candidate
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !selectedCandidateId) return;
    setAddingCandidate(true);
    try {
      await api.post(`/applications/job/${selectedJobId}/evaluate-candidate`, {
        candidate_id: selectedCandidateId,
      });
      setShowAddModal(false);
      setSelectedCandidateId('');
      await fetchApplications(selectedJobId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Candidate does not have an uploaded resume.');
    } finally {
      setAddingCandidate(false);
    }
  };

  // Open Review Modal
  const openReviewModal = async (app: ApplicationItem) => {
    setActiveApp(app);
    setRating(4);
    setNotes('');
    try {
      const res = await api.get(`/pipeline/applications/${app.application_id}/reviews`);
      setReviewHistory(res.data);
    } catch (err) {
      setReviewHistory([]);
    }
  };

  // Submit Review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;
    setSubmittingReview(true);
    try {
      await api.post(`/pipeline/applications/${activeApp.application_id}/reviews`, {
        rating: Number(rating),
        notes,
      });
      // Refresh reviews
      const res = await api.get(`/pipeline/applications/${activeApp.application_id}/reviews`);
      setReviewHistory(res.data);
      setNotes('');
    } catch (err) {
      alert('Failed to save review note.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filtered applications
  const filteredApps = applications.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.candidate_name.toLowerCase().includes(q) ||
      a.candidate_email.toLowerCase().includes(q) ||
      a.matched_skills?.some((s) => s.toLowerCase().includes(q))
    );
  });

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  // Velocity Metrics
  const totalCount = applications.length;
  const shortlistedCount = applications.filter((a) => a.current_stage === 'Shortlisted').length;
  const interviewingCount = applications.filter((a) => a.current_stage.includes('Interview')).length;
  const selectedCount = applications.filter((a) => a.current_stage === 'Selected').length;
  const shortlistRate = totalCount > 0 ? ((shortlistedCount / totalCount) * 100).toFixed(0) : '0';

  const visibleStages = showAllStages ? STAGES : STAGES.slice(0, 6);

  return (
    <div className="container-fluid px-0 pb-5">
      {/* Title & Job Selection Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>
              Recruitment Pipeline Board
            </h2>
            <span className="badge rounded-pill px-3 py-1 bg-teal-subtle text-teal fw-semibold border border-teal-subtle">
              Drag & Drop Kanban
            </span>
          </div>
          <p className="text-secondary small mb-0 mt-1">
            Track, advance, and review candidates across end-to-end recruitment stages.
          </p>
        </div>

        {/* Job Selection Dropdown */}
        <div style={{ minWidth: '320px' }}>
          <label className="form-label small fw-semibold text-secondary mb-1">Target Opening</label>
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

      {/* Selected Job Context Card */}
      {selectedJob && (
        <div className="tb-card p-3 mb-4 bg-white border-start border-4" style={{ borderLeftColor: '#00A896' }}>
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
                <div className="text-muted small mt-1">
                  Location: <strong>{selectedJob.location || 'Remote'}</strong> &bull; Total Applicants: <strong>{totalCount}</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-outline-teal btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-3 fw-semibold"
                style={{ color: '#00A896', borderColor: '#00A896' }}
              >
                <Plus size={15} /> Add Candidate
              </button>
              <button
                onClick={handlePopulatePipeline}
                disabled={hydrating}
                className="btn btn-teal btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-white fw-semibold shadow-sm"
                style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
              >
                <Sparkles size={15} className={hydrating ? 'spin' : ''} />
                {hydrating ? 'Scoring Pool...' : 'Score & Populate Pipeline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Velocity KPI Bar */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <GitBranch size={22} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Active In Pipeline</div>
              <div className="fs-4 fw-bold text-dark">{totalCount}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F0FDFA', color: '#0D9488' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Shortlist Conversion</div>
              <div className="fs-4 fw-bold text-dark">{shortlistRate}% <span className="text-muted fw-normal small">({shortlistedCount})</span></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FAF5FF', color: '#9333EA' }}>
              <Clock size={22} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">In Interview Stages</div>
              <div className="fs-4 fw-bold text-dark">{interviewingCount}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Selected / Offers</div>
              <div className="fs-4 fw-bold text-dark">{selectedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Funnel Toggle */}
      <div className="tb-card p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
          <span className="input-group-text bg-light border-end-0">
            <Search size={14} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search candidate name, email, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted fw-semibold">Stage View:</span>
          <button
            onClick={() => setShowAllStages(false)}
            className={`btn btn-sm rounded-pill px-3 py-1 ${!showAllStages ? 'btn-dark text-white fw-semibold' : 'btn-outline-secondary'}`}
            style={{ fontSize: '12px' }}
          >
            Core Active Funnel (6)
          </button>
          <button
            onClick={() => setShowAllStages(true)}
            className={`btn btn-sm rounded-pill px-3 py-1 ${showAllStages ? 'btn-dark text-white fw-semibold' : 'btn-outline-secondary'}`}
            style={{ fontSize: '12px' }}
          >
            All Stages (8)
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="tb-card p-5 text-center">
          <div className="spinner-border text-teal mb-3" style={{ color: '#00A896' }} role="status"></div>
          <div className="text-secondary fw-semibold">Loading Recruitment Pipeline...</div>
        </div>
      ) : totalCount === 0 ? (
        /* Empty State Hydration Prompt */
        <div className="tb-card p-5 text-center text-muted">
          <div className="rounded-circle p-4 d-inline-flex mb-3" style={{ backgroundColor: '#F8FAFC', color: '#64748B' }}>
            <GitBranch size={48} />
          </div>
          <h5 className="fw-bold text-dark mb-1">No Active Candidates in Pipeline</h5>
          <p className="small text-secondary mb-3" style={{ maxWidth: '480px', margin: '0 auto' }}>
            There are currently no applicant cards in the recruitment stages for <strong>{selectedJob?.title}</strong>. Click below to automatically evaluate and pull all candidates with resumes into the pipeline!
          </p>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <button
              onClick={handlePopulatePipeline}
              disabled={hydrating}
              className="btn btn-teal px-4 py-2 text-white fw-semibold rounded-3 shadow-sm"
              style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
            >
              <Sparkles size={16} className="me-2 inline" />
              {hydrating ? 'Evaluating Candidates...' : 'Score & Populate Pipeline'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-3"
            >
              <Plus size={16} className="me-1 inline" /> Add Candidate Manually
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Drag-and-Drop Columns */
        <div className="d-flex gap-3 overflow-auto pb-4" style={{ minHeight: '680px' }}>
          {visibleStages.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.current_stage === stage.id);
            const isDropActive = dragOverStage === stage.id;
            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`rounded-4 p-3 d-flex flex-column transition-all ${
                  isDropActive ? 'shadow-md border-primary' : ''
                }`}
                style={{
                  width: '310px',
                  minWidth: '310px',
                  backgroundColor: isDropActive ? '#E6FFFA' : '#F8FAFC',
                  border: isDropActive ? '2px dashed #00A896' : '1px solid #E2E8F0',
                  maxHeight: '78vh',
                  overflowY: 'auto',
                }}
              >
                {/* Column Header */}
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle d-inline-block" style={{ width: '10px', height: '10px', backgroundColor: stage.color }}></span>
                    <h6 className="fw-bold text-dark small m-0">{stage.label}</h6>
                  </div>
                  <span
                    className="badge rounded-pill fw-bold"
                    style={{
                      backgroundColor: stage.bg,
                      color: stage.color,
                      border: `1px solid ${stage.border}`,
                      fontSize: '11px',
                    }}
                  >
                    {stageApps.length}
                  </span>
                </div>

                {/* Candidate Cards Stack */}
                <div className="d-flex flex-column gap-2.5 flex-grow-1">
                  {stageApps.map((app) => {
                    const scoreColor = app.score >= 70 ? '#10B981' : app.score >= 50 ? '#0D9488' : '#F59E0B';
                    return (
                      <div
                        key={app.application_id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.application_id)}
                        className="p-3 rounded-3 bg-white border shadow-xs hover-shadow-sm transition-all"
                        style={{
                          cursor: 'grab',
                          borderColor: '#E2E8F0',
                          borderLeft: `4px solid ${scoreColor}`,
                        }}
                      >
                        {/* Header: Candidate & Score Badge */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2 overflow-hidden me-1">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                              style={{ width: '30px', height: '30px', backgroundColor: '#0B1528', fontSize: '11px' }}
                            >
                              {app.candidate_name ? app.candidate_name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div className="overflow-hidden">
                              <div className="fw-bold text-dark small text-truncate leading-tight">
                                {app.candidate_name}
                              </div>
                              <div className="text-muted text-truncate" style={{ fontSize: '10.5px' }}>
                                {app.candidate_email}
                              </div>
                            </div>
                          </div>

                          <span
                            className="badge rounded-pill px-2 py-0.5 fw-bold text-white shadow-xs flex-shrink-0"
                            style={{ backgroundColor: scoreColor, fontSize: '11px' }}
                            title={`Suitability Score: ${app.score.toFixed(1)}%`}
                          >
                            {app.score.toFixed(0)}%
                          </span>
                        </div>

                        {/* Matched Skills Chips */}
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {app.matched_skills?.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="badge bg-light text-secondary border px-1.5 py-0.5"
                              style={{ fontSize: '10px' }}
                            >
                              {s}
                            </span>
                          ))}
                          {app.matched_skills?.length > 3 && (
                            <span className="badge bg-light text-muted" style={{ fontSize: '9px' }}>
                              +{app.matched_skills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-2 border-top d-flex align-items-center justify-content-between">
                          <button
                            onClick={() => openReviewModal(app)}
                            className="btn btn-sm btn-link text-decoration-none p-0 d-flex align-items-center gap-1 text-secondary"
                            style={{ fontSize: '11px' }}
                            title="Add Interview Review Notes"
                          >
                            <MessageSquare size={13} className="text-teal" style={{ color: '#00A896' }} />
                            <span>Notes</span>
                          </button>

                          {/* Quick Stage Progression Dropdown */}
                          <div className="d-flex align-items-center gap-1">
                            <select
                              className="form-select form-select-sm py-0 px-1 border-0 text-muted"
                              style={{ fontSize: '10.5px', maxWidth: '120px', backgroundColor: '#F8FAFC' }}
                              value={app.current_stage}
                              onChange={(e) => handleStageChange(app.application_id, e.target.value)}
                            >
                              {STAGES.map((s) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {stageApps.length === 0 && (
                    <div className="text-center py-5 text-muted small" style={{ border: '1px dashed #CBD5E1', borderRadius: '8px' }}>
                      <div className="fst-italic opacity-75">Drop candidate here</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERVIEWER REVIEW & FEEDBACK MODAL */}
      {activeApp && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(11, 21, 40, 0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header p-4" style={{ backgroundColor: '#0B1528', color: '#FFFFFF' }}>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle p-2.5 d-flex align-items-center justify-content-center text-dark fw-bold"
                    style={{ backgroundColor: '#00D2B4', width: '42px', height: '42px' }}
                  >
                    {activeApp.candidate_name ? activeApp.candidate_name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold m-0">{activeApp.candidate_name}</h5>
                    <div className="small text-white-50">
                      Stage: <strong className="text-white">{activeApp.current_stage}</strong> &bull; Suitability Score: <strong>{activeApp.score.toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setActiveApp(null)}></button>
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="row g-4">
                  {/* Left: Add New Review Form */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-white rounded-3 border shadow-xs h-100">
                      <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                        <MessageSquare size={16} className="text-teal" style={{ color: '#00A896' }} />
                        Add Interviewer Evaluation
                      </h6>

                      <form onSubmit={handleAddReview}>
                        {/* Interactive Star Rating */}
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-secondary mb-1">Candidate Rating (1 to 5 Stars)</label>
                          <div className="d-flex align-items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                className="btn btn-link p-0 text-decoration-none"
                              >
                                <Star
                                  size={24}
                                  fill={star <= rating ? '#F59E0B' : 'none'}
                                  color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                                />
                              </button>
                            ))}
                            <span className="fw-bold text-dark small ms-2">{rating} / 5 Stars</span>
                          </div>
                        </div>

                        {/* Review Notes */}
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-secondary">
                            Evaluation Notes & Recommendations <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control small"
                            rows={4}
                            required
                            placeholder="Enter notes regarding technical competency, communication skills, and hiring decision..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingReview || !notes.trim()}
                          className="btn btn-teal w-100 py-2 fw-semibold text-white rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                          style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
                        >
                          <Star size={16} />
                          {submittingReview ? 'Recording...' : 'Submit Evaluation Note'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right: Chronological Review History */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-white rounded-3 border shadow-xs h-100 d-flex flex-column">
                      <h6 className="fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
                        <span>Evaluation History</span>
                        <span className="badge bg-light text-secondary border small">{reviewHistory.length} Notes</span>
                      </h6>

                      <div className="d-flex flex-column gap-2 overflow-auto flex-grow-1" style={{ maxHeight: '280px' }}>
                        {reviewHistory.length === 0 ? (
                          <div className="text-center py-5 text-muted small">
                            No review notes recorded yet for this candidate.
                          </div>
                        ) : (
                          reviewHistory.map((rev) => (
                            <div key={rev.id} className="p-2.5 rounded-2 bg-light border small">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <span className="fw-semibold text-dark">{rev.reviewer_name}</span>
                                <div className="d-flex align-items-center gap-0.5">
                                  {[...Array(rev.rating)].map((_, i) => (
                                    <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-secondary small mb-1" style={{ fontSize: '11.5px', whiteSpace: 'pre-wrap' }}>
                                {rev.notes}
                              </p>
                              <div className="text-muted" style={{ fontSize: '10px' }}>
                                {new Date(rev.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-3 px-3"
                  onClick={() => setActiveApp(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD CANDIDATE MODAL */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(11, 21, 40, 0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header p-4" style={{ backgroundColor: '#0B1528', color: '#FFFFFF' }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <UserCheck size={20} className="text-teal" style={{ color: '#00D2B4' }} />
                  Add Candidate to Pipeline
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>

              <form onSubmit={handleQuickAdd}>
                <div className="modal-body p-4">
                  <p className="text-secondary small mb-3">
                    Select a candidate from your directory to link them directly to <strong>{selectedJob?.title}</strong> in the Pipeline.
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Candidate Profile <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={selectedCandidateId}
                      onChange={(e) => setSelectedCandidateId(e.target.value)}
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
                  <button type="button" className="btn btn-secondary btn-sm rounded-3" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingCandidate || !selectedCandidateId}
                    className="btn btn-teal btn-sm text-white fw-semibold rounded-3 px-4 shadow-sm"
                    style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
                  >
                    {addingCandidate ? 'Adding...' : 'Add to Pipeline'}
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
