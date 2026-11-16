import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, Users, FileCheck, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-teal" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Active Job Postings', value: data?.active_jobs ?? 0, icon: Briefcase, color: '#3B82F6' },
    { label: 'Total Candidate Profiles', value: data?.total_candidates ?? 0, icon: Users, color: '#10B981' },
    { label: 'Resumes Processed', value: data?.resumes_processed ?? 0, icon: FileCheck, color: '#8B5CF6' },
    { label: 'Shortlisted Candidates', value: data?.shortlisted_candidates ?? 0, icon: CheckCircle2, color: '#0D9488' },
  ];

  const chartData = data?.stage_funnel?.map((item: any) => ({
    name: item.stage,
    candidates: item.count,
  })) || [];

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark m-0">Recruitment Operations Overview</h3>
        <p className="text-muted small">Real-time candidate pipelines and AI screening analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div className="col-12 col-sm-6 col-xl-3" key={idx}>
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small fw-medium">{kpi.label}</span>
                  <div className="p-2 rounded-2" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                    <Icon size={20} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark m-0">{kpi.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Chart */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3">Recruitment Funnel by Stage</h5>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0} 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Bar dataKey="candidates" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3">Explainable Scoring Principles</h5>
            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="fw-semibold text-teal mb-1" style={{ color: '#0D9488' }}>
                70% Skill Coverage
              </div>
              <p className="small text-muted m-0">
                Calculated strictly from verified required skills identified in candidate resume against the vacancy requirement.
              </p>
            </div>
            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="fw-semibold text-primary mb-1">
                30% TF-IDF Cosine Similarity
              </div>
              <p className="small text-muted m-0">
                Mathematical vector angle comparison between job description terms and candidate experience text.
              </p>
            </div>
            <div className="small text-muted fst-italic">
              * Note: Scores are decision support aids only. Recruiters conduct final evaluation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
