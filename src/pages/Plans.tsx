
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  ArrowLeft, 
  Crown,
  Zap,
  Rocket
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const Plans: React.FC = () => {
  const plans = [
    {
      id: 'inicial',
      name: 'Inicial',
      price: 'R$ 297',
      period: '/mês',
      description: 'Perfeito para pequenas empresas que estão começando',
      icon: <Zap className="w-6 h-6" />,
      popular: false,
      features: [
        'Gestão de contatos',
        'Pipeline de vendas',
        'Suporte por e-mail',
        'Atalho WhatsApp Web',
        'Até 1.000 contatos',
        'Relatórios básicos'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: 'R$ 497',
      period: '/mês',
      description: 'Ideal para empresas em crescimento',
      icon: <Crown className="w-6 h-6" />,
      popular: true,
      features: [
        'Gestão completa de vendas',
        'Automações básicas',
        'Integração com WhatsApp, Facebook, Instagram',
        'Até 10.000 contatos',
        'Relatórios avançados',
        'Suporte prioritário',
        'API de integração',
        'Campos personalizados'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R$ 897',
      period: '/mês',
      description: 'Para empresas que precisam do máximo de performance',
      icon: <Rocket className="w-6 h-6" />,
      popular: false,
      features: [
        'Automatização SDR via WhatsApp',
        'Integrações personalizadas',
        'BI e análise de dados',
        'Contatos ilimitados',
        'Suporte dedicado 24/7',
        'Treinamento personalizado',
        'Webhooks avançados',
        'Multi-empresa',
        'White-label disponível'
      ]
    }
  ];

  const handleSelectPlan = (planId: string) => {
    // TODO: integrar com Stripe Checkout (plano Inicial, Business ou Enterprise)
    console.log(`Plano selecionado: ${planId}`);
    alert(`Redirecionamento para checkout do plano ${planId} (integração com Stripe em desenvolvimento)`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Escolha o Plano Ideal para seu Negócio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Acelere suas vendas com as ferramentas certas. Todos os planos incluem teste grátis de 7 dias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary"
                >
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price}<span className="text-lg font-normal text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full mt-6"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Começar Agora
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  ✨ 7 dias grátis • Cancele quando quiser
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Dúvidas sobre os Planos?</h3>
          <p className="text-muted-foreground mb-6">
            Nossa equipe está pronta para ajudar você a escolher o melhor plano
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/contact">Falar com Vendas</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/demo">Agendar Demo</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 bg-muted/20 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-4">💰 Garantia de 30 dias</h3>
          <p className="text-muted-foreground">
            Não está satisfeito? Devolvemos 100% do seu dinheiro em até 30 dias, sem perguntas.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};
