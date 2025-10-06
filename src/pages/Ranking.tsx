import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, TrendingUp, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RankingUser {
  id: string;
  nome: string;
  email: string;
  salesPoints: number;
  posicao: number;
  vendasConcluidas: number;
}

const dadosExemplares: RankingUser[] = [
  {
    id: "1",
    nome: "Carlos Silva",
    email: "carlos@exemplo.com",
    salesPoints: 1250,
    posicao: 1,
    vendasConcluidas: 15
  },
  {
    id: "2",
    nome: "Maria Santos",
    email: "maria@exemplo.com",
    salesPoints: 1100,
    posicao: 2,
    vendasConcluidas: 12
  },
  {
    id: "3",
    nome: "João Oliveira",
    email: "joao@exemplo.com",
    salesPoints: 980,
    posicao: 3,
    vendasConcluidas: 11
  },
  {
    id: "4",
    nome: "Ana Costa",
    email: "ana@exemplo.com",
    salesPoints: 850,
    posicao: 4,
    vendasConcluidas: 9
  },
  {
    id: "5",
    nome: "Pedro Almeida",
    email: "pedro@exemplo.com",
    salesPoints: 720,
    posicao: 5,
    vendasConcluidas: 8
  },
  {
    id: "6",
    nome: "Juliana Ferreira",
    email: "juliana@exemplo.com",
    salesPoints: 650,
    posicao: 6,
    vendasConcluidas: 7
  },
  {
    id: "7",
    nome: "Ricardo Souza",
    email: "ricardo@exemplo.com",
    salesPoints: 580,
    posicao: 7,
    vendasConcluidas: 6
  },
  {
    id: "8",
    nome: "Fernanda Lima",
    email: "fernanda@exemplo.com",
    salesPoints: 490,
    posicao: 8,
    vendasConcluidas: 5
  }
];

export default function Ranking() {
  const [mostrarExemplares, setMostrarExemplares] = useState(false);
  const { data: ranking = [], isLoading } = useQuery<RankingUser[]>({
    queryKey: ['/api/ranking'],
  });

  const dadosParaMostrar = mostrarExemplares ? dadosExemplares : ranking;

  const top3 = dadosParaMostrar.slice(0, 3);
  const restante = dadosParaMostrar.slice(3);

  const getPodiumOrder = () => {
    if (top3.length < 3) return top3;
    return [top3[1], top3[0], top3[2]];
  };

  const podiumOrder = getPodiumOrder();

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMedalColor = (posicao: number) => {
    switch (posicao) {
      case 1: return "text-yellow-500";
      case 2: return "text-gray-400";
      case 3: return "text-amber-600";
      default: return "text-muted-foreground";
    }
  };

  const getPodiumHeight = (posicao: number) => {
    switch (posicao) {
      case 1: return "h-48";
      case 2: return "h-36";
      case 3: return "h-28";
      default: return "h-20";
    }
  };

  const getPodiumBgColor = (posicao: number) => {
    switch (posicao) {
      case 1: return "bg-gradient-to-t from-yellow-500/20 to-yellow-500/5 dark:from-yellow-500/30 dark:to-yellow-500/10";
      case 2: return "bg-gradient-to-t from-gray-400/20 to-gray-400/5 dark:from-gray-400/30 dark:to-gray-400/10";
      case 3: return "bg-gradient-to-t from-amber-600/20 to-amber-600/5 dark:from-amber-600/30 dark:to-amber-600/10";
      default: return "bg-muted";
    }
  };

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
            Acompanhe o desempenho da equipe
          </p>
        </div>
        <Button
          onClick={() => setMostrarExemplares(!mostrarExemplares)}
          variant={mostrarExemplares ? "default" : "outline"}
          className="gap-2"
        >
          <Database className="h-4 w-4" />
          {mostrarExemplares ? "Dados Reais" : "Dados Exemplares"}
        </Button>
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
          {top3.length > 0 && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-8 pb-6">
                <div className="flex items-end justify-center gap-4 mb-8">
                  {podiumOrder.map((user, idx) => {
                    if (!user) return null;
                    const actualPosition = user.posicao;
                    const displayOrder = actualPosition === 1 ? 1 : actualPosition === 2 ? 0 : 2;
                    
                    return (
                      <div 
                        key={user.id} 
                        className="flex flex-col items-center"
                        style={{ order: displayOrder }}
                        data-testid={`podium-position-${actualPosition}`}
                      >
                        <div className="relative mb-3">
                          <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-700 shadow-lg">
                            <AvatarFallback className={`text-xl font-bold ${getMedalColor(actualPosition)}`}>
                              {getInitials(user.nome)}
                            </AvatarFallback>
                          </Avatar>
                          {actualPosition === 1 && (
                            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1.5 shadow-lg">
                              <Trophy className="h-5 w-5 text-white" />
                            </div>
                          )}
                          {actualPosition === 2 && (
                            <div className="absolute -top-2 -right-2 bg-gray-400 rounded-full p-1.5 shadow-lg">
                              <Medal className="h-5 w-5 text-white" />
                            </div>
                          )}
                          {actualPosition === 3 && (
                            <div className="absolute -top-2 -right-2 bg-amber-600 rounded-full p-1.5 shadow-lg">
                              <Award className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center mb-2">
                          <p className="font-semibold text-foreground dark:text-white text-sm" data-testid={`text-name-${actualPosition}`}>
                            {user.nome}
                          </p>
                          <p className="text-2xl font-bold mt-1" style={{ color: actualPosition === 1 ? '#eab308' : actualPosition === 2 ? '#9ca3af' : '#d97706' }}>
                            {user.salesPoints}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.vendasConcluidas} {user.vendasConcluidas === 1 ? 'venda' : 'vendas'}
                          </p>
                        </div>
                        
                        <div 
                          className={`w-32 ${getPodiumHeight(actualPosition)} ${getPodiumBgColor(actualPosition)} rounded-t-lg border-t-4 border-l border-r border-gray-300 dark:border-gray-600 flex items-center justify-center`}
                        >
                          <span className={`text-4xl font-bold ${getMedalColor(actualPosition)}`}>
                            {actualPosition}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {restante.length > 0 && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Ranking Completo
                </h2>
                <div className="space-y-3">
                  {restante.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
                      data-testid={`rank-row-${user.posicao}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center rounded-full">
                          {user.posicao}
                        </Badge>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(user.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-foreground dark:text-white" data-testid={`text-name-${user.posicao}`}>
                            {user.nome}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.vendasConcluidas} {user.vendasConcluidas === 1 ? 'venda concluída' : 'vendas concluídas'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary" data-testid={`text-points-${user.posicao}`}>
                          {user.salesPoints}
                        </p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
