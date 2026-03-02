
import React, { useEffect, useState } from 'react';
import { KanbanBoard } from '@/components/sales/KanbanBoard';
import { Target, TrendingUp, DollarSign, Eye, EyeOff } from 'lucide-react';
import { buscarOportunidades, login, buscarDadosUsuario } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SalesStats {
  totalGanhos: number;
  ganhosMes: number;
  conversao: number;
}

export const Sales = () => {
  const [stats, setStats] = useState<SalesStats>({ totalGanhos: 0, ganhosMes: 0, conversao: 0 });
  const [ocultarValores, setOcultarValores] = useState(() => {
    return localStorage.getItem('pipeline_ocultar_valores') === 'true';
  });
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [verificandoSenha, setVerificandoSenha] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    buscarDadosUsuario().then(response => {
        // A resposta pode vir como { usuario: {...} } ou diretamente o objeto usuario
        const dados = response.usuario || response;
        if (dados && dados.email) {
            setUserEmail(dados.email);
        } else {
            console.error("Email não encontrado na resposta do usuário:", response);
        }
    }).catch(console.error);
  }, []);

  const handleTogglePrivacy = () => {
    setModalSenhaAberto(true);
  };

  const confirmarSenha = async () => {
    if (!senhaConfirmacao) return;
    if (!userEmail) {
        toast({ title: "Erro", description: "Não foi possível identificar o usuário.", variant: "destructive" });
        return;
    }

    setVerificandoSenha(true);
    try {
        await login({ email: userEmail, senha: senhaConfirmacao });
        const novoEstado = !ocultarValores;
        setOcultarValores(novoEstado);
        localStorage.setItem('pipeline_ocultar_valores', String(novoEstado));
        setModalSenhaAberto(false);
        setSenhaConfirmacao("");
        toast({ title: novoEstado ? "Valores ocultos" : "Valores visíveis", description: "Alteração realizada com sucesso." });
    } catch (error) {
        toast({ title: "Senha incorreta", description: "A senha informada não confere.", variant: "destructive" });
    } finally {
        setVerificandoSenha(false);
    }
  };


  useEffect(() => {
    const carregarStats = async () => {
      try {
        const dados = await buscarOportunidades();
        if (!Array.isArray(dados)) {
          return;
        }

        let totalGanhos = 0;
        let ganhosMes = 0;
        let total = 0;
        let ganhos = 0;
        const agora = new Date();

        dados.forEach((o: any) => {
          total += 1;
          if (o.status === 'GANHO') {
            ganhos += 1;
            const valor = Number(o.valorFechado ?? o.valor ?? 0);
            totalGanhos += valor;

            const referenciaStr = o.dataFechamento ?? o.updatedAt ?? o.createdAt;
            const referencia = referenciaStr ? new Date(referenciaStr) : null;
            if (referencia && referencia.getMonth() === agora.getMonth() && referencia.getFullYear() === agora.getFullYear()) {
              ganhosMes += valor;
            }
          }
        });

        const conversao = total > 0 ? Math.round((ganhos / total) * 100) : 0;

        setStats({ totalGanhos, ganhosMes, conversao });
      } catch (error) {
        console.error('Erro ao carregar métricas de vendas:', error);
      }
    };

    carregarStats();
  }, []);

  const totalGanhosFormatado = stats.totalGanhos.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
  const ganhosMesFormatado = stats.ganhosMes.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-4">
      {/* Compact Header with Stats */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Pipeline de Vendas
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTogglePrivacy}
                className="ml-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                title={ocultarValores ? "Mostrar valores" : "Ocultar valores"}
              >
                {ocultarValores ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie suas oportunidades e acompanhe o progresso
            </p>
          </div>

          {/* Compact Stats */}
          <div className="flex gap-2 sm:gap-3">
            <div className="glass-card rounded-lg p-2 sm:p-3 interactive-element group min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Vendas concluídas</p>
                  <div className="text-xs sm:text-sm font-bold text-green-500">
                    <span className="block">Mês: {ocultarValores ? "R$ ******" : ganhosMesFormatado}</span>
                    <span className="block">Total: {ocultarValores ? "R$ ******" : totalGanhosFormatado}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-lg p-2 sm:p-3 interactive-element group min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Conversão</p>
                  <p className="text-xs sm:text-sm font-bold text-blue-500">
                    {stats.conversao}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board - Now with more focus */}
      <div>
        <KanbanBoard hideValues={ocultarValores} />
      </div>

      <Dialog open={modalSenhaAberto} onOpenChange={setModalSenhaAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmação de segurança</DialogTitle>
            <DialogDescription>
              Para {ocultarValores ? "mostrar" : "ocultar"} os valores, confirme sua senha.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              name="username"
              autoComplete="username"
              value={userEmail ?? ""}
              readOnly
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />
            <Input
              type="password"
              name="current-password"
              autoComplete="current-password"
              placeholder="Sua senha atual"
              value={senhaConfirmacao}
              onChange={(e) => setSenhaConfirmacao(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalSenhaAberto(false)}>Cancelar</Button>
              <Button onClick={confirmarSenha} disabled={verificandoSenha}>
                {verificandoSenha ? "Verificando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
};
