
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { buscarTarefas } from '@/services/api';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface DashboardTask {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: Date;
  clientName?: string;
  assignedTo: string;
  completed: boolean;
}

export function UpcomingTasks() {
  const [upcomingTasks, setUpcomingTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const carregarTarefas = async () => {
      try {
        const response = await buscarTarefas();
        const tarefas: any[] = Array.isArray(response) ? response : response?.tarefas || [];

        const pendentes = tarefas
          .filter((tarefa: any) => tarefa.status !== 'CONCLUIDA' && tarefa.status !== 'CANCELADA')
          .sort((a: any, b: any) => {
            const dataA = a.dataVencimento ? new Date(a.dataVencimento).getTime() : 0;
            const dataB = b.dataVencimento ? new Date(b.dataVencimento).getTime() : 0;
            return dataA - dataB;
          })
          .slice(0, 5);

        const mapPrioridade = (prioridade: string | undefined): TaskPriority => {
          switch (prioridade) {
            case 'URGENTE':
              return 'urgent';
            case 'ALTA':
              return 'high';
            case 'MEDIA':
              return 'medium';
            case 'BAIXA':
              return 'low';
            default:
              return 'low';
          }
        };

        const tarefasDashboard: DashboardTask[] = pendentes.map((tarefa: any) => {
          const dueDate = tarefa.dataVencimento ? new Date(tarefa.dataVencimento) : new Date();

          return {
            id: tarefa.id,
            title: tarefa.titulo || 'Tarefa',
            priority: mapPrioridade(tarefa.prioridade as string | undefined),
            dueDate,
            clientName: tarefa.cliente?.nome as string | undefined,
            assignedTo:
              (tarefa.usuarioResponsavel as string | undefined) ||
              (tarefa.usuario?.nome as string | undefined) ||
              'Você',
            completed: tarefa.status === 'CONCLUIDA',
          };
        });

        if (isMounted) {
          setUpcomingTasks(tarefasDashboard);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar próximas tarefas:', error);
        if (isMounted) {
          setUpcomingTasks([]);
          setLoading(false);
        }
      }
    };

    carregarTarefas();

    return () => {
      isMounted = false;
    };
  }, []);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
      default:
        return 'Baixa';
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Próximas Tarefas</CardTitle>
        <CardDescription>
          Tarefas pendentes mais urgentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Carregando próximas tarefas...
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Nenhuma tarefa pendente encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3">
                <Checkbox id={`task-${task.id}`} checked={task.completed} />
                <div className="space-y-1 flex-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className="font-medium text-sm cursor-pointer"
                  >
                    {task.title}
                  </label>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline" className="flex items-center gap-1 py-0 px-2">
                      <span
                        className={cn("w-2 h-2 rounded-full", getPriorityColor(task.priority))}
                      />
                      <span>{getPriorityLabel(task.priority)}</span>
                    </Badge>
                    {task.clientName && (
                      <span className="text-muted-foreground">
                        {task.clientName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Vence em {format(task.dueDate, "dd 'de' MMMM", { locale: ptBR })}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {task.assignedTo}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
