
/**
 * Gráfico de Receita Recorrente Mensal (MRR)
 * Exibe evolução da receita recorrente ao longo do tempo
 */
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MrrChartProps {
  detailed?: boolean;
}

const simpleData = [
  { name: "Jan", valor: 180500 },
  { name: "Fev", valor: 185200 },
  { name: "Mar", valor: 190800 },
  { name: "Abr", valor: 198400 },
  { name: "Mai", valor: 205600 },
  { name: "Jun", valor: 212800 },
  { name: "Jul", valor: 218500 },
  { name: "Ago", valor: 225300 },
  { name: "Set", valor: 232100 },
  { name: "Out", valor: 238900 },
  { name: "Nov", valor: 248500 },
];

const detailedData = [
  {
    name: "Jan",
    basicPlus: 65800,
    professional: 85700,
    enterprise: 29000,
  },
  {
    name: "Fev",
    basicPlus: 67200,
    professional: 86500,
    enterprise: 31500,
  },
  {
    name: "Mar",
    basicPlus: 68600,
    professional: 88700,
    enterprise: 33500,
  },
  {
    name: "Abr",
    basicPlus: 70200,
    professional: 91200,
    enterprise: 37000,
  },
  {
    name: "Mai",
    basicPlus: 72800,
    professional: 93300,
    enterprise: 39500,
  },
  {
    name: "Jun",
    basicPlus: 75500,
    professional: 94800,
    enterprise: 42500,
  },
  {
    name: "Jul",
    basicPlus: 77200,
    professional: 96300,
    enterprise: 45000,
  },
  {
    name: "Ago",
    basicPlus: 79800,
    professional: 98500,
    enterprise: 47000,
  },
  {
    name: "Set",
    basicPlus: 81500,
    professional: 100600,
    enterprise: 50000,
  },
  {
    name: "Out",
    basicPlus: 83200,
    professional: 102700,
    enterprise: 53000,
  },
  {
    name: "Nov",
    basicPlus: 86500,
    professional: 105000,
    enterprise: 57000,
  },
];

/**
 * Componente de visualização da receita recorrente mensal
 * @param detailed - Exibe visão detalhada por plano quando true
 */
export function MrrChart({ detailed = false }: MrrChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={detailed ? 400 : 350}>
      {!detailed ? (
        <BarChart
          data={simpleData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
          <Tooltip formatter={(value: number) => [formatCurrency(value), "MRR"]} />
          <Legend />
          <Bar dataKey="valor" name="Receita Mensal" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : (
        <BarChart
          data={detailedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
          <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
          <Legend />
          <Bar dataKey="basicPlus" name="Plano Básico+" stackId="a" fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar dataKey="professional" name="Plano Profissional" stackId="a" fill="#3b82f6" />
          <Bar dataKey="enterprise" name="Plano Enterprise" stackId="a" fill="#8b5cf6" />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
