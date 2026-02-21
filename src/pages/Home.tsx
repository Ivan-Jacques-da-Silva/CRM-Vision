import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  LineChart,
  MessageSquareText,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

const features = [
  {
    icon: Users,
    title: 'Cadastro inteligente de clientes',
    description: 'Centralize contatos, historico de compra e interacoes em segundos.',
  },
  {
    icon: Workflow,
    title: 'Pipeline visual de oportunidades',
    description: 'Acompanhe cada lead por etapa e identifique gargalos do funil.',
  },
  {
    icon: MessageSquareText,
    title: 'WhatsApp e redes no mesmo lugar',
    description: 'Converse com leads sem trocar de tela e mantenha tudo registrado.',
  },
  {
    icon: Bot,
    title: 'Automacoes para SDR e CS',
    description: 'Dispare tarefas, lembretes e follow-ups automaticamente.',
  },
  {
    icon: ShieldCheck,
    title: 'Governanca e seguranca',
    description: 'Controle de acesso por equipe e protecao de dados em toda a base.',
  },
  {
    icon: BarChart3,
    title: 'Relatorios em tempo real',
    description: 'Veja conversao, ticket medio e previsao de receita com clareza.',
  },
];

const processSteps = [
  {
    icon: Target,
    title: 'Capte e organize leads',
    description: 'Importe planilhas, formularios e campanhas em um unico fluxo.',
  },
  {
    icon: CalendarClock,
    title: 'Execute rotina comercial',
    description: 'Crie cadencias, tarefas e agendas para nao perder oportunidades.',
  },
  {
    icon: LineChart,
    title: 'Escalone com dados',
    description: 'Ajuste sua estrategia com base em indicadores de desempenho.',
  },
];

const testimonials = [
  {
    name: 'Renata Lima',
    role: 'Head de Vendas, Nexus',
    text: 'Em 60 dias reduzimos o ciclo de vendas em 27% com o novo fluxo no VisionCRM.',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Diego Martins',
    role: 'CEO, Orbit Tech',
    text: 'A equipe passou a trabalhar com previsibilidade. O pipeline ficou muito mais claro.',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Amanda Costa',
    role: 'COO, MarketUp',
    text: 'Saiu do caos de planilhas para uma operacao com metas, cadencia e visao de receita.',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  },
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="overflow-hidden">
        <section className="relative isolate">
          <div className="absolute inset-x-0 top-[-14rem] -z-10 h-[32rem] bg-gradient-to-br from-cyan-200 via-sky-100 to-transparent blur-3xl dark:from-cyan-900/40 dark:via-sky-800/30" />
          <div className="absolute -left-24 top-24 -z-10 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-700/30" />
          <div className="absolute -right-16 top-16 -z-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-700/30" />

          <div className="container mx-auto px-4 py-14 md:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge className="mb-4 bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900">
                  CRM focado em crescimento previsivel
                </Badge>
                <h1 className="mb-5 text-4xl font-bold leading-tight md:text-6xl">
                  Venda com mais controle e menos atrito no dia a dia comercial
                </h1>
                <p className="mb-7 max-w-xl text-lg text-slate-600 dark:text-slate-300">
                  O VisionCRM conecta marketing, vendas e pos-venda com automacao, indicadores e rotina de equipe em um unico painel.
                </p>

                <div className="mb-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild className="bg-slate-900 text-white hover:bg-slate-800">
                    <Link to="/register">
                      Iniciar teste gratis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="border-slate-300 bg-white/70">
                    <Link to="/plans">Ver planos</Link>
                  </Button>
                </div>

                <div className="grid gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Sem cartao de credito por 7 dias
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Onboarding guiado para sua equipe
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Integracao com WhatsApp e funil de vendas
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=80"
                    alt="Equipe comercial acompanhando dashboard de CRM"
                    className="h-[420px] w-full object-cover"
                    loading="lazy"
                  />
                  <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-3 text-center text-xs md:text-sm">
                      <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                        <p className="font-semibold">+42%</p>
                        <p className="text-slate-500 dark:text-slate-400">Conversao</p>
                      </div>
                      <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                        <p className="font-semibold">-31%</p>
                        <p className="text-slate-500 dark:text-slate-400">Ciclo medio</p>
                      </div>
                      <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                        <p className="font-semibold">99.9%</p>
                        <p className="text-slate-500 dark:text-slate-400">Disponibilidade</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-cyan-200 bg-white/95 p-4 shadow-xl backdrop-blur md:block dark:border-cyan-900 dark:bg-slate-900/95">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Pipeline ativo</p>
                  <p className="text-xl font-bold">R$ 1.280.000</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Recursos principais
              </p>
              <h2 className="mb-3 text-3xl font-bold md:text-4xl">Tudo o que seu time precisa para vender melhor</h2>
              <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                Menos operacao manual, mais foco no que gera receita. Estrutura completa para lideres e executores.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="group border-slate-200 bg-white/90 transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90"
                  >
                    <CardHeader>
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 transition group-hover:bg-cyan-700 group-hover:text-white dark:bg-cyan-900/40 dark:text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-white to-slate-100 py-20 dark:from-slate-950 dark:to-slate-900">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold md:text-4xl">Como o VisionCRM organiza sua operacao</h2>
              <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                Um fluxo simples para tirar seu time do improviso e colocar a maquina comercial para rodar.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={step.title} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                          {index + 1}
                        </span>
                        <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold md:text-4xl">Times reais, resultados reais</h2>
              <p className="text-slate-600 dark:text-slate-300">Empresas que trocaram planilha por previsibilidade de receita.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="pt-6">
                    <Quote className="mb-3 h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                    <p className="mb-5 text-slate-700 dark:text-slate-200">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-11 w-11 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-20">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl bg-slate-900 px-6 py-14 text-center text-white md:px-10">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Seu proximo salto de vendas comeca aqui</h2>
              <p className="mx-auto mb-8 max-w-2xl text-slate-200">
                Estruture funil, acelere atendimento e acompanhe o desempenho em um CRM feito para time comercial de verdade.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" asChild className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  <Link to="/register">
                    Criar conta agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                  <Link to="/plans">Comparar planos</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
