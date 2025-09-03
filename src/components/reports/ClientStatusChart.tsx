
/**
 * Gráfico de Análise de Clientes Ativos vs Inativos
 * Exibe distribuição e evolução da base de clientes
 */
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  {
    name: "Jan",
    ativos: 620,
    inativos: 120,
  },
  {
    name: "Fev",
    ativos: 632,
    inativos: 130,
  },
  {
    name: "Mar",
    ativos: 645,
    inativos: 135,
  },
  {
    name: "Abr",
    ativos: 660,
    inativos: 142,
  },
  {
    name: "Mai",
    ativos: 680,
    inativos: 138,
  },
  {
    name: "Jun",
    ativos: 695,
    inativos: 135,
  },
  {
    name: "Jul",
    ativos: 710,
    inativos: 130,
  },
  {
    name: "Ago",
    ativos: 725,
    inativos: 128,
  },
  {
    name: "Set",
    ativos: 742,
    inativos: 125,
  },
  {
    name: "Out",
    ativos: 756,
    inativos: 120,
  },
  {
    name: "Nov",
    ativos: 763,
    inativos: 118,
  },
];

/**
 * Componente de visualização da análise de status dos clientes
 */
export function ClientStatusChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="ativos" name="Clientes Ativos" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
        <Area type="monotone" dataKey="inativos" name="Clientes Inativos" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
