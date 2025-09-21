
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/layout/AppLayout";

// Public Pages
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Plans } from "./pages/Plans";

// Protected Pages (Dashboard)
import { Dashboard } from "./pages/Dashboard";
import { Clients } from "./pages/Clients";
import { Sales } from "./pages/Sales";
import Tasks from "./pages/Tasks";
import { CalendarPage } from "./pages/Calendar";
import { Reports } from "./pages/Reports";
import { Integrations } from "./pages/Integrations";
import { Chat } from "./pages/Chat";
import { Subscription } from "./pages/Subscription";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* ==================== ROTAS PÚBLICAS ==================== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/pricing" element={<Navigate to="/plans" replace />} />
          
          {/* ==================== ROTAS PROTEGIDAS (DASHBOARD) ==================== */}
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          
          {/* Clientes */}
          <Route path="/clients" element={<AppLayout><Clients /></AppLayout>} />
          <Route path="/clientes" element={<Navigate to="/clients" replace />} />
          
          {/* Vendas/Oportunidades */}
          <Route path="/sales" element={<AppLayout><Sales /></AppLayout>} />
          <Route path="/oportunidades" element={<Navigate to="/sales" replace />} />
          <Route path="/vendas" element={<Navigate to="/sales" replace />} />
          <Route path="/pipeline" element={<Navigate to="/sales" replace />} />
          
          {/* Tarefas */}
          <Route path="/tasks" element={<AppLayout><Tasks /></AppLayout>} />
          <Route path="/tarefas" element={<Navigate to="/tasks" replace />} />
          
          {/* Calendário */}
          <Route path="/calendar" element={<AppLayout><CalendarPage /></AppLayout>} />
          <Route path="/agenda" element={<Navigate to="/calendar" replace />} />
          
          {/* Relatórios */}
          <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
          <Route path="/relatorios" element={<Navigate to="/reports" replace />} />
          
          {/* Integrações */}
          <Route path="/integrations" element={<AppLayout><Integrations /></AppLayout>} />
          <Route path="/integracoes" element={<Navigate to="/integrations" replace />} />
          
          {/* Chat */}
          <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
          
          {/* Assinatura */}
          <Route path="/subscription" element={<AppLayout><Subscription /></AppLayout>} />
          <Route path="/assinatura" element={<Navigate to="/subscription" replace />} />
          <Route path="/billing" element={<Navigate to="/subscription" replace />} />
          
          {/* Configurações */}
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="/configuracoes" element={<Navigate to="/settings" replace />} />
          
          {/* Perfil */}
          <Route path="/profile" element={<AppLayout><div className="p-6"><h1 className="text-2xl font-bold">Perfil do Usuário</h1><p>Em desenvolvimento...</p></div></AppLayout>} />
          <Route path="/perfil" element={<Navigate to="/profile" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
