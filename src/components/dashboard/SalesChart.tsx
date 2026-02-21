
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { buscarOportunidades } from '@/services/api';

interface SalesPoint {
  month: string;
  amount: number;
}

export function SalesChart() {
  const { theme } = useTheme();

  const [data, setData] = useState<SalesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const carregarDados = async () => {
      try {
        const response = await buscarOportunidades();
        const oportunidades: any[] = Array.isArray(response) ? response : [];

        const agora = new Date();
        const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        const valoresPorMes: Record<string, number> = {};

        for (let i = 5; i >= 0; i--) {
          const referencia = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
          const chave = `${referencia.getFullYear()}-${referencia.getMonth()}`;
          valoresPorMes[chave] = 0;
        }

        oportunidades.forEach((oportunidade: any) => {
          if (oportunidade.status !== 'GANHO') return;

          const dataRef = oportunidade.dataFechamento
            ? new Date(oportunidade.dataFechamento)
            : oportunidade.createdAt
            ? new Date(oportunidade.createdAt)
            : null;

          if (!dataRef || Number.isNaN(dataRef.getTime())) return;

          const chave = `${dataRef.getFullYear()}-${dataRef.getMonth()}`;

          if (valoresPorMes[chave] === undefined) return;

          const valor = Number(oportunidade.valor || 0);
          if (!Number.isNaN(valor)) {
            valoresPorMes[chave] += valor;
          }
        });

        const novosDados: SalesPoint[] = [];

        for (let i = 5; i >= 0; i--) {
          const referencia = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
          const chave = `${referencia.getFullYear()}-${referencia.getMonth()}`;
          const label = mesesLabels[referencia.getMonth()];

          novosDados.push({
            month: label,
            amount: valoresPorMes[chave] || 0,
          });
        }

        if (isMounted) {
          setData(novosDados);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de vendas:', error);
        if (isMounted) {
          setData([]);
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
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0, 
    }).format(value);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Vendas Mensais</CardTitle>
        <CardDescription>
          Performance de vendas dos últimos meses (dados reais)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Carregando dados de vendas...
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Nenhum dado de venda encontrado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#eee'} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: theme === 'dark' ? '#ccc' : '#333' }}
                  tickLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                  axisLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                  tick={{ fill: theme === 'dark' ? '#ccc' : '#333' }}
                  tickLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                  axisLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                  labelStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    borderColor: theme === 'dark' ? '#555' : '#ddd',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  name="Vendas" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
