
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
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

const queryClient = new QueryClient();

function App() {
  return (
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
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
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
