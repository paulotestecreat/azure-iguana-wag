import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing"; // Importar a nova Landing page
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import RegisterTransaction from "./pages/RegisterTransaction";
import Transactions from "./pages/Transactions";
import DebtsGoals from "./pages/DebtsGoals";
import ProfileLimits from "./pages/ProfileLimits";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} /> {/* Definir Landing como a rota raiz */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register-transaction" element={<RegisterTransaction />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/debts-goals" element={<DebtsGoals />} />
          <Route path="/profile-limits" element={<ProfileLimits />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;