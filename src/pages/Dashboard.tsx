
import React from 'react';
import { BadgeDollarSign, Users, CalendarClock, FileText, ClipboardCheck } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ConversionChart } from '@/components/dashboard/ConversionChart';
import { SegmentChart } from '@/components/dashboard/SegmentChart';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';

export function Dashboard() {
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
          title="Total de Vendas"
          value="R$ 542.000"
          description="Este ano"
          trend="up"
          trendValue="12%"
          icon={BadgeDollarSign}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatsCard
          title="Clientes"
          value="156"
          description="25 novos este mês"
          trend="up"
          trendValue="8%"
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          title="Tarefas"
          value="24"
          description="7 para hoje"
          icon={ClipboardCheck}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
        <StatsCard
          title="Propostas"
          value="18"
          description="10 pendentes"
          trend="down"
          trendValue="3%"
          icon={FileText}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SalesChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <ConversionChart />
        <SegmentChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <RecentActivities />
        <UpcomingTasks />
      </div>
    </div>
  );
}
