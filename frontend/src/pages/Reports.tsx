import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Download,
  ShieldCheck,
  History,
  FileSpreadsheet,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Search,
  CheckCircle2,
  Lock,
  RefreshCw,
  UserCheck,
  FileText,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsKPIs {
  total_applications: number;
  shortlist_rate: number;
  avg_score: number;
  audit_events_count: number;
}

interface FunnelItem {
  stage: string;
  count: number;
  color: string;
}

interface ScoreTierItem {
  name: string;
  value: number;
  color: string;
}

interface SkillItem {
  skill: string;
  jobs_demanding: number;
  candidates_possessing: number;
}

interface AuditLogItem {
  id: number;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: string;
  created_at: string;
}

export const Reports: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Analytics data
  const [kpis, setKpis] = useState<AnalyticsKPIs>({
    total_applications: 0,
    shortlist_rate: 0,
    avg_score: 0,
    audit_events_count: 0
  });
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([]);
  const [scoreTiers, setScoreTiers] = useState<ScoreTierItem[]>([]);
  const [skillsData, setSkillsData] = useState<SkillItem[]>([]);

  // Search & Filter for Audit Logs
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, analyticsRes, auditRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/reports/analytics-summary'),
        api.get('/reports/audit-logs'),
      ]);

      setJobs(jobsRes.data);
      if (jobsRes.data.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsRes.data[0].id);
      }

      if (analyticsRes.data) {
        setKpis(analyticsRes.data.kpis);
        setFunnelData(analyticsRes.data.funnel_data);
        setScoreTiers(analyticsRes.data.score_tiers);
        setSkillsData(analyticsRes.data.skills_data);
      }

      setAuditLogs(auditRes.data);
    } catch (err) {
      console.error('Failed to load reports data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!selectedJobId) return;
    setExporting(true);
    try {
      const res = await api.get(`/reports/job/${selectedJobId}/shortlist/csv`, {
        responseType: 'blob',
      });
      const selectedJob = jobs.find((j) => j.id === selectedJobId);
      const safeTitle = selectedJob ? selectedJob.title.replace(/\s+/g, '_') : 'Shortlist';

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shortlist_${safeTitle}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Refresh audit logs to show the new EXPORT action
      const auditRes = await api.get('/reports/audit-logs');
      setAuditLogs(auditRes.data);
    } catch (err) {
      alert('Failed to export CSV report');
    } finally {
      setExporting(false);
    }
  };

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.metadata.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(auditSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedActionFilter !== 'ALL' && log.action !== selectedActionFilter) {
      return false;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('STAGE')) {
      return <span className="badge bg-primary-subtle text-primary border small">STAGE_TRANSITION</span>;
    }
    if (action.includes('EXPORT')) {
      return <span className="badge bg-success-subtle text-success border small">EXPORT_CSV</span>;
    }
    if (action.includes('APPLICATION')) {
      return <span className="badge bg-teal-subtle text-teal border small" style={{ backgroundColor: '#E6FFFA', color: '#00A896' }}>APPLICATION_INGESTED</span>;
    }
    return <span className="badge bg-light text-secondary border small">{action}</span>;
  };

  return (
    <div className="container-fluid px-0 pb-5">
      {/* Page Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.02em' }}>
              Reports & Analytics Intelligence Studio
            </h2>
            <span className="badge rounded-pill px-3 py-1 bg-teal-subtle text-teal fw-semibold border border-teal-subtle">
              Audit & BI Engine
            </span>
          </div>
          <p className="text-secondary small mb-0 mt-1">
            Recruitment pipeline velocity, skill market demand distribution, and immutable compliance audit logs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 rounded-3 px-3 py-2 fw-semibold"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Analytics
        </button>
      </div>

      {/* Top Executive KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Total Evaluated Applicants</div>
              <div className="fs-4 fw-bold text-dark">{kpis.total_applications}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F0FDFA', color: '#00A896' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Shortlist Conversion</div>
              <div className="fs-4 fw-bold text-dark">{kpis.shortlist_rate}%</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <BarChart2 size={24} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Average Match Score</div>
              <div className="fs-4 fw-bold text-dark">{kpis.avg_score}%</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="tb-card p-3 d-flex align-items-center gap-3">
            <div className="rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="text-secondary small fw-medium">Audited System Events</div>
              <div className="fs-4 fw-bold text-dark">{kpis.audit_events_count}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts (Recharts) */}
      <div className="row g-4 mb-4">
        {/* Chart 1: Hiring Funnel Velocity */}
        <div className="col-12 col-xl-8">
          <div className="tb-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                  <BarChart2 size={20} className="text-teal" style={{ color: '#00A896' }} />
                  Recruitment Funnel Velocity
                </h5>
                <p className="text-muted small m-0">Candidate volume distribution across recruitment pipeline stages</p>
              </div>
              <span className="badge bg-light text-secondary border small">Live MongoDB</span>
            </div>

            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <BarChart data={funnelData} margin={{ top: 10, right: 20, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(val: any) => [`${val} Candidates`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#00A896'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Match Quality Tiers */}
        <div className="col-12 col-xl-4">
          <div className="tb-card p-4 h-100 d-flex flex-column">
            <div className="mb-3">
              <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                <PieIcon size={20} className="text-teal" style={{ color: '#00A896' }} />
                Candidate Match Quality
              </h5>
              <p className="text-muted small m-0">Suitability tier breakdown</p>
            </div>

            <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ minHeight: '220px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={scoreTiers}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {scoreTiers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    formatter={(val: any) => [`${val} Candidates`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend Tiers */}
            <div className="d-flex flex-column gap-2 pt-2 border-top">
              {scoreTiers.map((tier) => (
                <div key={tier.name} className="d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: tier.color }}></span>
                    <span className="text-secondary">{tier.name}</span>
                  </div>
                  <span className="fw-bold text-dark">{tier.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart 3: Skill Demand vs Supply */}
      <div className="tb-card p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <TrendingUp size={20} className="text-teal" style={{ color: '#00A896' }} />
              Top Skills: Market Demand vs Ingested Supply
            </h5>
            <p className="text-muted small m-0">Comparing technical skills demanded by open job roles vs skills parsed from candidate resumes</p>
          </div>
          <span className="badge bg-light text-secondary border small">NLP Taxonomy Match</span>
        </div>

        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer>
            <BarChart data={skillsData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="skill" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="jobs_demanding" name="Jobs Requiring Skill" fill="#0B1528" radius={[4, 4, 0, 0]} />
              <Bar dataKey="candidates_possessing" name="Candidates Possessing Skill" fill="#00A896" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export & Governance Hub */}
      <div className="row g-4 mb-4">
        {/* Shortlist CSV Export Card */}
        <div className="col-12 col-md-6">
          <div className="tb-card p-4 h-100 d-flex flex-column">
            <div className="d-flex align-items-center gap-2.5 mb-2">
              <div className="rounded-3 p-2 bg-success-subtle text-success">
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <h5 className="fw-bold text-dark m-0">Export Candidate Shortlist</h5>
                <div className="text-muted small">Standard CSV with 70/30 scores, breakdown, and contact details</div>
              </div>
            </div>

            <div className="mb-3 mt-3">
              <label className="form-label small fw-semibold text-secondary">Target Job Opening</label>
              <select
                className="form-select fw-semibold"
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

            <button
              onClick={handleDownloadCSV}
              disabled={exporting || !selectedJobId}
              className="btn btn-success d-flex align-items-center justify-content-center gap-2 py-2 mt-auto fw-semibold rounded-3 shadow-sm"
              style={{ backgroundColor: '#059669', borderColor: '#059669' }}
            >
              <Download size={18} />
              {exporting ? 'Generating CSV...' : 'Download Shortlist CSV'}
            </button>
          </div>
        </div>

        {/* Responsible AI Compliance Card */}
        <div className="col-12 col-md-6">
          <div className="tb-card p-4 h-100">
            <div className="d-flex align-items-center gap-2.5 mb-3">
              <div className="rounded-3 p-2" style={{ backgroundColor: '#E6FFFA', color: '#00A896' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h5 className="fw-bold text-dark m-0">Compliance & Fairness Guard</h5>
                <div className="text-muted small">Responsible AI Decision Support Principles</div>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 text-secondary small">
              <div className="p-2.5 rounded-2 bg-light border d-flex align-items-start gap-2">
                <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-dark">Zero Protected Characteristics:</strong> Age, gender, photo, and background are strictly excluded from ranking calculations.
                </div>
              </div>

              <div className="p-2.5 rounded-2 bg-light border d-flex align-items-start gap-2">
                <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-dark">Zero Automated Rejection:</strong> Candidates are never rejected automatically; human recruiters retain complete decision authority.
                </div>
              </div>

              <div className="p-2.5 rounded-2 bg-light border d-flex align-items-start gap-2">
                <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-dark">Cryptographic Audit Trail:</strong> All status transitions, exports, and evaluations are logged in tamper-evident records.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live System Audit Log Stream */}
      <div className="tb-card overflow-hidden">
        <div className="p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <History size={18} className="text-teal" style={{ color: '#00A896' }} />
            <h6 className="fw-bold text-dark m-0">Live System Audit Log</h6>
            <span className="badge bg-light text-secondary border small">{filteredAuditLogs.length} Events</span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: '220px' }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search audit events..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select form-select-sm"
              style={{ width: '170px' }}
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
            >
              <option value="ALL">All Event Types</option>
              <option value="STAGE_TRANSITION">Stage Transitions</option>
              <option value="EXPORT_SHORTLIST_CSV">CSV Exports</option>
              <option value="APPLICATION_INGESTED">Applications</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-secondary" style={{ fontSize: '12px' }}>
                <th className="px-4 py-3" style={{ width: '160px' }}>Timestamp</th>
                <th style={{ width: '160px' }}>Actor</th>
                <th style={{ width: '180px' }}>Action Event</th>
                <th style={{ width: '120px' }}>Entity Type</th>
                <th>Contextual Metadata</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted small">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredAuditLogs.map((log) => (
                  <tr key={log.id} style={{ fontSize: '12.5px' }}>
                    <td className="px-4 text-muted font-monospace" style={{ fontSize: '11px' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="fw-semibold text-dark">
                      {log.actor_name}
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>
                      <span className="badge bg-light text-secondary border" style={{ fontSize: '10px' }}>
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="text-secondary">
                      {log.metadata}
                    </td>
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
