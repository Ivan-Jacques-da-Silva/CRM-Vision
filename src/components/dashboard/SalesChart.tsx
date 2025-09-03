
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export function SalesChart() {
  const { theme } = useTheme();
  
  // Dados temporários até conectar com a API
  const data = [
    { month: 'Jan', amount: 42000 },
    { month: 'Fev', amount: 38000 },
    { month: 'Mar', amount: 55000 },
    { month: 'Abr', amount: 48000 },
    { month: 'Mai', amount: 62000 },
    { month: 'Jun', amount: 71000 }
  ];

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
          Performance de vendas dos últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
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
        </div>
      </CardContent>
    </Card>
  );
}
