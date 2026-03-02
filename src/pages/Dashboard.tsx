
import React, { useEffect, useState } from 'react';
import { Users, FileText, ClipboardCheck, Trophy } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { buscarClientes, buscarOportunidades, buscarTarefas, buscarRankingVendas } from '@/services/api';

interface DashboardStats {
  totalClientes: number;
  novosClientesMes: number;
  totalTarefas: number;
  tarefasHoje: number;
  totalPropostas: number;
  propostasPendentes: number;
  topSellerName: string | null;
  topSellerSalesCount: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

const formatInteger = (value: number) =>
  value.toLocaleString('pt-BR');

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    novosClientesMes: 0,
    totalTarefas: 0,
    tarefasHoje: 0,
    totalPropostas: 0,
    propostasPendentes: 0,
    topSellerName: null,
    topSellerSalesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const carregarDados = async () => {
      try {
        const [clientesResponse, tarefasResponse, oportunidadesResponse, rankingResponse] = await Promise.all([
          buscarClientes(),
          buscarTarefas(),
          buscarOportunidades(),
          buscarRankingVendas(),
        ]);

        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const mesAtual = agora.getMonth();

        const clientes = Array.isArray(clientesResponse)
          ? clientesResponse
          : clientesResponse?.clientes || [];

        const tarefas = Array.isArray(tarefasResponse)
          ? tarefasResponse
          : tarefasResponse?.tarefas || [];

        const oportunidades = Array.isArray(oportunidadesResponse) ? oportunidadesResponse : [];

        const ranking = Array.isArray(rankingResponse) ? rankingResponse : [];

        const totalClientes = clientes.length;

        const novosClientesMes = clientes.filter((cliente: any) => {
          if (!cliente.createdAt) return false;
          const data = new Date(cliente.createdAt);
          return data.getFullYear() === anoAtual && data.getMonth() === mesAtual;
        }).length;

        const totalTarefas = tarefas.length;

        const tarefasHoje = tarefas.filter((tarefa: any) => {
          if (!tarefa.dataVencimento) return false;
          const data = new Date(tarefa.dataVencimento);
          return (
            data.getFullYear() === agora.getFullYear() &&
            data.getMonth() === agora.getMonth() &&
            data.getDate() === agora.getDate()
          );
        }).length;

        let totalPropostas = 0;
        let propostasPendentes = 0;

        oportunidades.forEach((oportunidade: any) => {
          if (!oportunidade) return;

          const createdAt = oportunidade.createdAt ? new Date(oportunidade.createdAt) : null;

          if (oportunidade.status === 'PROPOSTA' || oportunidade.status === 'NEGOCIACAO') {
            totalPropostas += 1;
            propostasPendentes += 1;
          }
        });

        const topSeller = ranking[0];
        const topSellerName = topSeller?.nome ?? null;
        const topSellerSalesCount = topSeller?.vendasConcluidas ?? 0;

        if (isMounted) {
          setStats({
            totalClientes,
            novosClientesMes,
            totalTarefas,
            tarefasHoje,
            totalPropostas,
            propostasPendentes,
            topSellerName,
            topSellerSalesCount,
          });
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarDados();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de controle, veja o desempenho do seu negócio.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Top 1 vendedor atual"
          value={
            loading
              ? '...'
              : stats.topSellerName
              ? stats.topSellerName
              : 'Sem vendas ainda'
          }
          description={
            loading
              ? 'Carregando...'
              : stats.topSellerSalesCount > 0
              ? `${formatInteger(stats.topSellerSalesCount)} vendas ganhas`
              : 'Nenhuma venda concluída no período'
          }
          icon={Trophy}
          iconClassName="bg-yellow-500/10 text-yellow-500"
        />
        <StatsCard
          title="Clientes"
          value={loading ? '...' : formatInteger(stats.totalClientes)}
          description={
            loading
              ? 'Carregando...'
              : `${formatInteger(stats.novosClientesMes)} novos este mês`
          }
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          title="Tarefas"
          value={loading ? '...' : formatInteger(stats.totalTarefas)}
          description={
            loading
              ? 'Carregando...'
              : `${formatInteger(stats.tarefasHoje)} com vencimento hoje`
          }
          icon={ClipboardCheck}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
        <StatsCard
          title="Propostas"
          value={loading ? '...' : formatInteger(stats.totalPropostas)}
          description={
            loading
              ? 'Carregando...'
              : `${formatInteger(stats.propostasPendentes)} pendentes`
          }
          icon={FileText}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="h-72 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
          <picture className="block h-full w-full">
            <source media="(max-width: 767px)" srcSet="/dashboard-pit-vendasMobile.png" />
            <img
              src="/dashboard-pit-vendas.svg"
              alt="Ilustracao horizontal de pit de vendas no painel"
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <RecentActivities />
        <UpcomingTasks />
      </div>
    </div>
  );
}
