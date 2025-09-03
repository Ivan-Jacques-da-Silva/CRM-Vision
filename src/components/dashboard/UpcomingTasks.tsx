
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function UpcomingTasks() {
  // Dados temporários até conectar com a API
  const upcomingTasks = [
    {
      id: '1',
      title: 'Ligar para João Silva',
      priority: 'high',
      dueDate: new Date(),
      clientId: '1',
      assignedTo: 'Você',
      completed: false
    },
    {
      id: '2',
      title: 'Enviar proposta para Maria Santos',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000),
      clientId: '2',
      assignedTo: 'Equipe',
      completed: false
    },
    {
      id: '3',
      title: 'Revisar contrato',
      priority: 'low',
      dueDate: new Date(Date.now() + 172800000),
      assignedTo: 'Você',
      completed: false
    }
  ];

  const mockClients = [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' }
  ];

  // Get client name by ID
  const getClientName = (clientId?: string) => {
    if (!clientId) return '';
    const client = mockClients.find(c => c.id === clientId);
    return client ? client.name : '';
  };

  const getPriorityColor = (priority: string) => {
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

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Próximas Tarefas</CardTitle>
        <CardDescription>
          Tarefas pendentes mais urgentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingTasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3">
              <Checkbox id={`task-${task.id}`} />
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
                    <span>
                      {task.priority === 'high' && 'Alta'}
                      {task.priority === 'medium' && 'Média'}
                      {task.priority === 'low' && 'Baixa'}
                    </span>
                  </Badge>
                  {task.clientId && (
                    <span className="text-muted-foreground">
                      {getClientName(task.clientId)}
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
      </CardContent>
    </Card>
  );
}
