
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export function ConversionChart() {
  const { theme } = useTheme();
  
  // Dados temporários até conectar com a API
  const data = [
    { name: 'Lead', value: 85 },
    { name: 'Qualificado', value: 65 },
    { name: 'Proposta', value: 45 },
    { name: 'Negociação', value: 25 },
    { name: 'Ganho', value: 15 }
  ];

  const COLORS = ['#8B5CF6', '#6E59A5', '#9b87f5', '#5E44A5', '#A788FF'];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Taxa de Conversão</CardTitle>
        <CardDescription>
          Taxas de conversão por etapa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
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
        </div>
      </CardContent>
    </Card>
  );
}
