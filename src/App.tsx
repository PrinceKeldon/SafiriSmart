
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import PrivateRoute from '@/components/auth/PrivateRoute';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import NoticeBoard from '@/pages/NoticeBoard';
import PackageManagement from '@/components/packages/PackageManagement';
import Profile from '@/pages/Profile';
import Config from '@/pages/Config';
import AdminDashboard from '@/pages/AdminDashboard';
import NewLead from '@/pages/NewLead';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/notice-board"
                element={
                  <PrivateRoute>
                    <NoticeBoard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/packages"
                element={
                  <PrivateRoute>
                    <PackageManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/config"
                element={
                  <PrivateRoute>
                    <Config />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/new-lead"
                element={
                  <PrivateRoute>
                    <NewLead />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
