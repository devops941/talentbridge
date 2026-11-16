import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Briefcase, MapPin, Clock, Tag } from 'lucide-react';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [expMin, setExpMin] = useState(2);
  const [expMax, setExpMax] = useState(5);
  const [location, setLocation] = useState('Chennai / Remote');
  const [skillsText, setSkillsText] = useState('Python, FastAPI, PostgreSQL, REST API');
  const [prefSkillsText, setPrefSkillsText] = useState('Docker, AWS');

  const fetchJobs = () => {
    setLoading(true);
    api.get('/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const reqSkills = skillsText.split(',').map((s) => ({
      skill_name: s.trim(),
      requirement_type: 'REQUIRED',
      importance_weight: 1.0,
    })).filter((s) => s.skill_name.length > 0);

    const prefSkills = prefSkillsText.split(',').map((s) => ({
      skill_name: s.trim(),
      requirement_type: 'PREFERRED',
      importance_weight: 0.5,
    })).filter((s) => s.skill_name.length > 0);

    try {
      await api.post('/jobs', {
        title,
        department,
        description,
        experience_min: Number(expMin),
        experience_max: Number(expMax),
        location,
        skills: [...reqSkills, ...prefSkills],
      });
      setShowModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      fetchJobs();
    } catch (err) {
      alert('Failed to create job posting');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Job Vacancies</h3>
          <p className="text-muted small">Manage hiring criteria and skill requirements</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary d-flex align-items-center gap-2"
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
                  <div className="small fw-semibold text-muted mb-2">Required Skills:</div>
                  <div className="d-flex flex-wrap gap-1">
                    {job.skills.filter((s: any) => s.requirement_type === 'REQUIRED').map((s: any) => (
                      <span key={s.id} className="badge bg-light text-dark border">
                        {s.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Post New Job Vacancy</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold">Job Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="e.g. Senior Full Stack Python Developer" 
                        required 
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Department</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Job Description</label>
                      <textarea 
                        className="form-control" 
                        rows={3} 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Describe key responsibilities, background, and expectations..."
                        required 
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Min Experience (Yrs)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={expMin} 
                        onChange={(e) => setExpMin(Number(e.target.value))} 
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Max Experience (Yrs)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={expMax} 
                        onChange={(e) => setExpMax(Number(e.target.value))} 
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Location</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-danger">Required Skills (Comma separated)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={skillsText} 
                        onChange={(e) => setSkillsText(e.target.value)} 
                        placeholder="Python, FastAPI, PostgreSQL, REST API" 
                        required 
                      />
                      <small className="text-muted">These are mandatory for 70% Skill Coverage scoring.</small>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-primary">Preferred Skills (Optional)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={prefSkillsText} 
                        onChange={(e) => setPrefSkillsText(e.target.value)} 
                        placeholder="Docker, AWS, Kubernetes" 
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0D9488', borderColor: '#0D9488' }}>
                    Publish Vacancy
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
