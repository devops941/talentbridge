import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { Candidates } from './pages/Candidates';
import { ResumeUpload } from './pages/ResumeUpload';
import { MatchingRanking } from './pages/MatchingRanking';
import { Pipeline } from './pages/Pipeline';
import { Reports } from './pages/Reports';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Home & Feature Showcase Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Authentication Page */}
          <Route path="/login" element={<Login />} />

          {/* Protected Recruiter Portal Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/resumes" element={<ResumeUpload />} />
            <Route path="/matching" element={<MatchingRanking />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
