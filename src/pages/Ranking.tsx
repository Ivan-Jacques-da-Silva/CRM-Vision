import { useMemo, useState } from "react";
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
  { id: "1", nome: "Carlos Silva", email: "carlos@exemplo.com", valorTotal: 125000, posicao: 1, vendasConcluidas: 15 },
  { id: "2", nome: "Maria Santos", email: "maria@exemplo.com", valorTotal: 110000, posicao: 2, vendasConcluidas: 12 },
  { id: "3", nome: "Joao Oliveira", email: "joao@exemplo.com", valorTotal: 98000, posicao: 3, vendasConcluidas: 11 },
  { id: "4", nome: "Ana Costa", email: "ana@exemplo.com", valorTotal: 85000, posicao: 4, vendasConcluidas: 9 },
  { id: "5", nome: "Pedro Almeida", email: "pedro@exemplo.com", valorTotal: 72000, posicao: 5, vendasConcluidas: 8 },
  { id: "6", nome: "Juliana Ferreira", email: "juliana@exemplo.com", valorTotal: 65000, posicao: 6, vendasConcluidas: 7 },
  { id: "7", nome: "Ricardo Souza", email: "ricardo@exemplo.com", valorTotal: 58000, posicao: 7, vendasConcluidas: 6 },
  { id: "8", nome: "Fernanda Lima", email: "fernanda@exemplo.com", valorTotal: 49000, posicao: 8, vendasConcluidas: 5 },
];

export default function Ranking() {
  const [mostrarExemplares, setMostrarExemplares] = useState(false);
  const [ocultarValores] = useState(() => {
    return localStorage.getItem('pipeline_ocultar_valores') === 'true';
  });

  const { data, isLoading } = useQuery<RankingUser[]>({
    queryKey: ["ranking-vendas"],
    queryFn: buscarRankingVendas,
  });

  const dadosParaMostrar = useMemo(() => {
    const base = mostrarExemplares ? dadosExemplares : Array.isArray(data) ? data : [];

    return [...base]
      .map((usuario, index) => ({
        ...usuario,
        posicao: typeof usuario.posicao === "number" ? usuario.posicao : index + 1,
        valorTotal: Number(usuario.valorTotal || 0),
        vendasConcluidas: Number(usuario.vendasConcluidas || 0),
      }))
      .sort((a, b) => a.posicao - b.posicao);
  }, [mostrarExemplares, data]);

  const [primeiroColocado] = dadosParaMostrar;

  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth() + 1;
  const periodoAtual = agora.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const handleExportCsv = () => {
    const params = new URLSearchParams({
      ano: String(anoAtual),
      mes: String(mesAtual),
      export: "csv",
    });

    window.open(`/api/ranking?${params.toString()}`, "_blank");
  };

  const getInitials = (nome: string) =>
    nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatCurrency = (value: number) =>
    ocultarValores ? "R$ ******" : value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-4 md:space-y-8 md:p-6" data-testid="page-ranking">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl dark:text-white" data-testid="text-ranking-title">
            <Trophy className="h-6 w-6 text-amber-500" />
            Ranking de Vendas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Acompanhe o desempenho da equipe em {periodoAtual}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            onClick={() => setMostrarExemplares(!mostrarExemplares)}
            variant={mostrarExemplares ? "default" : "outline"}
            className="w-full gap-2 sm:w-auto"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">{mostrarExemplares ? "Dados reais" : "Dados de exemplo"}</span>
            <span className="sm:hidden">{mostrarExemplares ? "Reais" : "Exemplo"}</span>
          </Button>
          <Button onClick={handleExportCsv} variant="outline" className="w-full gap-2 sm:w-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>
      </div>

      {dadosParaMostrar.length === 0 ? (
        <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-center text-muted-foreground">Nenhuma venda concluida ainda. Seja o primeiro.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {primeiroColocado && (
            <Card className="border border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 dark:from-yellow-500/15 dark:via-amber-500/15 dark:to-orange-500/15">
              <CardContent className="flex flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Avatar className="h-16 w-16 border-4 border-yellow-500/70 shadow-xl sm:h-20 sm:w-20">
                      <AvatarFallback className="bg-yellow-500 text-xl font-bold text-white sm:text-2xl">
                        {getInitials(primeiroColocado.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -right-2 -top-2 rounded-full bg-yellow-500 p-1.5 shadow-lg">
                      <Crown className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-yellow-700 dark:text-yellow-300">
                      Lider de vendas ate agora
                    </p>
                    <h2 className="text-xl font-bold text-foreground sm:text-3xl dark:text-white">
                      {primeiroColocado.nome}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {primeiroColocado.vendasConcluidas}{" "}
                      {primeiroColocado.vendasConcluidas === 1 ? "venda ganha" : "vendas ganhas"} na etapa Ganho
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500 sm:h-6 sm:w-6" />
                    <span className="text-sm font-medium text-muted-foreground">Valor total em vendas ganhas</span>
                  </div>
                  <p className="text-2xl font-extrabold text-yellow-600 sm:text-4xl dark:text-yellow-400" data-testid="top-seller-valor-total">
                    {formatCurrency(primeiroColocado.valorTotal)}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    1o lugar no ranking de vendas
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
            <CardContent className="p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl dark:text-white">
                <TrendingUp className="h-5 w-5" />
                Tabela de Vendedores Ativos
              </h2>

              <div className="space-y-3 md:hidden">
                {dadosParaMostrar.map((user) => (
                  <div key={user.id} className="rounded-lg border border-border/70 p-3" data-testid={`rank-row-${user.posicao}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className="flex h-8 w-8 items-center justify-center rounded-full p-0">
                          {user.posicao}
                        </Badge>
                        <div className="flex items-start gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {getInitials(user.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground dark:text-white">{user.nome}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Vendas</p>
                        <p className="text-sm font-semibold">
                          {user.vendasConcluidas} {user.vendasConcluidas === 1 ? "venda" : "vendas"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-border/70 pt-2 text-right">
                      <p className="text-xs text-muted-foreground">Valor total</p>
                      <p className="text-sm font-semibold">{formatCurrency(user.valorTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posicao</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-center">Vendas ganhas</TableHead>
                      <TableHead className="text-right">Valor total (Ganho)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosParaMostrar.map((user) => (
                      <TableRow key={user.id} data-testid={`rank-row-${user.posicao}`}>
                        <TableCell>
                          <Badge variant="secondary" className="flex h-9 w-9 items-center justify-center rounded-full p-0">
                            {user.posicao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
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
                          {user.vendasConcluidas} {user.vendasConcluidas === 1 ? "venda" : "vendas"}
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
