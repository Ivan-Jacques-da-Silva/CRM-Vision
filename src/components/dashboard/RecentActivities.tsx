
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, Mail, CalendarClock, FileText } from 'lucide-react';

export function RecentActivities() {
  // Dados temporários até conectar com a API
  const recentActivities = [
    {
      id: '1',
      type: 'call',
      title: 'Ligação para João Silva',
      description: 'Discussão sobre proposta comercial',
      date: new Date(),
      createdBy: 'Você'
    },
    {
      id: '2',
      type: 'email',
      title: 'Email enviado para Maria Santos',
      description: 'Envio de orçamento solicitado',
      date: new Date(Date.now() - 86400000),
      createdBy: 'Você'
    },
    {
      id: '3',
      type: 'meeting',
      title: 'Reunião com Pedro Costa',
      description: 'Apresentação da solução',
      date: new Date(Date.now() - 172800000),
      createdBy: 'Equipe'
    }
  ];

  // Helper function to determine icon by interaction type
  const getIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <CalendarClock className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>
          Últimas interações com clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="mt-0.5 bg-muted p-1.5 rounded-full">
                {getIcon(activity.type)}
              </div>
              <div className="space-y-1">
                <div className="font-medium text-sm">{activity.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {activity.description}
                </div>
                <div className="flex text-xs text-muted-foreground items-center space-x-2">
                  <span>
                    {format(activity.date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
                  <span>•</span>
                  <span>{activity.createdBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
