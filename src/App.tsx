
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/auth/PrivateRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import LeadInbox from "./pages/LeadInbox";
import NoticeBoard from "./pages/NoticeBoard";
import NewLead from "./pages/NewLead";
import Packages from "./pages/Packages";
import AdminDashboard from "./pages/AdminDashboard";
import SafariGuide from "./pages/SafariGuide";
import SafariGuideOptimized from "./pages/SafariGuideOptimized";
import SystemConfig from "./pages/SystemConfig";
import EnvConfig from "./pages/EnvConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/safari-guide" element={<SafariGuide />} />
              <Route path="/safari-guide-optimized" element={<SafariGuideOptimized />} />
              
              {/* Protected operator routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/leads" element={
                <PrivateRoute>
                  <LeadInbox />
                </PrivateRoute>
              } />
              <Route path="/notice-board" element={
                <PrivateRoute>
                  <NoticeBoard />
                </PrivateRoute>
              } />
              <Route path="/new-lead" element={
                <PrivateRoute>
                  <NewLead />
                </PrivateRoute>
              } />
              <Route path="/packages" element={
                <PrivateRoute>
                  <Packages />
                </PrivateRoute>
              } />
              
              {/* Protected admin routes */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute requireAdmin>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/admin/system-config" element={
                <PrivateRoute requireAdmin>
                  <SystemConfig />
                </PrivateRoute>
              } />
              <Route path="/admin/env-config" element={
                <PrivateRoute requireAdmin>
                  <EnvConfig />
                </PrivateRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
