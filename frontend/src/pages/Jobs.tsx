import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Briefcase, MapPin, Clock, Tag, X, Check, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering & Technology',
  'Data Science & AI / ML',
  'Cloud Architecture & DevOps',
  'Product Management & UI/UX',
  'Quality Assurance & Automation',
  'Human Resources & Talent Acquisition',
  'Sales, Marketing & Growth',
  'Finance & Business Operations',
];

const LOCATIONS = [
  'Remote - Anywhere',
  'Hybrid - Flexible',
  'Chennai, Tamil Nadu',
  'Bengaluru, Karnataka',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Mumbai, Maharashtra',
  'Delhi NCR, India',
  'Coimbatore, Tamil Nadu',
  'On-Site Client Location',
];

const EXP_MIN_OPTIONS = [
  { value: 0, label: '0 Yrs (Fresher / Entry Level)' },
  { value: 1, label: '1 Yr' },
  { value: 2, label: '2 Yrs' },
  { value: 3, label: '3 Yrs' },
  { value: 4, label: '4 Yrs' },
  { value: 5, label: '5 Yrs' },
  { value: 7, label: '7 Yrs' },
  { value: 10, label: '10+ Yrs' },
];

const EXP_MAX_OPTIONS = [
  { value: 1, label: '1 Yr' },
  { value: 2, label: '2 Yrs' },
  { value: 3, label: '3 Yrs' },
  { value: 5, label: '5 Yrs' },
  { value: 7, label: '7 Yrs' },
  { value: 10, label: '10 Yrs' },
  { value: 12, label: '12 Yrs' },
  { value: 15, label: '15+ Yrs' },
];

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Available taxonomy skills from MongoDB
  const [taxonomySkills, setTaxonomySkills] = useState<string[]>([]);

  // Form state - Clean, unpopulated by default
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [expMin, setExpMin] = useState<string>('');
  const [expMax, setExpMax] = useState<string>('');
  const [location, setLocation] = useState('');

  // Skills interactive list
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillCategory, setSkillCategory] = useState<'REQUIRED' | 'PREFERRED'>('REQUIRED');

  // Inline Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchJobs = () => {
    setLoading(true);
    api.get('/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchTaxonomy = () => {
    api.get('/jobs/taxonomy/skills')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTaxonomySkills(res.data);
        }
      })
      .catch(() => {
        // Fallback default taxonomy if needed
        setTaxonomySkills([
          'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'React',
          'TypeScript', 'Machine Learning', 'NLP', 'Git', 'REST API',
          'Kubernetes', 'MongoDB', 'Redis', 'SQL', 'CI/CD'
        ]);
      });
  };

  useEffect(() => {
    fetchJobs();
    fetchTaxonomy();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setDescription('');
    setExpMin('');
    setExpMax('');
    setLocation('');
    setRequiredSkills([]);
    setPreferredSkills([]);
    setSkillInput('');
    setSkillCategory('REQUIRED');
    setErrors({});
    setServerError(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const addSkill = (skillName: string, category: 'REQUIRED' | 'PREFERRED') => {
    const cleaned = skillName.trim();
    if (!cleaned) return;

    if (category === 'REQUIRED') {
      if (!requiredSkills.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
        setRequiredSkills([...requiredSkills, cleaned]);
        setPreferredSkills(preferredSkills.filter((s) => s.toLowerCase() !== cleaned.toLowerCase()));
      }
    } else {
      if (!preferredSkills.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
        setPreferredSkills([...preferredSkills, cleaned]);
        setRequiredSkills(requiredSkills.filter((s) => s.toLowerCase() !== cleaned.toLowerCase()));
      }
    }

    // Clear skill error if resolved
    if (category === 'REQUIRED' && errors.skills) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.skills;
        return updated;
      });
    }
  };

  const removeRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const removePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim()) {
      addSkill(skillInput.trim(), skillCategory);
      setSkillInput('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Job title must be at least 3 characters';
    }

    if (!department) {
      newErrors.department = 'Please select a department from the dropdown';
    }

    if (!description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Job description must be at least 15 characters describing key responsibilities';
    }

    if (expMin === '') {
      newErrors.expMin = 'Please select minimum experience';
    }

    if (expMax === '') {
      newErrors.expMax = 'Please select maximum experience';
    }

    if (expMin !== '' && expMax !== '' && Number(expMin) > Number(expMax)) {
      newErrors.expRange = 'Minimum experience cannot exceed maximum experience';
    }

    if (!location) {
      newErrors.location = 'Please select a location from the dropdown';
    }

    if (requiredSkills.length === 0) {
      newErrors.skills = 'Please add at least 1 Required Skill. (Mandatory for the 70% Skill Coverage scoring engine)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const skillsPayload = [
      ...requiredSkills.map((s) => ({
        skill_name: s,
        requirement_type: 'REQUIRED',
        importance_weight: 1.0,
      })),
      ...preferredSkills.map((s) => ({
        skill_name: s,
        requirement_type: 'PREFERRED',
        importance_weight: 0.5,
      })),
    ];

    try {
      await api.post('/jobs', {
        title: title.trim(),
        department,
        description: description.trim(),
        experience_min: Number(expMin),
        experience_max: Number(expMax),
        location,
        skills: skillsPayload,
      });

      handleCloseModal();
      fetchJobs();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setServerError(typeof detail === 'string' ? detail : 'Failed to publish job vacancy. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Job Vacancies</h3>
          <p className="text-muted small">Manage hiring criteria and configure explainable AI skill requirements</p>
        </div>
        <button 
          onClick={handleOpenModal} 
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          style={{ backgroundColor: '#0D9488', borderColor: '#0D9488' }}
        >
          <Plus size={18} /> Post New Vacancy
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-teal" role="status"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Briefcase size={48} className="mx-auto mb-3 opacity-50" />
          <h5>No Job Openings Created Yet</h5>
          <p className="small">Click "Post New Vacancy" to configure your first opening and skill criteria.</p>
        </div>
      ) : (
        <div className="row g-3">
          {jobs.map((job) => (
            <div className="col-12 col-md-6 col-xl-4" key={job.id}>
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      {job.department}
                    </span>
                    <span className="badge bg-success-subtle text-success">
                      {job.status}
                    </span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{job.title}</h5>
                  <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                    <span className="d-flex align-items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    <span className="d-flex align-items-center gap-1"><Clock size={14} /> {job.experience_min}-{job.experience_max} yrs</span>
                  </div>
                  <p className="text-secondary small mb-3 text-truncate-2" style={{ maxHeight: '42px', overflow: 'hidden' }}>
                    {job.description}
                  </p>
                </div>

                <div className="border-top pt-3">
                  <div className="small fw-semibold text-muted mb-2">Required Skills (70% Weight):</div>
                  <div className="d-flex flex-wrap gap-1">
                    {job.skills.filter((s: any) => s.requirement_type === 'REQUIRED').map((s: any) => (
                      <span key={s.id || s.skill_name} className="badge bg-light text-dark border">
                        {s.skill_name}
                      </span>
                    ))}
                    {job.skills.filter((s: any) => s.requirement_type === 'REQUIRED').length === 0 && (
                      <span className="text-muted small">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal with Pure Dropdowns and Full Validation */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <div>
                  <h5 className="modal-title fw-bold text-dark m-0">Post New Job Vacancy</h5>
                  <small className="text-muted">Configure role requirements, experience bands, and scoring taxonomy</small>
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

                  <div className="row g-3">
                    {/* Job Title */}
                    <div className="col-12 col-md-7">
                      <label className="form-label small fw-semibold">
                        Job Title <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        value={title} 
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (errors.title) setErrors({ ...errors, title: '' });
                        }} 
                        placeholder="e.g. Senior Machine Learning Engineer" 
                      />
                      {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                    </div>

                    {/* Department Dropdown */}
                    <div className="col-12 col-md-5">
                      <label className="form-label small fw-semibold">
                        Department <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          if (errors.department) setErrors({ ...errors, department: '' });
                        }}
                      >
                        <option value="">-- Select Department --</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {errors.department && <div className="invalid-feedback">{errors.department}</div>}
                    </div>

                    {/* Job Description */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Job Description <span className="text-danger">*</span>
                      </label>
                      <textarea 
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        rows={3} 
                        value={description} 
                        onChange={(e) => {
                          setDescription(e.target.value);
                          if (errors.description) setErrors({ ...errors, description: '' });
                        }} 
                        placeholder="Detail the core duties, deliverables, technical stack, and day-to-day candidate responsibilities..."
                      />
                      {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                      <small className="text-muted">Used for the 30% TF-IDF Cosine Similarity semantic matching algorithm.</small>
                    </div>

                    {/* Min Experience Dropdown */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">
                        Min Experience <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errors.expMin || errors.expRange ? 'is-invalid' : ''}`}
                        value={expMin}
                        onChange={(e) => {
                          setExpMin(e.target.value);
                          if (errors.expMin || errors.expRange) {
                            setErrors({ ...errors, expMin: '', expRange: '' });
                          }
                        }}
                      >
                        <option value="">-- Min Experience --</option>
                        {EXP_MIN_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {errors.expMin && <div className="invalid-feedback">{errors.expMin}</div>}
                    </div>

                    {/* Max Experience Dropdown */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">
                        Max Experience <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errors.expMax || errors.expRange ? 'is-invalid' : ''}`}
                        value={expMax}
                        onChange={(e) => {
                          setExpMax(e.target.value);
                          if (errors.expMax || errors.expRange) {
                            setErrors({ ...errors, expMax: '', expRange: '' });
                          }
                        }}
                      >
                        <option value="">-- Max Experience --</option>
                        {EXP_MAX_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {errors.expMax && <div className="invalid-feedback">{errors.expMax}</div>}
                    </div>

                    {/* Location Dropdown */}
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">
                        Location / Work Mode <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errors.location ? 'is-invalid' : ''}`}
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          if (errors.location) setErrors({ ...errors, location: '' });
                        }}
                      >
                        <option value="">-- Select Location --</option>
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                      {errors.location && <div className="invalid-feedback">{errors.location}</div>}
                    </div>

                    {errors.expRange && (
                      <div className="col-12 text-danger small">
                        ⚠️ {errors.expRange}
                      </div>
                    )}

                    {/* Interactive Skills Selection Box */}
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3 border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label small fw-bold text-dark m-0">
                            Candidate Skills & Criteria Configuration <span className="text-danger">*</span>
                          </label>
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className={`btn ${skillCategory === 'REQUIRED' ? 'btn-teal text-white' : 'btn-outline-secondary'}`}
                              style={skillCategory === 'REQUIRED' ? { backgroundColor: '#0D9488', borderColor: '#0D9488' } : {}}
                              onClick={() => setSkillCategory('REQUIRED')}
                            >
                              Required (70% Weight)
                            </button>
                            <button
                              type="button"
                              className={`btn ${skillCategory === 'PREFERRED' ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => setSkillCategory('PREFERRED')}
                            >
                              Preferred (0.5x Weight)
                            </button>
                          </div>
                        </div>

                        {/* Custom skill input */}
                        <div className="input-group input-group-sm mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`Type a skill and click Add (e.g. ${skillCategory === 'REQUIRED' ? 'Python, React, FastAPI' : 'Docker, Kubernetes'})...`}
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (skillInput.trim()) {
                                  addSkill(skillInput.trim(), skillCategory);
                                  setSkillInput('');
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-dark"
                            onClick={handleAddCustomSkill}
                          >
                            + Add to {skillCategory === 'REQUIRED' ? 'Required' : 'Preferred'}
                          </button>
                        </div>

                        {/* Quick-Pick taxonomy pills */}
                        <div className="mb-3">
                          <div className="text-muted small fw-semibold mb-1">
                            Click to add from Canonical Taxonomy:
                          </div>
                          <div className="d-flex flex-wrap gap-1" style={{ maxHeight: '90px', overflowY: 'auto' }}>
                            {taxonomySkills.map((sk) => {
                              const isReq = requiredSkills.includes(sk);
                              const isPref = preferredSkills.includes(sk);
                              return (
                                <button
                                  key={sk}
                                  type="button"
                                  onClick={() => addSkill(sk, skillCategory)}
                                  className={`btn btn-sm py-0 px-2 rounded-pill small ${
                                    isReq 
                                      ? 'btn-success text-white' 
                                      : isPref 
                                      ? 'btn-info text-white' 
                                      : 'btn-outline-secondary bg-white'
                                  }`}
                                  style={{ fontSize: '11px' }}
                                >
                                  {sk} {isReq ? '✓ Req' : isPref ? '✓ Pref' : '+'}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selected Required Skills */}
                        <div className="mb-2">
                          <div className="small fw-semibold text-teal mb-1" style={{ color: '#0F766E' }}>
                            ★ Mandatory Required Skills ({requiredSkills.length}):
                          </div>
                          {requiredSkills.length === 0 ? (
                            <span className="text-muted small fst-italic">No required skills selected yet. Select from taxonomy pills above or type to add.</span>
                          ) : (
                            <div className="d-flex flex-wrap gap-1">
                              {requiredSkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="badge d-inline-flex align-items-center gap-1 py-1 px-2 text-white"
                                  style={{ backgroundColor: '#0D9488' }}
                                >
                                  {sk}
                                  <X
                                    size={13}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => removeRequiredSkill(sk)}
                                  />
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Selected Preferred Skills */}
                        <div>
                          <div className="small fw-semibold text-primary mb-1">
                            Optional Preferred Skills ({preferredSkills.length}):
                          </div>
                          {preferredSkills.length === 0 ? (
                            <span className="text-muted small fst-italic">No preferred skills selected.</span>
                          ) : (
                            <div className="d-flex flex-wrap gap-1">
                              {preferredSkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1 py-1 px-2"
                                >
                                  {sk}
                                  <X
                                    size={13}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => removePreferredSkill(sk)}
                                  />
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {errors.skills && (
                          <div className="alert alert-danger py-2 px-3 small mt-2 mb-0">
                            {errors.skills}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top px-4 py-3">
                  <button type="button" className="btn btn-light" onClick={handleCloseModal} disabled={submitting}>
                    Cancel
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
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Publish Vacancy
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
