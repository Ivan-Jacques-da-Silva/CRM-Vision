/**
 * Componente da barra lateral de navegação
 * Fornece navegação principal do aplicativo VisionCRM com suporte para exibição em dispositivos móveis
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  LogOut,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buscarDadosUsuario, buscarEmpresaAtual, logout, getAvatarUrl } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';

interface SidebarProps {
  isOpen: boolean;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onItemClick }) => {
  const navigate = useNavigate();

  const { data: dadosUsuario } = useQuery({
    queryKey: ['dados-usuario'],
    queryFn: buscarDadosUsuario,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: dadosEmpresa } = useQuery({
    queryKey: ['dados-empresa'],
    queryFn: buscarEmpresaAtual,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const userName =
    dadosUsuario?.usuario?.nome ||
    dadosUsuario?.nome ||
    dadosUsuario?.user?.nome ||
    'Usuário';

  const userAvatarPath = 
    dadosUsuario?.usuario?.avatar || 
    dadosUsuario?.avatar || 
    dadosUsuario?.user?.avatar;

  const userAvatar = getAvatarUrl(userAvatarPath);

  const companyName =
    dadosEmpresa?.empresa?.nome ||
    dadosEmpresa?.nome ||
    dadosUsuario?.usuario?.empresa?.nome ||
    dadosUsuario?.empresa?.nome ||
    dadosUsuario?.empresaNome ||
    'Empresa não informada';

  const inicial =
    userName && userName.trim().length > 0
      ? userName.trim().charAt(0).toUpperCase()
      : 'U';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout', error);
      navigate('/login');
    }
  };
  
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
    { nome: 'Configurações', caminho: '/settings', Icone: Settings },
    { nome: 'Assinatura', caminho: '/subscription', Icone: CreditCard },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-64px)] z-40 transition-all duration-500 transform sidebar-surface',
        isOpen ? 'w-64' : 'w-16 md:w-16 -translate-x-full md:translate-x-0'
      )}
    >
      <nav className="h-full flex flex-col bg-sidebar border-r border-sidebar-border shadow-xl backdrop-blur-xl">
        <ul className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {itensMenu.map((item) => (
            <li key={item.caminho}>
              <NavLink
                to={item.caminho}
                onClick={onItemClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                    !isOpen && 'justify-center px-2'
                  )
                }
              >
                <item.Icone
                  className={cn(
                    'h-5 w-5 transition-transform duration-300 group-hover:scale-110',
                    !isOpen && 'mx-auto'
                  )}
                />
                {isOpen && (
                  <span className="ml-3 truncate relative z-10 font-medium">
                    {item.nome}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-[hsl(var(--sidebar-border)/0.7)] pt-4 flex flex-col gap-2">
          <div
            className={cn(
              'flex items-center px-3 py-3 text-sm text-sidebar-foreground rounded-lg bg-[hsl(var(--sidebar-accent)/0.35)] border border-[hsl(var(--sidebar-border)/0.7)]',
              !isOpen && 'justify-center px-2'
            )}
          >
            {isOpen ? (
              <>
                <Avatar className="h-10 w-10 shrink-0 border border-border">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                    {inicial}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 min-w-0">
                  <p className="font-semibold truncate">{userName}</p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">{companyName}</p>
                </div>
              </>
            ) : (
              <Avatar className="h-10 w-10 shrink-0 border border-border">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                  {inicial}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <NavLink
              to="/"
              onClick={onItemClick}
              className={cn(
                'flex flex-1 items-center px-3 py-3 rounded-lg transition-colors duration-300 text-sidebar-foreground hover:bg-accent/20 bg-[hsl(var(--sidebar-accent)/0.35)] border border-[hsl(var(--sidebar-border)/0.7)]',
                !isOpen && 'justify-center px-2'
              )}
            >
              <Home className={cn('h-5 w-5', !isOpen && 'mx-auto')} />
              {isOpen && <span className="ml-3 font-medium">Voltar ao site</span>}
            </NavLink>

            <NavLink
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className={cn(
                'flex flex-1 items-center px-3 py-3 rounded-lg transition-colors duration-300 text-destructive hover:bg-destructive/12 bg-[hsl(var(--sidebar-accent)/0.35)] border border-[hsl(var(--sidebar-border)/0.7)]',
                !isOpen && 'justify-center px-2'
              )}
            >
              <LogOut className={cn('h-5 w-5', !isOpen && 'mx-auto')} />
              {isOpen && <span className="ml-3 font-medium">Sair</span>}
            </NavLink>
          </div>
        </div>
      </nav>
    </aside>
  );
};
