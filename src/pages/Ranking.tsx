import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, TrendingUp, Database, Crown, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buscarRankingVendas } from "@/services/api";

interface RankingUser {
  id: string;
  nome: string;
  email: string;
  valorTotal: number;
  posicao: number;
  vendasConcluidas: number;
}

const dadosExemplares: RankingUser[] = [
  {
    id: "1",
    nome: "Carlos Silva",
    email: "carlos@exemplo.com",
    valorTotal: 125000,
    posicao: 1,
    vendasConcluidas: 15
  },
  {
    id: "2",
    nome: "Maria Santos",
    email: "maria@exemplo.com",
    valorTotal: 110000,
    posicao: 2,
    vendasConcluidas: 12
  },
  {
    id: "3",
    nome: "João Oliveira",
    email: "joao@exemplo.com",
    valorTotal: 98000,
    posicao: 3,
    vendasConcluidas: 11
  },
  {
    id: "4",
    nome: "Ana Costa",
    email: "ana@exemplo.com",
    valorTotal: 85000,
    posicao: 4,
    vendasConcluidas: 9
  },
  {
    id: "5",
    nome: "Pedro Almeida",
    email: "pedro@exemplo.com",
    valorTotal: 72000,
    posicao: 5,
    vendasConcluidas: 8
  },
  {
    id: "6",
    nome: "Juliana Ferreira",
    email: "juliana@exemplo.com",
    valorTotal: 65000,
    posicao: 6,
    vendasConcluidas: 7
  },
  {
    id: "7",
    nome: "Ricardo Souza",
    email: "ricardo@exemplo.com",
    valorTotal: 58000,
    posicao: 7,
    vendasConcluidas: 6
  },
  {
    id: "8",
    nome: "Fernanda Lima",
    email: "fernanda@exemplo.com",
    valorTotal: 49000,
    posicao: 8,
    vendasConcluidas: 5
  }
];

export default function Ranking() {
  const [mostrarExemplares, setMostrarExemplares] = useState(false);
  const { data: ranking = [], isLoading } = useQuery<RankingUser[]>({
    queryKey: ['ranking-vendas'],
    queryFn: buscarRankingVendas,
  });

  const dadosParaMostrar = mostrarExemplares ? dadosExemplares : ranking;

  const [primeiroColocado, ...restante] = dadosParaMostrar;

  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth() + 1;

  const handleExportCsv = () => {
    const params = new URLSearchParams({
      ano: String(anoAtual),
      mes: String(mesAtual),
      export: "csv",
    });

    window.open(`/api/ranking?${params.toString()}`, "_blank");
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8" data-testid="page-ranking">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-white" data-testid="text-ranking-title">
            🏆 Ranking de Vendas
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho da equipe ao longo do mês atual
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setMostrarExemplares(!mostrarExemplares)}
            variant={mostrarExemplares ? "default" : "outline"}
            className="gap-2"
          >
            <Database className="h-4 w-4" />
            {mostrarExemplares ? "Dados Reais" : "Dados Exemplares"}
          </Button>
          <Button
            onClick={handleExportCsv}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {dadosParaMostrar.length === 0 ? (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma venda concluída ainda. Seja o primeiro!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {primeiroColocado && (
            <Card className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 dark:from-yellow-500/15 dark:via-amber-500/15 dark:to-orange-500/15 border border-yellow-500/40">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 px-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-4 border-yellow-500/70 shadow-xl">
                      <AvatarFallback className="bg-yellow-500 text-white text-2xl font-bold">
                        {getInitials(primeiroColocado.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5 shadow-lg">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 uppercase tracking-wide">
                      Líder de vendas até agora
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">
                      {primeiroColocado.nome}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {primeiroColocado.vendasConcluidas}{" "}
                      {primeiroColocado.vendasConcluidas === 1 ? "venda ganha" : "vendas ganhas"} na etapa Ganho
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Valor total em vendas ganhas
                    </span>
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold text-yellow-600 dark:text-yellow-400" data-testid="top-seller-valor-total">
                    {formatCurrency(primeiroColocado.valorTotal)}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    1º lugar no ranking de vendas
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tabela de Vendedores Ativos
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posição</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-center">Vendas ganhas</TableHead>
                      <TableHead className="text-right">Valor total (Ganho)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosParaMostrar.map((user) => (
                      <TableRow key={user.id} data-testid={`rank-row-${user.posicao}`}>
                        <TableCell>
                          <Badge variant="secondary" className="w-9 h-9 flex items-center justify-center rounded-full">
                            {user.posicao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(user.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground dark:text-white" data-testid={`text-name-${user.posicao}`}>
                                {user.nome}
                              </p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.vendasConcluidas}{" "}
                          {user.vendasConcluidas === 1 ? "venda" : "vendas"}
                        </TableCell>
                        <TableCell className="text-right" data-testid={`text-valor-total-${user.posicao}`}>
                          {formatCurrency(user.valorTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
