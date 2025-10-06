
/**
 * Componente da barra lateral de navegação
 * Fornece navegação principal do aplicativo VisionCRM com suporte para exibição em dispositivos móveis
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  LineChart,
  Settings,
  Calendar,
  BadgeDollarSign,
  CreditCard,
  Webhook,
  MessageCircle,
  Trophy,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onItemClick?: () => void;
}

/**
 * Renderiza a barra lateral com opções de navegação
 * @param isOpen - Indica se a barra lateral está expandida ou recolhida
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onItemClick }) => {
  const itensMenu = [
    { nome: 'Dashboard', caminho: '/dashboard', Icone: LayoutDashboard },
    { nome: 'Clientes', caminho: '/clients', Icone: Users },
    { nome: 'Vendas', caminho: '/sales', Icone: BadgeDollarSign },
    { nome: 'Tarefas', caminho: '/tasks', Icone: ClipboardCheck },
    { nome: 'Chat', caminho: '/chat', Icone: MessageCircle },
    { nome: 'Agenda', caminho: '/calendar', Icone: Calendar },
    { nome: 'Relatórios', caminho: '/reports', Icone: LineChart },
    { nome: 'Ranking', caminho: '/ranking', Icone: Trophy },
    { nome: 'Integrações', caminho: '/integrations', Icone: Webhook },
    { nome: 'Assinatura', caminho: '/subscription', Icone: CreditCard },
    { nome: 'Configurações', caminho: '/settings', Icone: Settings },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-64px)] z-40 transition-all duration-500 transform glass-card border-r border-white/20 dark:border-gray-700/20',
        isOpen ? 'w-64' : 'w-16 md:w-16 -translate-x-full md:translate-x-0'
      )}
    >
      <nav className="flex flex-col p-2 h-full">
        <ul className="space-y-2 flex-1">
          {itensMenu.map((item, index) => (
            <li 
              key={item.nome} 
              style={{ animationDelay: `${index * 0.1}s` }} 
              className="slide-up"
            >
              <NavLink
                to={item.caminho}
                onClick={onItemClick}
                className={({ isActive }) => cn(
                  'flex items-center px-3 py-3 rounded-lg transition-colors duration-300 group relative overflow-hidden',
                  isActive 
                    ? 'bg-primary/20 text-primary backdrop-blur-sm' 
                    : 'text-sidebar-foreground hover:bg-accent/50',
                  !isOpen && 'justify-center md:justify-center'
                )}
              >
                <item.Icone className={cn(
                  'h-5 w-5 transition-colors duration-300', 
                  !isOpen && 'md:mx-auto'
                )} />
                {isOpen && (
                  <span className="ml-3 truncate relative z-10 font-medium">
                    {item.nome}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto border-t border-white/20 dark:border-gray-700/20 pt-4 flex flex-col gap-2">
          <div className="flex items-center px-3 py-3 text-sm text-sidebar-foreground glass-card rounded-lg">
            {isOpen ? (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Admin User</p>
                  <p className="text-xs opacity-70">Administrador</p>
                </div>
              </>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white mx-auto font-bold text-lg">
                A
              </div>
            )}
          </div>
          
          {/* Botão de Logout */}
          <NavLink
            to="/"
            onClick={onItemClick}
            className={cn(
              'flex items-center px-3 py-3 rounded-lg transition-colors duration-300 text-destructive hover:bg-destructive/10 glass-card',
              !isOpen && 'justify-center'
            )}
          >
            <LogOut className={cn('h-5 w-5', !isOpen && 'mx-auto')} />
            {isOpen && <span className="ml-3 font-medium">Sair</span>}
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};
