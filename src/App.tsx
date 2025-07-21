
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';

// Pages
import Index from '@/pages/Index';
import SafariGuide from '@/pages/SafariGuide';
import Login from '@/pages/Login';
import AdminLogin from '@/pages/AdminLogin';
import Dashboard from '@/pages/Dashboard';
import LeadInbox from '@/pages/LeadInbox';
import Packages from '@/pages/Packages';
import Profile from '@/pages/Profile';
import AdminDashboard from '@/pages/AdminDashboard';
import SystemConfig from '@/pages/SystemConfig';
import EnvConfig from '@/pages/EnvConfig';
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
          <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/safari-guide" element={<SafariGuide />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Protected Operator Routes */}
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
                    <LeadInbox />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/packages"
                element={
                  <PrivateRoute>
                    <Packages />
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
                path="/new-lead"
                element={
                  <PrivateRoute>
                    <NewLead />
                  </PrivateRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute requireAdmin={true}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/system-config"
                element={
                  <PrivateRoute requireAdmin={true}>
                    <SystemConfig />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/env-config"
                element={
                  <PrivateRoute requireAdmin={true}>
                    <EnvConfig />
                  </PrivateRoute>
                }
              />

              {/* Legacy admin route - redirect to new admin dashboard */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
