
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NewLead from "./pages/NewLead";
import Packages from "./pages/Packages";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import EnvConfig from "./pages/EnvConfig";
import SafariGuide from "./pages/SafariGuide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/safari-guide" element={<SafariGuide />} />
          <Route path="/config" element={<EnvConfig />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-lead" element={<NewLead />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
