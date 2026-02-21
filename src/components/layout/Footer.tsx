import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/VisionCRM_Logo.png';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            <img
              src={logo}
              alt="VisionCRM"
              className="mb-3 h-12 w-auto invert dark:invert-0"
            />
            <p className="text-sm text-muted-foreground">
              CRM para organizar clientes, acompanhar oportunidades e acelerar vendas com previsibilidade.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              Inicio
            </Link>
            <Link to="/plans" className="text-muted-foreground hover:text-primary">
              Planos
            </Link>
            <Link to="/login" className="text-muted-foreground hover:text-primary">
              Login
            </Link>
            <Link to="/register" className="text-muted-foreground hover:text-primary">
              Criar conta
            </Link>
          </nav>
        </div>

        <div className="mt-6 border-t pt-4 text-sm text-muted-foreground">
          © {year} VisionCRM. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
