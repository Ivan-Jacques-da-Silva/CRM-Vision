
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, User, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { buscarTarefas, atualizarTarefa, excluirTarefa } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { NewTaskDialog } from '@/components/tasks/NewTaskDialog';
import { addDays, endOfDay, isBefore, startOfDay } from 'date-fns';

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  dataVencimento: string;
  clienteId?: string;
  oportunidadeId?: string;
  usuarioResponsavel?: string;
  cliente?: {
    nome: string;
    nomeEmpresa?: string;
  };
  usuario?: {
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

type TaskViewFilter = 'HOJE' | 'ATRASADAS' | 'PROXIMOS_7_DIAS' | 'ATIVAS';

const Tasks = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [filtro, setFiltro] = useState<TaskViewFilter>('HOJE');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const inicioHoje = startOfDay(new Date());
  const fimHoje = endOfDay(inicioHoje);
  const fimProximos7 = endOfDay(addDays(inicioHoje, 7));
  const filtroOpcoes: { key: TaskViewFilter; label: string }[] = [
    { key: 'HOJE', label: 'Hoje' },
    { key: 'ATRASADAS', label: 'Atrasadas' },
    { key: 'PROXIMOS_7_DIAS', label: 'Próx. 7 dias' },
    { key: 'ATIVAS', label: 'Todas ativas' },
  ];

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    try {
      setLoading(true);
      const response = await buscarTarefas();
      const lista = Array.isArray(response) ? response : response?.tarefas || [];
      setTarefas(lista);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusTarefa = async (id: string, novoStatus: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA') => {
    try {
      await atualizarTarefa(id, { status: novoStatus });
      setTarefas(tarefas.map(tarefa => 
        tarefa.id === id ? { ...tarefa, status: novoStatus } : tarefa
      ));
      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado",
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive",
      });
    }
  };

  const excluirTarefaHandler = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await excluirTarefa(id);
        setTarefas(tarefas.filter(tarefa => tarefa.id !== id));
        toast({
          title: "Sucesso",
          description: "Tarefa excluída com sucesso",
        });
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir tarefa",
          variant: "destructive",
        });
      }
    }
  };

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const dataVencimento = new Date(tarefa.dataVencimento);
    const isAtiva = tarefa.status === 'PENDENTE' || tarefa.status === 'EM_ANDAMENTO';

    if (Number.isNaN(dataVencimento.getTime()) || !isAtiva) {
      return false;
    }

    switch (filtro) {
      case 'HOJE':
        return dataVencimento >= inicioHoje && dataVencimento <= fimHoje;
      case 'ATRASADAS':
        return isBefore(dataVencimento, inicioHoje);
      case 'PROXIMOS_7_DIAS':
        return dataVencimento > fimHoje && dataVencimento <= fimProximos7;
      case 'ATIVAS':
      default:
        return true;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'EM_ANDAMENTO':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'CONCLUIDA':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELADA':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE':
        return 'bg-red-500';
      case 'ALTA':
        return 'bg-orange-500';
      case 'MEDIA':
        return 'bg-yellow-500';
      case 'BAIXA':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleNovaTask = () => {
    carregarTarefas();
    setDialogAberto(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Tarefas</h1>
        <Button onClick={() => setDialogAberto(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {filtroOpcoes.map((opcao) => (
          <Button
            key={opcao.key}
            variant={filtro === opcao.key ? 'default' : 'outline'}
            onClick={() => setFiltro(opcao.key)}
            size="sm"
            className="w-full sm:w-auto"
          >
            {opcao.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tarefasFiltradas.map((tarefa) => (
          <Card key={tarefa.id} className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{tarefa.titulo}</CardTitle>
                  {tarefa.cliente && (
                    <p className="text-xs text-muted-foreground">
                      {tarefa.cliente.nome}
                      {tarefa.cliente.nomeEmpresa ? ` • ${tarefa.cliente.nomeEmpresa}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(tarefa.status)}
                  <Badge className={`${getPrioridadeColor(tarefa.prioridade)} text-white`}>
                    {tarefa.prioridade}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tarefa.descricao && (
                <p className="text-sm text-muted-foreground mb-3">
                  {tarefa.descricao}
                </p>
              )}
              
              <div className="space-y-2">
                {tarefa.dataVencimento && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(tarefa.dataVencimento).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                )}
                
                {(tarefa.usuarioResponsavel || tarefa.usuario?.nome) && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span>{tarefa.usuarioResponsavel || tarefa.usuario?.nome}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {tarefa.status !== 'CONCLUIDA' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => atualizarStatusTarefa(tarefa.id, 'CONCLUIDA')}
                    className="w-full sm:w-auto"
                  >
                    Concluir
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => excluirTarefaHandler(tarefa.id)}
                  className="w-full sm:w-auto"
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && tarefasFiltradas.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa encontrada para este filtro.
            </p>
          </CardContent>
        </Card>
      )}

      <NewTaskDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        onTaskCreated={handleNovaTask}
      />
    </div>
  );
};

export default Tasks;
