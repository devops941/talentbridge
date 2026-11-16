import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export const ResumeUpload: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/candidates').then((res) => {
      setCandidates(res.data);
      if (res.data.length > 0) {
        setSelectedCandidate(res.data[0].id);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are supported.');
        setFile(null);
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedCandidate) return;

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('candidate_id', selectedCandidate);
    formData.append('file', file);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Fetch full parsed resume details
      const detailRes = await api.get(`/resumes/${res.data.id}`);
      setResult(detailRes.data);
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and parse resume document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px' }}>
      <div className="mb-4">
        <h3 className="fw-bold text-dark m-0">Resume Ingestion & Parser</h3>
        <p className="text-muted small">Upload PDF candidate resumes for PyMuPDF text extraction and NLP skill mining</p>
      </div>

      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
        <form onSubmit={handleUpload}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Select Candidate Profile</label>
            <select 
              className="form-select"
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              required
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Upload Candidate Resume (PDF only, max 10MB)</label>
            <div className="border border-2 border-dashed rounded-3 p-5 text-center bg-light">
              <UploadCloud size={48} className="text-teal mb-3" style={{ color: '#0D9488' }} />
              <div>
                <input 
                  type="file" 
                  id="resumeFileInput" 
                  className="d-none" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="resumeFileInput" className="btn btn-outline-primary btn-sm px-4 py-2">
                  Browse PDF Document
                </label>
              </div>
              {file && (
                <div className="mt-3 text-success fw-semibold small d-flex align-items-center justify-content-center gap-1">
                  <FileText size={16} /> Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2"
            style={{ backgroundColor: '#0D9488', borderColor: '#0D9488' }}
            disabled={uploading || !file}
          >
            <Sparkles size={18} />
            {uploading ? 'Parsing PDF & Mining Skills...' : 'Upload & Process Resume'}
          </button>
        </form>
      </div>

      {/* Parse Results Preview */}
      {result && (
        <div className="card border-0 shadow-sm rounded-3 p-4 bg-white border-start border-4 border-success">
          <div className="d-flex align-items-center gap-2 text-success mb-2">
            <CheckCircle size={20} />
            <h5 className="fw-bold m-0">Extraction Completed Successfully</h5>
          </div>
          <p className="text-muted small mb-3">
            File: <strong>{result.original_filename}</strong> | Status: <span className="badge bg-success">{result.parse_status}</span>
          </p>

          <div className="mb-3">
            <h6 className="fw-bold small text-dark mb-2">NLP Identified Skills ({result.skills?.length}):</h6>
            <div className="d-flex flex-wrap gap-2">
              {result.skills?.map((s: any) => (
                <div key={s.skill_id} className="p-2 rounded bg-light border small">
                  <div className="fw-bold text-teal" style={{ color: '#0F766E' }}>{s.canonical_name}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Evidence: {s.evidence_text}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h6 className="fw-bold small text-dark mb-1">Parsed Text Sample:</h6>
            <pre className="p-3 bg-light rounded text-secondary small" style={{ maxHeight: '180px', overflowY: 'auto' }}>
              {result.extracted_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

