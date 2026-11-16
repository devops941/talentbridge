import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { GitBranch, MessageSquare, Star, ArrowRight } from 'lucide-react';

export const Pipeline: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Review modal state
  const [activeApp, setActiveApp] = useState<any>(null);
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState('');

  const STAGES = [
    'Application Received',
    'Resume Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Interview Completed',
    'Selected',
    'Not Selected',
    'On Hold'
  ];

  useEffect(() => {
    api.get('/jobs').then((res) => {
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJobId(res.data[0].id);
    });
  }, []);

  const fetchApplications = () => {
    if (!selectedJobId) return;
    setLoading(true);
    api.get(`/applications/job/${selectedJobId}/rankings`)
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedJobId]);

  const handleStageChange = async (appId: string, toStage: string) => {
    try {
      await api.patch(`/pipeline/applications/${appId}/stage`, { to_stage: toStage });
      fetchApplications();
    } catch (err) {
      alert('Failed to update stage');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;
    try {
      await api.post(`/pipeline/applications/${activeApp.application_id}/reviews`, {
        rating: Number(rating),
        notes,
      });
      setActiveApp(null);
      setNotes('');
      alert('Review recorded successfully!');
    } catch (err) {
      alert('Failed to save review');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Recruitment Pipeline Board</h3>
          <p className="text-muted small m-0">Track applicant progress across recruitment stages</p>
        </div>
        <div style={{ minWidth: '260px' }}>
          <select 
            className="form-select shadow-sm"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-teal" role="status"></div>
        </div>
      ) : (
        <div className="d-flex gap-3 overflow-auto pb-4" style={{ minHeight: '650px' }}>
          {STAGES.map((stage) => {
            const stageApps = applications.filter((a) => a.current_stage === stage);
            return (
              <div 
                key={stage} 
                className="bg-light p-3 rounded-3 d-flex flex-column"
                style={{ width: '280px', minWidth: '280px', maxHeight: '75vh', overflowY: 'auto' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark small m-0">{stage}</h6>
                  <span className="badge bg-secondary rounded-pill">{stageApps.length}</span>
                </div>

                <div className="d-flex flex-column gap-2 flex-grow-1">
                  {stageApps.map((app) => (
                    <div key={app.application_id} className="card border-0 shadow-sm rounded-2 p-3 bg-white">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="fw-bold text-dark small">{app.candidate_name}</span>
                        <span className="badge bg-teal-subtle text-teal" style={{ backgroundColor: '#CCFBF1', color: '#0F766E' }}>
                          {app.score.toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-muted small mb-2" style={{ fontSize: '11px' }}>
                        {app.candidate_email}
                      </div>

                      {/* Move Stage Selector */}
                      <div className="mt-2 pt-2 border-top">
                        <label className="text-muted" style={{ fontSize: '10px' }}>Change Stage:</label>
                        <select
                          className="form-select form-select-sm"
                          style={{ fontSize: '11px' }}
                          value={app.current_stage}
                          onChange={(e) => handleStageChange(app.application_id, e.target.value)}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => setActiveApp(app)}
                        className="btn btn-sm btn-outline-primary mt-2 d-flex align-items-center justify-content-center gap-1"
                        style={{ fontSize: '11px' }}
                      >
                        <MessageSquare size={12} /> Add Review Notes
                      </button>
                    </div>
                  ))}
                  {stageApps.length === 0 && (
                    <div className="text-center py-4 text-muted small opacity-50">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {activeApp && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Candidate Review: {activeApp.candidate_name}</h5>
                <button type="button" className="btn-close" onClick={() => setActiveApp(null)}></button>
              </div>
              <form onSubmit={handleAddReview}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Rating (1 to 5 Stars)</label>
                    <select 
                      className="form-select"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value="5">★★★★★ - Excellent Match</option>
                      <option value="4">★★★★☆ - Strong Match</option>
                      <option value="3">★★★☆☆ - Average Match</option>
                      <option value="2">★★☆☆☆ - Marginal</option>
                      <option value="1">★☆☆☆☆ - Not Suitable</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Recruiter / Interviewer Notes</label>
                    <textarea 
                      className="form-control" 
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add observations, interview feedback, communication skills, or domain expertise notes..."
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setActiveApp(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0D9488', borderColor: '#0D9488' }}>
                    Save Review
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

