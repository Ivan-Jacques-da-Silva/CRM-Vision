
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Zap, 
  Shield, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const Home: React.FC = () => {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestão de Contatos",
      description: "Organize e gerencie todos os seus contatos em um só lugar"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Pipeline de Vendas",
      description: "Visualize e acompanhe suas oportunidades através do funil"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Integração WhatsApp",
      description: "Conecte com WhatsApp, Facebook e Instagram"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Automações",
      description: "Automatize tarefas repetitivas e ganhe produtividade"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Segurança",
      description: "Seus dados protegidos com a mais alta segurança"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Relatórios",
      description: "Insights e análises para otimizar suas vendas"
    }
  ];

  const testimonials = [
    {
      name: "João Silva",
      company: "TechCorp",
      content: "O VisionCRM revolucionou nossa gestão de vendas. Aumentamos 40% nossa conversão!",
      rating: 5
    },
    {
      name: "Maria Santos",
      company: "Digital Solutions",
      content: "Interface intuitiva e recursos poderosos. Recomendo para qualquer empresa.",
      rating: 5
    },
    {
      name: "Pedro Oliveira",
      company: "StartupX",
      content: "Finalmente um CRM que funciona de verdade. Equipe mais produtiva!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Novo: Automação SDR via WhatsApp
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            O CRM que <span className="text-primary">Impulsiona</span> suas Vendas
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerencie contatos, automatize processos e aumente suas vendas com nossa plataforma completa de CRM.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/register">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link to="/plans">Ver Planos</Link>
            </Button>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            ✨ Teste grátis por 7 dias • Sem cartão de crédito
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Recursos que Fazem a Diferença
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Todas as ferramentas que você precisa para gerenciar e crescer seu negócio.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-background">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10k+</div>
              <div className="text-muted-foreground">Empresas Confiam</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">40%</div>
              <div className="text-muted-foreground">Aumento em Vendas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Suporte Técnico</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              Histórias reais de sucesso com o VisionCRM
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background border-0 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Transformar suas Vendas?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de empresas que já escolheram o VisionCRM
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <Link to="/register">
              Começar Teste Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <div className="mt-4 text-sm opacity-75">
            ✨ 14 dias grátis • Cancele quando quiser
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
