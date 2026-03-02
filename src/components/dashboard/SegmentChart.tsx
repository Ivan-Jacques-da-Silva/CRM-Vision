
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { buscarOportunidades } from '@/services/api';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeeklyPoint {
  week: string;
  [segment: string]: string | number;
}

export function SegmentChart() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const [data, setData] = useState<WeeklyPoint[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getWeekStart = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = (day + 6) % 7;
      d.setDate(d.getDate() - diff);
      return d;
    };

    const carregarDados = async () => {
      try {
        const response = await buscarOportunidades();
        const oportunidades: any[] = Array.isArray(response) ? response : [];

        const hoje = new Date();
        const semanas = 12;
        const inicioPeriodo = new Date(hoje);
        inicioPeriodo.setDate(inicioPeriodo.getDate() - (semanas - 1) * 7);
        const inicioPeriodoSemana = getWeekStart(inicioPeriodo).getTime();

        const agregador: Record<string, Record<string, number>> = {};
        const totaisSegmento: Record<string, number> = {};

        oportunidades.forEach((oportunidade: any) => {
          const referenciaStr =
            oportunidade.dataFechamento ?? oportunidade.updatedAt ?? oportunidade.createdAt;
          if (!referenciaStr) return;

          const referencia = new Date(referenciaStr);
          if (Number.isNaN(referencia.getTime())) return;

          const semanaInicio = getWeekStart(referencia);
          const semanaTime = semanaInicio.getTime();

          if (semanaTime < inicioPeriodoSemana || semanaTime > hoje.getTime()) return;

          const segmento =
            (oportunidade.fonte as string | undefined) ||
            (oportunidade.cliente?.nomeEmpresa as string | undefined) ||
            (oportunidade.cliente?.empresa?.nome as string | undefined) ||
            'Outros';

          const chaveSemana = semanaInicio.toISOString().slice(0, 10);

          if (!agregador[chaveSemana]) {
            agregador[chaveSemana] = {};
          }

          agregador[chaveSemana][segmento] = (agregador[chaveSemana][segmento] || 0) + 1;
          totaisSegmento[segmento] = (totaisSegmento[segmento] || 0) + 1;
        });

        const segmentosOrdenados = Object.entries(totaisSegmento)
          .sort((a, b) => b[1] - a[1])
          .map(([segmento]) => segmento);

        const chavesSemanas = Object.keys(agregador)
          .map((k) => new Date(k))
          .sort((a, b) => a.getTime() - b.getTime());

        const pontos: WeeklyPoint[] = chavesSemanas.map((dataSemana) => {
          const chaveSemana = dataSemana.toISOString().slice(0, 10);
          const valores = agregador[chaveSemana] || {};

          const dia = String(dataSemana.getDate()).padStart(2, '0');
          const mes = String(dataSemana.getMonth() + 1).padStart(2, '0');
          const label = `${dia}/${mes}`;

          const ponto: WeeklyPoint = { week: label };

          segmentosOrdenados.forEach((segmento) => {
            ponto[segmento] = valores[segmento] || 0;
          });

          return ponto;
        });

        if (isMounted) {
          setSegments(segmentosOrdenados);
          setData(pontos);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de segmentos semanais:', error);
        if (isMounted) {
          setSegments([]);
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

  const cores = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#14b8a6'];
  const segmentosExibidos = isMobile ? segments.slice(0, 3) : segments;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Segmentos por semana</CardTitle>
        <CardDescription>
          Quantidade de oportunidades por segmento, por semana (dados reais)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-72">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Carregando série semanal por segmento...
            </div>
          ) : data.length === 0 || segments.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Nenhuma oportunidade encontrada no período analisado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={isMobile ? { top: 5, right: 8, left: -18, bottom: 8 } : { top: 5, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === 'dark' ? '#333' : '#eee'}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: theme === 'dark' ? '#ccc' : '#333', fontSize: isMobile ? 11 : 12 }}
                  tickLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                  axisLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                  interval={0}
                />
                <YAxis
                  hide={isMobile}
                  allowDecimals={false}
                  tick={{ fill: theme === 'dark' ? '#ccc' : '#333' }}
                  tickLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                  axisLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                />
                <Tooltip
                  formatter={(value: number) => [value, 'Quantidade']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    borderColor: theme === 'dark' ? '#555' : '#ddd',
                    color: theme === 'dark' ? '#fff' : '#000',
                    fontSize: isMobile ? 12 : 13,
                  }}
                />
                {!isMobile && <Legend />}
                {segmentosExibidos.map((segmento, index) => (
                  <Line
                    key={segmento}
                    type="monotone"
                    dataKey={segmento}
                    name={segmento}
                    stroke={cores[index % cores.length]}
                    strokeWidth={2}
                    dot={{ r: isMobile ? 1 : 2 }}
                    activeDot={{ r: isMobile ? 3 : 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
