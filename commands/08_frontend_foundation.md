# Phase 08: Frontend Foundation & Application Shell

## 1. Objectives
- Establish the React + TypeScript frontend foundation with React Router v6.
- Implement `AuthContext` to handle JWT session state, login, and logout.
- Build the Axios API client with automatic `Authorization: Bearer <token>` injection.
- Design responsive layout with modern Topbar, Sidebar navigation, and content area.

## 2. Implementation Commands & Source Files
Run the following PowerShell commands:

```powershell
# 1. Create frontend/src/services/api.ts
Set-Content -Path "frontend\src\services\api.ts" -Value @"
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tb_token');
  if (token && config.headers) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tb_token');
      localStorage.removeItem('tb_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
"@

# 2. Create frontend/src/hooks/useAuth.tsx
Set-Content -Path "frontend\src\hooks\useAuth.tsx" -Value @"
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('tb_token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('tb_user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('tb_token', newToken);
    localStorage.setItem('tb_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('tb_token');
    localStorage.removeItem('tb_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
"@

# 3. Create frontend/src/layouts/AppLayout.tsx
Set-Content -Path "frontend\src\layouts\AppLayout.tsx" -Value @"
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileUp, 
  Award, 
  GitBranch, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/candidates', label: 'Candidates', icon: Users },
    { to: '/resumes', label: 'Resume Upload', icon: FileUp },
    { to: '/matching', label: 'Matching & Rank', icon: Award },
    { to: '/pipeline', label: 'Pipeline', icon: GitBranch },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className='d-flex' style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* Sidebar */}
      <div className='bg-dark text-white p-3 d-flex flex-column' style={{ width: '250px' }}>
        <h4 className='fw-bold text-teal mb-4' style={{ color: '#14B8A6' }}>TalentBridge</h4>
        <nav className='nav flex-column gap-2 flex-grow-1'>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={\`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded \${
                  active ? 'bg-primary text-white' : 'text-light'
                }\`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className='border-top border-secondary pt-3'>
          <div className='small text-muted mb-1'>{user?.name} ({user?.role})</div>
          <button onClick={handleLogout} className='btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2'>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-grow-1 d-flex flex-column overflow-auto'>
        <header className='bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center'>
          <h5 className='m-0 fw-semibold text-secondary'>Candidate Screening & Ranking Platform</h5>
          <span className='badge bg-light text-dark border'>Status: Online</span>
        </header>
        <main className='p-4 flex-grow-1'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
"@
```

## 3. Phase 08 Acceptance Criteria Check
- [x] Axios instance configured with auto-token headers and 401 handling.
- [x] `AuthContext` provides responsive session state across application.
- [x] Responsive layout with persistent navigation sidebar and header.

