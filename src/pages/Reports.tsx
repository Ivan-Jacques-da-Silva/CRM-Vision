
/**
 * Página de Relatórios Avançados
 * Exibe métricas e análises diferentes da dashboard principal
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversionRateChart } from '@/components/reports/ConversionRateChart';
import { MonthlyPerformanceChart } from '@/components/reports/MonthlyPerformanceChart';
import { ClientStatusChart } from '@/components/reports/ClientStatusChart';
import { MrrChart } from '@/components/reports/MrrChart';

/**
 * Componente da página de Relatórios
 * Contém métricas avançadas e análises diferentes da dashboard
 */
export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios Avançados</h1>
        <p className="text-muted-foreground">
          Análises detalhadas de desempenho, vendas e clientes.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Conversão Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% em relação ao mês passado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clientes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">763</div>
                <p className="text-xs text-muted-foreground">
                  +18 novos este mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  MRR (Receita Mensal)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 248.500</div>
                <p className="text-xs text-muted-foreground">
                  +5.4% em relação ao mês passado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ciclo de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18 dias</div>
                <p className="text-xs text-muted-foreground">
                  -2 dias em relação à média anual
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Taxa de Conversão por Etapa</CardTitle>
                <CardDescription>
                  Comparativo de conversão entre as etapas do funil de vendas
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ConversionRateChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>MRR (Receita Recorrente Mensal)</CardTitle>
                <CardDescription>
                  Evolução da receita recorrente nos últimos 12 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MrrChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Desempenho Mensal</CardTitle>
              <CardDescription>
                Análise comparativa de vendas mês a mês
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <MonthlyPerformanceChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Clientes Ativos vs Inativos</CardTitle>
              <CardDescription>
                Distribuição e evolução da base de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientStatusChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita Recorrente Detalhada</CardTitle>
              <CardDescription>
                Análise detalhada do MRR por plano e segmento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MrrChart detailed />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
