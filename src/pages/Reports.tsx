
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesChart } from '@/components/dashboard/SalesChart';
import { SegmentChart } from '@/components/dashboard/SegmentChart';
import { buscarClientes, buscarOportunidades, buscarTarefas } from '@/services/api';
import { Download } from 'lucide-react';

interface ReportsStats {
  totalClientes: number;
  totalTarefas: number;
  totalOportunidades: number;
  totalVendasGanhos: number;
  ganhosMes: number;
  taxaConversao: number;
}

export function Reports() {
  const [stats, setStats] = useState<ReportsStats>({
    totalClientes: 0,
    totalTarefas: 0,
    totalOportunidades: 0,
    totalVendasGanhos: 0,
    ganhosMes: 0,
    taxaConversao: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const carregarDados = async () => {
      try {
        const [clientesResponse, tarefasResponse, oportunidadesResponse] = await Promise.all([
          buscarClientes(),
          buscarTarefas(),
          buscarOportunidades(),
        ]);

        const clientes = Array.isArray(clientesResponse) ? clientesResponse : [];
        const tarefas = Array.isArray(tarefasResponse) ? tarefasResponse : [];
        const oportunidades: any[] = Array.isArray(oportunidadesResponse) ? oportunidadesResponse : [];

        let totalVendasGanhos = 0;
        let ganhosMes = 0;
        let totalOportunidades = 0;
        let oportunidadesGanhas = 0;
        const agora = new Date();

        oportunidades.forEach((oportunidade) => {
          totalOportunidades += 1;
          if (oportunidade.status === 'GANHO') {
            oportunidadesGanhas += 1;
            const valor = Number(oportunidade.valorFechado ?? oportunidade.valor ?? 0);
            if (!Number.isNaN(valor)) {
              totalVendasGanhos += valor;
            }

            const referenciaStr = oportunidade.dataFechamento ?? oportunidade.updatedAt ?? oportunidade.createdAt;
            const referencia = referenciaStr ? new Date(referenciaStr) : null;
            if (
              referencia &&
              referencia.getMonth() === agora.getMonth() &&
              referencia.getFullYear() === agora.getFullYear()
            ) {
              if (!Number.isNaN(valor)) {
                ganhosMes += valor;
              }
            }
          }
        });

        const taxaConversao =
          totalOportunidades > 0 ? Math.round((oportunidadesGanhas / totalOportunidades) * 100) : 0;

        if (isMounted) {
          setStats({
            totalClientes: clientes.length,
            totalTarefas: tarefas.length,
            totalOportunidades,
            totalVendasGanhos,
            ganhosMes,
            taxaConversao,
          });
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados dos relatórios:', error);
        if (isMounted) {
          setStats({
            totalClientes: 0,
            totalTarefas: 0,
            totalOportunidades: 0,
            totalVendasGanhos: 0,
            ganhosMes: 0,
            taxaConversao: 0,
          });
          setLoading(false);
        }
      }
    };

    carregarDados();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });

  const handleExport = () => {
    window.print();
  };

  return (
    <div
      className="space-y-6 print:bg-white print:text-black print:p-8"
      id="relatorio-conteudo"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Visão completa de vendas, oportunidades, clientes e tarefas com dados reais.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 hidden md:inline-flex print:hidden"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Exportar relatório
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2 md:hidden print:hidden"
        onClick={handleExport}
      >
        <Download className="h-4 w-4" />
        Exportar relatório
      </Button>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento ganho (R$)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.totalVendasGanhos)}
            </div>
            <p className="text-xs text-muted-foreground">
              Somatório das oportunidades ganhas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas ganhas no mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.ganhosMes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Faturamento ganho no mês atual.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.taxaConversao}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Percentual de oportunidades que viraram vendas.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Oportunidades totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalOportunidades}
            </div>
            <p className="text-xs text-muted-foreground">
              Todas as oportunidades cadastradas no funil.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes na base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalClientes}
            </div>
            <p className="text-xs text-muted-foreground">
              Quantidade total de clientes cadastrados.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalTarefas}
            </div>
            <p className="text-xs text-muted-foreground">
              Atividades de follow-up e compromissos criados.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SalesChart />
        <SegmentChart />
      </div>
    </div>
  );
}
