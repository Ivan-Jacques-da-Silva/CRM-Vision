
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export function SegmentChart() {
  const { theme } = useTheme();
  
  // Dados temporários até conectar com a API
  const data = [
    { segment: 'Tecnologia', count: 35 },
    { segment: 'Saúde', count: 28 },
    { segment: 'Educação', count: 22 },
    { segment: 'Varejo', count: 18 },
    { segment: 'Serviços', count: 15 }
  ];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Oportunidades por Segmento</CardTitle>
        <CardDescription>
          Distribuição de oportunidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#eee'} />
              <XAxis 
                type="number" 
                tick={{ fill: theme === 'dark' ? '#ccc' : '#333' }}
                tickLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                axisLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
              />
              <YAxis 
                dataKey="segment" 
                type="category" 
                tick={{ fill: theme === 'dark' ? '#ccc' : '#333' }}
                tickLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                axisLine={{ stroke: theme === 'dark' ? '#666' : '#ccc' }}
                width={75}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Quantidade']}
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                  borderColor: theme === 'dark' ? '#555' : '#ddd',
                  color: theme === 'dark' ? '#fff' : '#000'
                }}
              />
              <Bar 
                dataKey="count" 
                name="Oportunidades" 
                fill="#F97316" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
