import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Plus, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';

export const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Chennai');
  const [warning, setWarning] = useState<string | null>(null);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarning(null);
    try {
      const res = await api.post('/candidates', {
        full_name: fullName,
        email,
        phone,
        location,
      });

      if (res.data.duplicate_warning) {
        setWarning('Warning: A candidate with this email already exists in the system. Existing record retained.');
      } else {
        setShowModal(false);
        setFullName('');
        setEmail('');
        setPhone('');
        fetchCandidates();
      }
    } catch (err) {
      alert('Failed to create candidate record');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Candidate Directory</h3>
          <p className="text-muted small">Manage applicant master records and contact details</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary d-flex align-items-center gap-2"
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
                        <div className="rounded-circle bg-teal-subtle text-teal p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', backgroundColor: '#CCFBF1', color: '#0F766E' }}>
                          {c.full_name.charAt(0)}
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Candidate Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  {warning && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 small mb-3">
                      <AlertTriangle size={16} />
                      <span>{warning}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      placeholder="e.g. John Doe"
                      required 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="john.doe@email.com"
                      required 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+91 98765 43210" 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Location / City</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)} 
                      placeholder="Chennai" 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Close</button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0D9488', borderColor: '#0D9488' }}>
                    Save Candidate
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

