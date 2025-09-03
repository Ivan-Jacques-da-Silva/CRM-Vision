
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-bold mb-4">
              <span className="text-foreground">Vision</span>
              <span className="text-primary">CRM</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A plataforma de CRM que impulsiona suas vendas e acelera o crescimento do seu negócio.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-primary">
                  Recursos
                </Link>
              </li>
              <li>
                <Link to="/plans" className="text-muted-foreground hover:text-primary">
                  Planos
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="text-muted-foreground hover:text-primary">
                  Integrações
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-muted-foreground hover:text-primary">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-primary">
                  Carreiras
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-primary">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-muted-foreground hover:text-primary">
                  Documentação
                </Link>
              </li>
              <li>
                <Link to="/status" className="text-muted-foreground hover:text-primary">
                  Status
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-muted-foreground hover:text-primary">
                  Segurança
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © 2024 VisionCRM. Todos os direitos reservados.
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacidade
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Termos
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
