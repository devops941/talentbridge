import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, CheckCircle2, XCircle, Info, Sparkles, Filter } from 'lucide-react';

export const MatchingRanking: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    api.get('/jobs').then((res) => {
      setJobs(res.data);
      if (res.data.length > 0) {
        setSelectedJobId(res.data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      setLoading(true);
      api.get(`/applications/job/${selectedJobId}/rankings`)
        .then((res) => setRankings(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selectedJobId]);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Candidate Scoring & Ranking Leaderboard</h3>
          <p className="text-muted small m-0">Explainable candidate ranking based on Skill Coverage (70%) and TF-IDF Cosine Similarity (30%)</p>
        </div>
        <div style={{ minWidth: '280px' }}>
          <select 
            className="form-select border-teal shadow-sm"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-teal" role="status"></div>
        </div>
      ) : rankings.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Award size={48} className="mx-auto mb-3 opacity-50 text-warning" />
          <h5>No Candidates Ranked For This Opening</h5>
          <p className="small">Candidates must apply or be linked to this job opening to calculate ranking scores.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3" style={{ width: '80px' }}>Rank</th>
                  <th>Candidate</th>
                  <th>Suitability Score</th>
                  <th>Score Breakdown</th>
                  <th>Matched Skills</th>
                  <th>Missing Required</th>
                  <th className="text-end px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r, idx) => (
                  <tr key={r.application_id}>
                    <td className="px-4 py-3 fw-bold text-muted">
                      #{idx + 1}
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{r.candidate_name}</div>
                      <div className="small text-muted">{r.candidate_email}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge rounded-pill px-3 py-2 fs-6 fw-bold text-white" style={{
                          backgroundColor: r.score >= 70 ? '#10B981' : r.score >= 50 ? '#3B82F6' : '#F59E0B'
                        }}>
                          {r.score.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="small text-muted">
                        <div>Skill: <strong>{r.skill_score.toFixed(1)}%</strong> (70%)</div>
                        <div>Text: <strong>{r.text_score.toFixed(1)}%</strong> (30%)</div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '240px' }}>
                        {r.matched_skills.map((s: string) => (
                          <span key={s} className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '11px' }}>
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '200px' }}>
                        {r.missing_required_skills.length === 0 ? (
                          <span className="text-success small">None (100% Covered)</span>
                        ) : (
                          r.missing_required_skills.map((s: string) => (
                            <span key={s} className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: '11px' }}>
                              ✗ {s}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="text-end px-4">
                      <button 
                        onClick={() => setSelectedResult(r)}
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                      >
                        <Info size={14} /> Explain
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Explainability Breakdown Modal */}
      {selectedResult && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Score Rationale & Evidence</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedResult(null)}></button>
              </div>
              <div className="modal-body p-4">
                <h5 className="fw-bold text-dark">{selectedResult.candidate_name}</h5>
                <div className="alert alert-info py-2 small mb-3">
                  <strong>Explanation:</strong> {selectedResult.explanation}
                </div>

                <div className="row g-2 mb-3 text-center">
                  <div className="col-4">
                    <div className="p-3 bg-light rounded">
                      <div className="small text-muted">Skill Coverage</div>
                      <div className="fs-5 fw-bold text-teal" style={{ color: '#0D9488' }}>{selectedResult.skill_score}%</div>
                      <div style={{ fontSize: '10px' }} className="text-muted">Weight: 70%</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 bg-light rounded">
                      <div className="small text-muted">TF-IDF Sim</div>
                      <div className="fs-5 fw-bold text-primary">{selectedResult.text_score}%</div>
                      <div style={{ fontSize: '10px' }} className="text-muted">Weight: 30%</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 bg-success-subtle rounded">
                      <div className="small text-success fw-semibold">Combined Score</div>
                      <div className="fs-5 fw-bold text-success">{selectedResult.score}%</div>
                      <div style={{ fontSize: '10px' }} className="text-success">Rank metric</div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold small text-success mb-1">Matched Required Skills:</div>
                  <div className="d-flex flex-wrap gap-1">
                    {selectedResult.matched_skills.map((s: string) => (
                      <span key={s} className="badge bg-success">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="fw-semibold small text-danger mb-1">Missing Required Skills:</div>
                  <div className="d-flex flex-wrap gap-1">
                    {selectedResult.missing_required_skills.length === 0 ? (
                      <span className="small text-muted">None</span>
                    ) : (
                      selectedResult.missing_required_skills.map((s: string) => (
                        <span key={s} className="badge bg-danger">{s}</span>
                      ))
                    )}
                  </div>
                </div>

                <div className="small text-muted border-top pt-2">
                  Model Version: <code>{selectedResult.model_version}</code>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedResult(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
