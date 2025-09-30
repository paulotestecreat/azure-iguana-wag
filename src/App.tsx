import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import RegisterTransaction from "./pages/RegisterTransaction";
import Transactions from "./pages/Transactions";
import DebtsGoals from "./pages/DebtsGoals";
import ProfileLimits from "./pages/ProfileLimits";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage"; // Importar a nova página de login
import { SupabaseAuthProvider } from "./integrations/supabase/supabaseAuth"; // Importar o provedor de autenticação
import AuthGuard from "./components/AuthGuard"; // Importar o AuthGuard

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SupabaseAuthProvider> {/* Envolver toda a aplicação com o provedor de autenticação */}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} /> {/* Adicionar rota para a página de login */}
            
            {/* Rotas protegidas pelo AuthGuard */}
            <Route element={<AuthGuard />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/register-transaction" element={<RegisterTransaction />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/debts-goals" element={<DebtsGoals />} />
              <Route path="/profile-limits" element={<ProfileLimits />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SupabaseAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;