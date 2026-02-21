
/**
 * Componente da barra lateral de navegação
 * Fornece navegação principal do aplicativo VisionCRM com suporte para exibição em dispositivos móveis
 */
import React, { useEffect, useState } from 'react';
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
import { buscarDadosUsuario } from '@/services/api';

interface SidebarProps {
  isOpen: boolean;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onItemClick }) => {
  const [userName, setUserName] = useState<string>('Usuário');

  useEffect(() => {
    let isMounted = true;

    const carregarUsuario = async () => {
      try {
        const response = await buscarDadosUsuario();
        const nome =
          response?.usuario?.nome ||
          response?.nome ||
          response?.user?.nome ||
          'Usuário';

        if (isMounted && typeof nome === 'string' && nome.trim().length > 0) {
          setUserName(nome);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    carregarUsuario();

    return () => {
      isMounted = false;
    };
  }, []);

  const inicial =
    userName && userName.trim().length > 0
      ? userName.trim().charAt(0).toUpperCase()
      : 'U';

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
        'fixed left-0 top-16 h-[calc(100vh-64px)] z-40 transition-all duration-500 transform sidebar-surface',
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
                  'sidebar-nav-item flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden',
                  isActive 
                    ? 'sidebar-nav-item-active'
                    : '',
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
        
        <div className="mt-auto border-t border-[hsl(var(--sidebar-border)/0.7)] pt-4 flex flex-col gap-2">
          <div className="flex items-center px-3 py-3 text-sm text-sidebar-foreground rounded-lg bg-[hsl(var(--sidebar-accent)/0.35)] border border-[hsl(var(--sidebar-border)/0.7)]">
            {isOpen ? (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {inicial}
                </div>
                <div className="ml-3">
                  <p className="font-semibold truncate">{userName}</p>
                </div>
              </>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white mx-auto font-bold text-lg">
                {inicial}
              </div>
            )}
          </div>
          
          {/* Botão de Logout */}
          <NavLink
            to="/"
            onClick={onItemClick}
            className={cn(
              'flex items-center px-3 py-3 rounded-lg transition-colors duration-300 text-destructive hover:bg-destructive/12 bg-[hsl(var(--sidebar-accent)/0.35)] border border-[hsl(var(--sidebar-border)/0.7)]',
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
