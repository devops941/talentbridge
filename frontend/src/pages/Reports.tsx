import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Download, ShieldCheck, History, FileSpreadsheet } from 'lucide-react';

export const Reports: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    api.get('/jobs').then((res) => {
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJobId(res.data[0].id);
    });

    setLoadingAudit(true);
    api.get('/reports/audit-logs')
      .then((res) => setAuditLogs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingAudit(false));
  }, []);

  const handleDownloadCSV = async () => {
    if (!selectedJobId) return;
    try {
      const res = await api.get(`/reports/job/${selectedJobId}/shortlist/csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shortlist_${selectedJobId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV report');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark m-0">Reports & Audit Trail</h3>
        <p className="text-muted small m-0">Download shortlisted candidate records and inspect compliance logs</p>
      </div>

      <div className="row g-4 mb-4">
        {/* Shortlist Export Card */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FileSpreadsheet size={24} className="text-success" />
              <h5 className="fw-bold text-dark m-0">Export Candidate Shortlist</h5>
            </div>
            <p className="small text-muted mb-3">
              Generates a standard CSV report including candidate contact details, suitability scores, skill breakdown, and recruitment stage.
            </p>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Select Job Opening</label>
              <select 
                className="form-select"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="btn btn-success d-flex align-items-center justify-content-center gap-2 mt-auto"
            >
              <Download size={18} /> Export Shortlist to CSV
            </button>
          </div>
        </div>

        {/* Responsible AI Compliance Card */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <ShieldCheck size={24} className="text-teal" style={{ color: '#0D9488' }} />
              <h5 className="fw-bold text-dark m-0">Compliance & Fairness Guard</h5>
            </div>
            <ul className="small text-muted ps-3 mb-0">
              <li className="mb-2"><strong>Zero Protected Characteristics:</strong> Candidate age, gender, photo, and background are strictly excluded from ranking calculations.</li>
              <li className="mb-2"><strong>No Automated Rejection:</strong> Candidates are never rejected automatically by AI models; recruiters retain complete decision authority.</li>
              <li><strong>Auditable Action Log:</strong> All data exports, requirement modifications, and status changes are recorded in tamper-evident logs.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white py-3 px-4 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <History size={18} className="text-muted" />
            <h6 className="fw-bold m-0 text-dark">System Audit Log</h6>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0 small">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th>Action Event</th>
                <th>Target Entity</th>
                <th>Entity ID</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">No audit logs recorded yet.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 text-muted">{new Date(log.created_at).toLocaleString()}</td>
                    <td><span className="badge bg-secondary">{log.action}</span></td>
                    <td>{log.entity_type}</td>
                    <td><code>{log.entity_id}</code></td>
                    <td className="text-muted">{log.metadata || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

