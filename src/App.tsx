
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import PrivateRoute from '@/components/auth/PrivateRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import LeadInbox from '@/pages/LeadInbox';
import NoticeBoard from '@/pages/NoticeBoard';
import NewLead from '@/pages/NewLead';
import Packages from '@/pages/Packages';
import AdminDashboard from '@/pages/AdminDashboard';
import SystemConfig from '@/pages/SystemConfig';
import EnvConfig from '@/pages/EnvConfig';
import SafariGuideOptimized from '@/pages/SafariGuideOptimized';
import NotFound from '@/pages/NotFound';
import ResetPassword from '@/pages/ResetPassword';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/safari-guide" element={<SafariGuideOptimized />} />
              
              {/* Protected routes with dashboard layout */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              <Route path="/leads" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <LeadInbox />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              <Route path="/notice-board" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <NoticeBoard />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              <Route path="/new-lead" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <NewLead />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              <Route path="/packages" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Packages />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              <Route path="/admin/system-config" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SystemConfig />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              <Route path="/admin/env-config" element={
                <PrivateRoute>
                  <DashboardLayout>
                    <EnvConfig />
                  </DashboardLayout>
                </PrivateRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
