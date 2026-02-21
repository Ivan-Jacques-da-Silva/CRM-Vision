import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '@/assets/VisionCRM_Logo.png';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-card border-b border-white/20 dark:border-gray-700/20 sparkle-effect">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 interactive-element group">
            <img
              src={logo}
              alt="VisionCRM"
              className="h-12 w-auto transition-transform duration-300 group-hover:scale-105 invert dark:invert-0"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={cn(
                'text-sm font-medium transition-all duration-300 interactive-element relative group',
                isActive('/') ? 'text-primary glow-effect' : 'text-muted-foreground hover:text-primary'
              )}
            >
              Inicio
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/plans"
              className={cn(
                'text-sm font-medium transition-all duration-300 interactive-element relative group',
                isActive('/plans') ? 'text-primary glow-effect' : 'text-muted-foreground hover:text-primary'
              )}
            >
              Planos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild size="sm" className="glass-button hover-fix interactive-element">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="shine-effect interactive-element morphing-border glass-button">
              <Link to="/register">Registrar</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
