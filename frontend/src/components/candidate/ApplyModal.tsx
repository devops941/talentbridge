import React, { useState } from 'react';
import api from '../../services/api';
import { 
  X, 
  Mail, 
  Lock, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Send,
  User,
  Phone
} from 'lucide-react';

interface ApplyModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, isOpen, onClose, onSuccess }) => {
  // Steps: 1 = Contact Info, 2 = OTP Verification, 3 = Resume Upload, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [otp, setOtp] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  if (!isOpen || !job) return null;

  const resetState = () => {
    setStep(1);
    setFullName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setOtp('');
    setFile(null);
    setError(null);
    setCandidateId(null);
    setMatchScore(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Step 1: Request Email OTP via Gmail SMTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('Please enter your full legal name (at least 3 characters).');
      return;
    }

    setLoading(true);
    try {
      await api.post('/candidate-auth/send-otp', {
        email: emailTrimmed,
        candidate_name: fullName.trim(),
        job_id: job.id,
      });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to dispatch verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpTrimmed = otp.trim();
    if (!otpTrimmed || otpTrimmed.length !== 6) {
      setError('Please enter the 6-digit verification code received in your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/candidate-auth/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: otpTrimmed,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      });

      if (res.data?.candidate?.id) {
        setCandidateId(res.data.candidate.id);
        if (res.data.access_token) {
          localStorage.setItem('tb_candidate_token', res.data.access_token);
        }
        setStep(3);
      } else {
        setError('Verification succeeded but failed to retrieve candidate profile.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP code. Please check and retry.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle Resume File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF resumes are supported.');
        setFile(null);
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('Resume file exceeds the 10MB limit.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  // Step 3: Submit Application with Resume
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !candidateId) {
      setError('Please select your PDF resume file to submit.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('candidate_id', candidateId);
    formData.append('job_id', job.id);
    formData.append('full_name', fullName.trim());
    formData.append('phone', phone.trim());
    formData.append('location', location.trim());
    formData.append('file', file);

    try {
      const res = await api.post('/candidate-auth/apply-with-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.score !== undefined) {
        setMatchScore(res.data.score);
      }
      setStep(4);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to ingest resume and process application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal show d-block" 
      tabIndex={-1} 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-light border-bottom px-4 py-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge-status-open small">● Open Role</span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                  {job.department}
                </span>
              </div>
              <h5 className="modal-title fw-bold text-dark m-0">Apply for {job.title}</h5>
            </div>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="px-4 pt-3 pb-2 bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center small text-muted">
              <span className={`fw-semibold ${step >= 1 ? 'text-teal' : ''}`} style={step >= 1 ? { color: '#00A896' } : {}}>
                1. Contact Info
              </span>
              <span>→</span>
              <span className={`fw-semibold ${step >= 2 ? 'text-teal' : ''}`} style={step >= 2 ? { color: '#00A896' } : {}}>
                2. Email OTP
              </span>
              <span>→</span>
              <span className={`fw-semibold ${step >= 3 ? 'text-teal' : ''}`} style={step >= 3 ? { color: '#00A896' } : {}}>
                3. Resume Upload
              </span>
              <span>→</span>
              <span className={`fw-semibold ${step >= 4 ? 'text-teal' : ''}`} style={step >= 4 ? { color: '#00A896' } : {}}>
                4. Confirmed
              </span>
            </div>
          </div>

          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Enter Name & Email */}
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="small fw-semibold text-secondary mb-1">Role Criteria:</div>
                  <div className="d-flex flex-wrap align-items-center gap-3 small text-muted">
                    <span className="d-flex align-items-center gap-1"><MapPin size={13} /> {job.location}</span>
                    <span className="d-flex align-items-center gap-1"><Clock size={13} /> {job.experience_min}-{job.experience_max} yrs</span>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold">
                      Full Legal Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted"><User size={15} /></span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="e.g. Alexander Mitchell"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted"><Mail size={15} /></span>
                      <input
                        type="email"
                        className="form-control border-start-0"
                        placeholder="e.g. alexander@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <small className="text-muted" style={{ fontSize: '11px' }}>
                      A real 6-digit OTP will be sent to this email for verification.
                    </small>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted"><Phone size={15} /></span>
                      <input
                        type="tel"
                        className="form-control border-start-0"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold">Location / City</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted"><MapPin size={15} /></span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="e.g. Chennai, Tamil Nadu"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer px-0 pb-0 pt-4 mt-3 border-top">
                  <button type="button" className="btn btn-light" onClick={handleClose}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Sending Email OTP...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Send Verification Code
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter 6-digit OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div className="text-center py-3">
                  <div 
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#CCFBF1', color: '#0F766E' }}
                  >
                    <ShieldCheck size={28} />
                  </div>
                  <h5 className="fw-bold text-dark mb-1">Verify Your Email Address</h5>
                  <p className="text-muted small mb-3">
                    We have dispatched a 6-digit security code via Gmail to: <strong className="text-dark">{email}</strong>
                  </p>

                  <div className="mx-auto mb-3" style={{ maxWidth: '280px' }}>
                    <input
                      type="text"
                      className="form-control text-center fw-bold text-dark fs-3"
                      style={{ letterSpacing: '8px', border: '2px solid #00A896', borderRadius: '12px' }}
                      maxLength={6}
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="small text-muted mb-2">
                    Didn't receive the email? Check your Spam folder or{' '}
                    <button
                      type="button"
                      className="btn btn-link p-0 small fw-semibold text-teal"
                      style={{ color: '#00A896' }}
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                <div className="modal-footer px-0 pb-0 pt-3 border-top d-flex justify-content-between">
                  <button type="button" className="btn btn-light" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Proceed to Resume <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Upload PDF Resume */}
            {step === 3 && (
              <form onSubmit={handleSubmitApplication}>
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-2 text-success small fw-semibold mb-2">
                    <CheckCircle2 size={16} /> Email verified as <strong>{email}</strong>
                  </div>
                  <h6 className="fw-bold text-dark mb-1">Upload Your Candidate Resume (PDF)</h6>
                  <p className="text-muted small">
                    Our AI parser will analyze your skills against the vacancy's 70% Skill Coverage and 30% TF-IDF Cosine Similarity criteria.
                  </p>
                </div>

                <div
                  className="p-4 border-2 border-dashed rounded-3 text-center mb-3 cursor-pointer"
                  style={{
                    backgroundColor: file ? '#F0FDFA' : '#F8FAFC',
                    borderColor: file ? '#00A896' : '#CBD5E1',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                >
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="d-none"
                    onChange={handleFileChange}
                  />

                  {file ? (
                    <div>
                      <FileText size={40} className="mx-auto mb-2 text-teal" style={{ color: '#00A896' }} />
                      <div className="fw-bold text-dark">{file.name}</div>
                      <div className="text-muted small">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for AI Parsing</div>
                      <span className="badge bg-success-subtle text-success mt-2">PDF Document Ready</span>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={40} className="mx-auto mb-2 text-secondary opacity-60" />
                      <div className="fw-bold text-dark">Click or Drag & Drop your PDF Resume</div>
                      <div className="text-muted small">Maximum file size: 10MB • Standard PDF Format</div>
                    </div>
                  )}
                </div>

                <div className="modal-footer px-0 pb-0 pt-3 border-top d-flex justify-content-between">
                  <button type="button" className="btn btn-light" onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#00A896', borderColor: '#00A896' }}
                    disabled={loading || !file}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Parsing Resume & Computing AI Match...
                      </>
                    ) : (
                      <>
                        Submit Application & Screen Resume <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Application Submitted Confirmation */}
            {step === 4 && (
              <div className="text-center py-4">
                <div 
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '64px', height: '64px', backgroundColor: '#DCFCE7', color: '#16A34A' }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="fw-bold text-dark mb-1">Application Submitted Successfully!</h4>
                <p className="text-muted small mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
                  Thank you, <strong>{fullName}</strong>. Your application for <strong>{job.title}</strong> has been received and parsed into MongoDB Atlas.
                </p>

                {matchScore !== null && (
                  <div 
                    className="p-3 rounded-3 d-inline-block mx-auto mb-4 border"
                    style={{ backgroundColor: '#F0FDFA', borderColor: '#CCFBF1' }}
                  >
                    <div className="small text-muted mb-1">AI Match Suitability Score:</div>
                    <div className="fs-3 fw-bolder text-teal" style={{ color: '#00A896' }}>
                      {matchScore.toFixed(1)}%
                    </div>
                    <div className="small text-muted" style={{ fontSize: '11px' }}>
                      Calculated from 70% Skill Coverage & 30% TF-IDF Cosine Similarity
                    </div>
                  </div>
                )}

                <div className="alert alert-light border small text-muted text-start mb-4" style={{ maxWidth: '520px', margin: '0 auto' }}>
                  <strong>Next Steps:</strong>
                  <ul className="mb-0 mt-1 ps-3">
                    <li>Your verified profile is now visible in the recruiter directory.</li>
                    <li>Your parsed skills are ranked on the vacancy's candidate leaderboard.</li>
                    <li>The HR team will review your application in the hiring pipeline.</li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="btn btn-primary px-4 py-2"
                  style={{ backgroundColor: '#00A896', borderColor: '#00A896', borderRadius: '10px' }}
                  onClick={handleClose}
                >
                  Done / Browse More Jobs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
