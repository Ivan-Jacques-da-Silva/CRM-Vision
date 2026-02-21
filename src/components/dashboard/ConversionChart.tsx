
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { buscarOportunidades } from '@/services/api';

interface ConversionPoint {
  name: string;
  value: number;
}

export function ConversionChart() {
  const { theme } = useTheme();

  const [data, setData] = useState<ConversionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const carregarDados = async () => {
      try {
        const response = await buscarOportunidades();
        const oportunidades: any[] = Array.isArray(response) ? response : [];

        if (!oportunidades.length) {
          if (isMounted) {
            setData([]);
            setLoading(false);
          }
          return;
        }

        const funil = ['LEAD', 'QUALIFICADO', 'PROPOSTA', 'NEGOCIACAO', 'GANHO'] as const;
        const labels: Record<string, string> = {
          LEAD: 'Lead',
          QUALIFICADO: 'Qualificado',
          PROPOSTA: 'Proposta',
          NEGOCIACAO: 'Negociação',
          GANHO: 'Ganho',
        };

        const indiceEtapa: Record<string, number> = {};
        funil.forEach((etapa, index) => {
          indiceEtapa[etapa] = index;
        });

        const totalLeads = oportunidades.length;

        const pontos: ConversionPoint[] = funil.map((etapa) => {
          const indice = indiceEtapa[etapa];

          const quantidadeNaEtapaOuPosterior = oportunidades.filter((oportunidade: any) => {
            const status = oportunidade.status as string | undefined;
            if (!status || indiceEtapa[status] === undefined) return false;
            return indiceEtapa[status] >= indice;
          }).length;

          const value =
            totalLeads > 0
              ? Math.round((quantidadeNaEtapaOuPosterior / totalLeads) * 100)
              : 0;

          return {
            name: labels[etapa],
            value,
          };
        });

        if (isMounted) {
          setData(pontos);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de conversão:', error);
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

  const COLORS = ['#8B5CF6', '#6E59A5', '#9b87f5', '#5E44A5', '#A788FF'];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Taxa de Conversão</CardTitle>
        <CardDescription>
          Taxas de conversão por etapa do funil (dados reais)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Carregando taxas de conversão...
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Nenhuma oportunidade encontrada para calcular conversão.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Taxa']}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    borderColor: theme === 'dark' ? '#555' : '#ddd',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
