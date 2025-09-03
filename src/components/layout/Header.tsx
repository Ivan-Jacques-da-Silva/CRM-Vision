
import React, { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="sticky top-0 z-40 h-16 glass-card border-b border-white/20 dark:border-gray-700/20 flex items-center justify-between px-4 md:px-6 sparkle-effect">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-2 glass-button hover-fix interactive-element"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="text-xl font-bold text-primary hidden md:flex items-center animate-fade-in">
          <span className="text-foreground">Vision</span>
          <span className="text-primary animated-gradient bg-clip-text text-transparent">CRM</span>
        </div>
      </div>
      
      <div className="flex-1 max-w-md mx-4 slide-up">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="search"
            placeholder="Buscar clientes, tarefas, oportunidades..."
            className="pl-9 glass-card border-white/30 dark:border-gray-600/30 focus:ring-2 focus:ring-primary/50 hover-fix interactive-element"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative glass-button hover-fix interactive-element"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center glow-effect floating-element">
                2
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 glass-card morphing-border fade-in-scale">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Notificações</h4>
              <div className="divide-y divide-border/50">
                <div className="py-2 hover-fix interactive-element rounded px-2">
                  <p className="text-sm font-medium">Nova tarefa atribuída</p>
                  <p className="text-xs text-muted-foreground">Há 5 minutos</p>
                </div>
                <div className="py-2 hover-fix interactive-element rounded px-2">
                  <p className="text-sm font-medium">Proposta aceita</p>
                  <p className="text-xs text-muted-foreground">Há 30 minutos</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="glass-button hover-fix interactive-element"
        >
          {theme === 'dark' ? 
            <Sun className="h-5 w-5 animate-[spin_2s_linear_infinite]" /> : 
            <Moon className="h-5 w-5" />
          }
        </Button>
      </div>
    </header>
  );
};

export default Header;
