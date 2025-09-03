
/**
 * Componente de layout principal da aplicação
 * Gerencia a estrutura básica da interface, incluindo cabeçalho, barra lateral e área de conteúdo
 * Implementa visualização responsiva para dispositivos móveis
 */
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import Header from './Header';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Renderiza o layout principal da aplicação
 * @param children - Conteúdo principal a ser renderizado dentro do layout
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile(); // Detecta se é dispositivo móvel
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Inicialmente fecha em dispositivos móveis

  /**
   * Efeito para ajustar automaticamente o estado da barra lateral quando muda de desktop para móvel ou vice-versa
   */
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false); // Fecha automaticamente em dispositivos móveis
    }
  }, [isMobile]);

  /**
   * Alterna a visibilidade da barra lateral
   */
  const alternarSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Fecha a sidebar quando um item é clicado (para móvel)
   */
  const fecharSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background relative">
        {/* Simplified background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-muted/30 rounded-full blur-2xl opacity-30"></div>
        </div>
        
        <Header toggleSidebar={alternarSidebar} />
        <div className="flex flex-1 overflow-hidden relative z-10">
          {/* Overlay para dispositivos móveis */}
          {sidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={fecharSidebar}
            />
          )}
          
          <Sidebar isOpen={sidebarOpen} onItemClick={fecharSidebar} />
          <main 
            className={`
              flex-1 overflow-auto transition-all duration-500 ease-in-out
              ${sidebarOpen && !isMobile ? 'md:pl-72' : ''}
              ${isMobile ? 'p-4' : 'p-6'}
            `}
          >
            <div className={`container mx-auto ${isMobile ? 'px-2' : 'px-4'}`}>
              <div className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl min-h-[calc(100vh-200px)] shadow-sm ${isMobile ? 'p-4' : 'p-6'}`}>
                {children}
              </div>
            </div>
          </main>
        </div>
        <Toaster />
        <Sonner />
      </div>
    </ThemeProvider>
  );
};

export default AppLayout;
