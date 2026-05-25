import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { initializeAnalytics } from '@/utils/analytics';
import { useEffect } from 'react';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import AdminLogin from '@/pages/AdminLogin';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import LeadInbox from '@/pages/LeadInbox';
import Profile from '@/pages/Profile';
import Packages from '@/pages/Packages';
import SafariGuide from '@/pages/SafariGuide';
import NewLead from '@/pages/NewLead';
import NoticeBoard from '@/pages/NoticeBoard';
import NotFound from '@/pages/NotFound';
import EdgeFunctionTest from '@/pages/EdgeFunctionTest';
import Notifications from '@/pages/Notifications';
import AgenticPlanner from '@/components/preferences/AgenticPlanner';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Initialize Google Analytics if tracking ID is available
    const trackingId = 'G-XXXXXXXXXX'; // Replace with your actual tracking ID
    if (trackingId && trackingId !== 'G-XXXXXXXXXX') {
      initializeAnalytics(trackingId);
    }
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/safari-guide" element={<SafariGuide />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <PrivateRoute requireAdmin>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/leads"
                  element={
                    <PrivateRoute>
                      <LeadInbox />
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
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
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
                  path="/packages"
                  element={
                    <PrivateRoute>
                      <Packages />
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
                  path="/new-lead"
                  element={
                    <PrivateRoute>
                      <NewLead />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/notice-board"
                  element={
                    <PrivateRoute>
                      <NoticeBoard />
                    </PrivateRoute>
                  }
                />
                <Route path="/test-functions" element={<EdgeFunctionTest />} />
                <Route
                  path="/notifications"
                  element={
                    <PrivateRoute>
                      <Notifications />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
