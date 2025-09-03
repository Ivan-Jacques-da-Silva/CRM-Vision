
/**
 * Gráfico de Taxa de Conversão por Etapa
 * Exibe a conversão entre etapas do funil de vendas
 */
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  {
    name: "Lead → Contato",
    taxa: 68,
  },
  {
    name: "Contato → Proposta",
    taxa: 52,
  },
  {
    name: "Proposta → Negociação",
    taxa: 43,
  },
  {
    name: "Negociação → Fechamento",
    taxa: 36,
  },
  {
    name: "Fechamento → Ganho",
    taxa: 24,
  },
];

/**
 * Componente de visualização da taxa de conversão entre etapas
 */
export function ConversionRateChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} tickMargin={10} />
        <YAxis tickFormatter={(value) => `${value}%`} />
        <Tooltip formatter={(value) => [`${value}%`, "Taxa de Conversão"]} />
        <Legend />
        <Bar dataKey="taxa" name="Taxa de Conversão (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
