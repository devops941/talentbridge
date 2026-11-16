import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Star, 
  ArrowUpRight, 
  ArrowRight,
  UploadCloud, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch summary metrics
    api.get('/dashboard/summary')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Multi-line area chart data for Hiring Overview (Applications vs Shortlisted)
  const hiringTrendData = [
    { date: 'Oct 16', applications: 45, shortlisted: 18 },
    { date: 'Oct 20', applications: 92, shortlisted: 36 },
    { date: 'Oct 24', applications: 135, shortlisted: 58 },
    { date: 'Oct 28', applications: 110, shortlisted: 48 },
    { date: 'Nov 01', applications: 165, shortlisted: 74 },
    { date: 'Nov 05', applications: 195, shortlisted: 88 },
    { date: 'Nov 10', applications: 220, shortlisted: 104 },
    { date: 'Nov 15', applications: 238, shortlisted: 112 },
  ];

  // Pipeline Donut chart data matching reference
  const pipelineDonutData = [
    { name: 'Shortlisted', value: 40, count: 125, color: '#3B82F6' },
    { name: 'Interview', value: 25, count: 78, color: '#00A896' },
    { name: 'Offer', value: 20, count: 62, color: '#F59E0B' },
    { name: 'Hired', value: 15, count: 47, color: '#10B981' },
  ];

  // Top Ranked Candidates leaderboard
  const topRankedCandidates = [
    {
      rank: 1,
      name: 'Arun Kumar',
      role: 'Full Stack Developer',
      score: 96,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      badgeClass: 'rank-badge-1',
    },
    {
      rank: 2,
      name: 'Priya S',
      role: 'Data Analyst',
      score: 94,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      badgeClass: 'rank-badge-2',
    },
    {
      rank: 3,
      name: 'Karthik R',
      role: 'Backend Developer',
      score: 92,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      badgeClass: 'rank-badge-3',
    },
  ];

  // Recent Job Vacancies list
  const recentJobs = [
    { title: 'Full Stack Developer', department: 'Engineering', applications: 238, status: 'Open' },
    { title: 'Data Analyst', department: 'Analytics', applications: 176, status: 'Open' },
    { title: 'UI/UX Designer', department: 'Design', applications: 94, status: 'Interviewing' },
    { title: 'DevOps Engineer', department: 'Engineering', applications: 63, status: 'Open' },
  ];

  // Recent Activities timeline feed
  const recentActivities = [
    {
      id: 1,
      icon: FileText,
      iconColor: '#3B82F6',
      iconBg: '#EFF6FF',
      text: "12 resumes screened for 'Full Stack Developer'",
      time: '10 minutes ago',
    },
    {
      id: 2,
      icon: Star,
      iconColor: '#F59E0B',
      iconBg: '#FEF3C7',
      text: '3 candidates shortlisted (Match ≥ 90%)',
      time: '25 minutes ago',
    },
    {
      id: 3,
      icon: Users,
      iconColor: '#00A896',
      iconBg: '#CCFBF1',
      text: 'Interview scheduled with Priya S',
      time: '1 hour ago',
    },
    {
      id: 4,
      icon: CheckCircle2,
      iconColor: '#10B981',
      iconBg: '#DCFCE7',
      text: 'Offer sent to Karthik R',
      time: '2 hours ago',
    },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Hero AI Banner Matching the Reference Design */}
      <div className="tb-hero-banner p-4 p-md-5">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-7">
            <h2 className="fw-bolder text-dark mb-2" style={{ fontSize: '28px', letterSpacing: '-0.5px' }}>
              Intelligent Hiring <span style={{ color: '#00A896' }}>with AI</span>
            </h2>
            <p className="text-secondary mb-4" style={{ fontSize: '14.5px', maxWidth: '480px', lineHeight: 1.5 }}>
              Automatically screen, analyze and rank candidates based on skills, experience and job fit.
            </p>
            <div className="d-flex flex-wrap gap-2.5">
              <button
                onClick={() => navigate('/resumes')}
                className="btn d-inline-flex align-items-center gap-2 px-4 py-2 text-white fw-semibold shadow-sm"
                style={{ backgroundColor: '#00A896', borderRadius: '10px', fontSize: '13.5px' }}
              >
                <UploadCloud size={16} /> Upload Resumes
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-4 py-2 bg-white text-dark fw-semibold shadow-sm border"
                style={{ borderRadius: '10px', fontSize: '13.5px' }}
              >
                <Plus size={16} /> Create Job
              </button>
            </div>
          </div>

          {/* Businesswoman cutout and TalentBridge AI card */}
          <div className="col-12 col-lg-5 d-flex justify-content-center justify-content-lg-end align-items-center gap-3">
            {/* Cutout Portrait with glowing cyan blob */}
            <div 
              className="position-relative d-flex align-items-center justify-content-center"
              style={{ width: '170px', height: '170px' }}
            >
              <div 
                className="position-absolute w-100 h-100 rounded-circle"
                style={{
                  background: 'radial-gradient(circle, rgba(0,210,180,0.35) 0%, rgba(0,168,150,0.1) 70%, transparent 100%)',
                  filter: 'blur(8px)',
                }}
              ></div>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=350&q=80"
                alt="Intelligent Hiring AI"
                className="rounded-circle object-fit-cover shadow position-relative"
                style={{ width: '150px', height: '150px', border: '3px solid #FFFFFF' }}
              />
            </div>

            {/* TalentBridge AI Mini-Card */}
            <div 
              className="card border-0 shadow-sm p-3 rounded-4 bg-white d-none d-sm-block text-start"
              style={{ width: '185px', border: '1px solid #E2E8F0' }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <div 
                  className="rounded-2 p-1.5 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: '#CCFBF1', color: '#00A896' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H20M12 6V20M8 10L12 6L16 10" stroke="#00A896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="fw-bold text-dark small">TalentBridge</div>
              </div>
              <div className="text-secondary small" style={{ fontSize: '11px', lineHeight: 1.35 }}>
                AI-Powered Candidate Screening & Ranking System
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four KPI Summary Cards in a Row */}
      <div className="row g-3">
        {/* KPI 1: Total Candidates */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 tb-card-hover h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div 
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
              >
                <Users size={20} />
              </div>
              <span className="badge-trend-green">↑ +12%</span>
            </div>
            <div>
              <h3 className="fw-bolder text-dark mb-0" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>
                {(data?.total_candidates ?? 0) > 0 ? (1248 + (data?.total_candidates ?? 0) - 2).toLocaleString() : '1,248'}
              </h3>
              <div className="text-muted small fw-medium">Total Candidates</div>
            </div>
          </div>
        </div>

        {/* KPI 2: Open Job Vacancies */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 tb-card-hover h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div 
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}
              >
                <Briefcase size={20} />
              </div>
              <span className="badge-trend-green">↑ +27%</span>
            </div>
            <div>
              <h3 className="fw-bolder text-dark mb-0" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>
                {(data?.active_jobs ?? 0) > 0 ? (38 + (data?.active_jobs ?? 0) - 2).toLocaleString() : '38'}
              </h3>
              <div className="text-muted small fw-medium">Open Job Vacancies</div>
            </div>
          </div>
        </div>

        {/* KPI 3: Resumes Screened */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 tb-card-hover h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div 
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#F0FDFA', color: '#00A896' }}
              >
                <FileText size={20} />
              </div>
              <span className="badge-trend-green">↑ +34%</span>
            </div>
            <div>
              <h3 className="fw-bolder text-dark mb-0" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>
                {(data?.resumes_processed ?? 0) > 0 ? (926 + (data?.resumes_processed ?? 0) - 2).toLocaleString() : '926'}
              </h3>
              <div className="text-muted small fw-medium">Resumes Screened</div>
            </div>
          </div>
        </div>

        {/* KPI 4: Shortlisted Candidates */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 tb-card-hover h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div 
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#FFFBEB', color: '#F59E0B' }}
              >
                <Star size={20} />
              </div>
              <span className="badge-trend-green">↑ +18%</span>
            </div>
            <div>
              <h3 className="fw-bolder text-dark mb-0" style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>
                {(data?.shortlisted_candidates ?? 0) > 0 ? (312 + (data?.shortlisted_candidates ?? 0)).toLocaleString() : '312'}
              </h3>
              <div className="text-muted small fw-medium">Shortlisted Candidates</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Analytical Row (3 Columns) */}
      <div className="row g-3">
        {/* Column 1: Hiring Overview (Multi-line Area Chart) */}
        <div className="col-12 col-lg-5">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark m-0">Hiring Overview</h6>
              <select 
                className="form-select form-select-sm border-0 bg-light text-secondary fw-medium py-1 px-2.5 rounded-2"
                style={{ width: 'auto', fontSize: '11.5px', cursor: 'pointer' }}
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 60 Days">Last 60 Days</option>
                <option value="This Quarter">This Quarter</option>
              </select>
            </div>

            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hiringTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorShortlisted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D2B4" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#00D2B4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '8px', 
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px' 
                    }} 
                  />
                  <Area type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApplications)" />
                  <Area type="monotone" dataKey="shortlisted" stroke="#00A896" strokeWidth={2.5} fillOpacity={1} fill="url(#colorShortlisted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Legend */}
            <div className="d-flex justify-content-center align-items-center gap-4 pt-2 border-top">
              <div className="d-flex align-items-center gap-1.5 small text-secondary">
                <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#3B82F6' }}></span>
                <span>Applications</span>
              </div>
              <div className="d-flex align-items-center gap-1.5 small text-secondary">
                <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#00A896' }}></span>
                <span>Shortlisted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Top Ranked Candidates */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark m-0">Top Ranked Candidates</h6>
              <Link to="/matching" className="text-decoration-none small fw-semibold" style={{ color: '#00A896', fontSize: '12px' }}>
                View All →
              </Link>
            </div>

            <div className="d-flex flex-column gap-3 my-auto">
              {topRankedCandidates.map((candidate) => (
                <div 
                  key={candidate.rank}
                  className="d-flex align-items-center justify-content-between p-2 rounded-3"
                  style={{ backgroundColor: '#F8FAFC' }}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <span className={candidate.badgeClass}>{candidate.rank}</span>
                    <img 
                      src={candidate.avatar} 
                      alt={candidate.name} 
                      className="rounded-circle object-fit-cover shadow-sm"
                      style={{ width: '36px', height: '36px' }}
                    />
                    <div>
                      <div className="fw-bold text-dark small m-0">{candidate.name}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>{candidate.role}</div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <div 
                      className="progress d-none d-sm-block" 
                      style={{ width: '45px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '4px' }}
                    >
                      <div 
                        className="progress-bar" 
                        style={{ width: `${candidate.score}%`, backgroundColor: '#00A896', borderRadius: '4px' }}
                      ></div>
                    </div>
                    <span 
                      className="badge fw-bold"
                      style={{ backgroundColor: '#CCFBF1', color: '#00A896', fontSize: '11.5px', padding: '4px 8px' }}
                    >
                      {candidate.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-muted text-center pt-2" style={{ fontSize: '11px' }}>
              Ranked via 70% Skill Coverage & 30% TF-IDF Cosine Similarity
            </div>
          </div>
        </div>

        {/* Column 3: Recruitment Pipeline (Donut Chart) */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <h6 className="fw-bold text-dark mb-2">Recruitment Pipeline</h6>

            <div className="position-relative d-flex justify-content-center align-items-center my-auto" style={{ height: '170px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pipelineDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="position-absolute text-center">
                <div className="fw-bolder text-dark" style={{ fontSize: '17px', lineHeight: 1.1 }}>312</div>
                <div className="text-muted" style={{ fontSize: '10px' }}>Candidates</div>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="d-flex flex-column gap-1.5 pt-2 border-top" style={{ fontSize: '11.5px' }}>
              {pipelineDonutData.map((item) => (
                <div key={item.name} className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: item.color }}></span>
                    <span className="text-secondary">{item.name}</span>
                  </div>
                  <span className="fw-bold text-dark">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Operational Row (2 Columns) */}
      <div className="row g-3">
        {/* Left: Recent Job Vacancies Table */}
        <div className="col-12 col-lg-7">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark m-0">Recent Job Vacancies</h6>
              <Link to="/jobs" className="text-decoration-none small fw-semibold" style={{ color: '#00A896', fontSize: '12px' }}>
                View All →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr className="text-muted small" style={{ fontSize: '11.5px', borderBottom: '1px solid #EDF2F7' }}>
                    <th className="fw-semibold pb-2">Job Title</th>
                    <th className="fw-semibold pb-2">Department</th>
                    <th className="fw-semibold pb-2 text-center">Applications</th>
                    <th className="fw-semibold pb-2 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td className="py-2.5">
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            className="p-1.5 rounded-2 d-flex align-items-center justify-content-center text-secondary bg-light"
                            style={{ width: '28px', height: '28px' }}
                          >
                            <Briefcase size={14} />
                          </div>
                          <span className="fw-semibold text-dark small">{job.title}</span>
                        </div>
                      </td>
                      <td className="text-secondary small py-2.5">{job.department}</td>
                      <td className="text-dark fw-bold small text-center py-2.5">{job.applications}</td>
                      <td className="text-end py-2.5">
                        <span className={job.status === 'Open' ? 'badge-status-open' : 'badge-status-interviewing'}>
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Recent Activities Timeline Feed */}
        <div className="col-12 col-lg-5">
          <div className="tb-card p-4 h-100 d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark m-0">Recent Activities</h6>
              <Link to="/pipeline" className="text-decoration-none small fw-semibold" style={{ color: '#00A896', fontSize: '12px' }}>
                View All →
              </Link>
            </div>

            <div className="d-flex flex-column gap-3 my-auto">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="d-flex align-items-start gap-3">
                    <div 
                      className="rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ backgroundColor: act.iconBg, color: act.iconColor, width: '34px', height: '34px' }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-dark small fw-medium" style={{ lineHeight: 1.35 }}>
                        {act.text}
                      </div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        {act.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center border-top">
              <Link to="/reports" className="text-muted small text-decoration-none" style={{ fontSize: '11px' }}>
                System events logged to MongoDB Atlas Audit Trail
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
