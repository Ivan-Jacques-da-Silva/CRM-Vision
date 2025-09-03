
/**
 * Gráfico de Comparativo de Desempenho Mensal
 * Exibe performance de vendas comparando os últimos meses
 */
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  {
    name: "Jan",
    atual: 42,
    anterior: 32,
  },
  {
    name: "Fev",
    atual: 48,
    anterior: 38,
  },
  {
    name: "Mar",
    atual: 55,
    anterior: 45,
  },
  {
    name: "Abr",
    atual: 49,
    anterior: 52,
  },
  {
    name: "Mai",
    atual: 58,
    anterior: 47,
  },
  {
    name: "Jun",
    atual: 62,
    anterior: 51,
  },
  {
    name: "Jul",
    atual: 68,
    anterior: 54,
  },
  {
    name: "Ago",
    atual: 72,
    anterior: 59,
  },
  {
    name: "Set",
    atual: 75,
    anterior: 62,
  },
  {
    name: "Out",
    atual: 82,
    anterior: 68,
  },
  {
    name: "Nov",
    atual: 87,
    anterior: 71,
  },
  {
    name: "Dez",
    atual: 92,
    anterior: 78,
  },
];

/**
 * Componente de visualização comparativa do desempenho mensal
 */
export function MonthlyPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} vendas`, ""]} />
        <Legend />
        <Line type="monotone" dataKey="atual" name="Ano Atual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="anterior" name="Ano Anterior" stroke="#9ca3af" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
