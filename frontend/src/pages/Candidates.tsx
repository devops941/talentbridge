import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Plus, Mail, Phone, MapPin, AlertTriangle, Check, AlertCircle } from 'lucide-react';

const CANDIDATE_LOCATIONS = [
  'Chennai, Tamil Nadu',
  'Bengaluru, Karnataka',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Mumbai, Maharashtra',
  'Delhi NCR, India',
  'Coimbatore, Tamil Nadu',
  'Kolkata, West Bengal',
  'Kochi, Kerala',
  'Remote / Open to Relocation',
  'Other / International',
];

export const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state - Clean, unpopulated by default
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [warning, setWarning] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Inline Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCandidates = () => {
    setLoading(true);
    api.get('/candidates')
      .then((res) => setCandidates(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setWarning(null);
    setServerError(null);
    setErrors({});
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    const nameTrimmed = fullName.trim();
    if (!nameTrimmed) {
      newErrors.fullName = 'Full Name is required';
    } else if (nameTrimmed.length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(nameTrimmed)) {
      newErrors.fullName = 'Please enter a valid legal name without numbers or special symbols';
    }

    // Email validation
    const emailTrimmed = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(emailTrimmed)) {
      newErrors.email = 'Please enter a valid email address (e.g. candidate@example.com)';
    }

    // Phone validation
    const phoneTrimmed = phone.trim();
    if (phoneTrimmed) {
      const phoneDigits = phoneTrimmed.replace(/[^0-9]/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
      }
    }

    // Location validation
    if (!location) {
      newErrors.location = 'Please select candidate location from the dropdown';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarning(null);
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/candidates', {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        location,
      });

      if (res.data.duplicate_warning) {
        setWarning('Notice: A candidate with this email already exists in the system. Existing profile was retained.');
      } else {
        handleCloseModal();
        fetchCandidates();
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setServerError(typeof detail === 'string' ? detail : 'Failed to create candidate record. Please check the inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Candidate Directory</h3>
          <p className="text-muted small">Manage applicant master records, contact details, and resume files</p>
        </div>
        <button 
          onClick={handleOpenModal} 
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          style={{ backgroundColor: '#0D9488', borderColor: '#0D9488' }}
        >
          <Plus size={18} /> New Candidate Profile
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-teal" role="status"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Users size={48} className="mx-auto mb-3 opacity-50" />
          <h5>No Candidate Profiles Yet</h5>
          <p className="small">Add a candidate or upload resumes to populate the candidate directory.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Candidate Name</th>
                  <th>Email Address</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 fw-semibold text-dark">
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="rounded-circle text-teal p-2 d-flex align-items-center justify-content-center fw-bold" 
                          style={{ width: '36px', height: '36px', backgroundColor: '#CCFBF1', color: '#0F766E' }}
                        >
                          {c.full_name ? c.full_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        {c.full_name}
                      </div>
                    </td>
                    <td>
                      <span className="d-flex align-items-center gap-1 text-secondary small">
                        <Mail size={14} /> {c.email}
                      </span>
                    </td>
                    <td>
                      <span className="d-flex align-items-center gap-1 text-secondary small">
                        <Phone size={14} /> {c.phone || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="d-flex align-items-center gap-1 text-secondary small">
                        <MapPin size={14} /> {c.location || 'N/A'}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Candidate Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <div>
                  <h5 className="modal-title fw-bold text-dark m-0">Add Candidate Profile</h5>
                  <small className="text-muted">Create a candidate profile before ingesting their PDF resume</small>
                </div>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  {serverError && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3">
                      <AlertCircle size={18} className="flex-shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {warning && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 small mb-3">
                      <AlertTriangle size={16} className="flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      value={fullName} 
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                      }} 
                      placeholder="e.g. Alexander Mitchell"
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="email" 
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }} 
                      placeholder="e.g. alexander.mitchell@example.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  {/* Phone */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Phone Number <span className="text-muted fw-normal">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      value={phone} 
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }} 
                      placeholder="+91 98765 43210" 
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  {/* Location Dropdown */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Location / City <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.location ? 'is-invalid' : ''}`}
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        if (errors.location) setErrors({ ...errors, location: '' });
                      }}
                    >
                      <option value="">-- Select Candidate Location --</option>
                      {CANDIDATE_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    {errors.location && <div className="invalid-feedback">{errors.location}</div>}
                  </div>
                </div>

                <div className="modal-footer bg-light border-top px-4 py-3">
                  <button type="button" className="btn btn-light" onClick={handleCloseModal} disabled={submitting}>
                    Close
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary d-flex align-items-center gap-2" 
                    style={{ backgroundColor: '#0D9488', borderColor: '#0D9488' }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Save Candidate
                      </>
                    )}
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
