
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarClock, Users, Phone, FileText } from 'lucide-react';

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Dados temporários até conectar com a API
  const mockEvents = [
    {
      id: '1',
      title: 'Reunião com cliente',
      description: 'Apresentação de proposta',
      date: new Date(),
      type: 'meeting',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Ligação de follow-up',
      description: 'Verificar interesse',
      date: new Date(),
      type: 'call',
      priority: 'medium'
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'task':
        return <FileText className="h-4 w-4" />;
      default:
        return <CalendarClock className="h-4 w-4" />;
    }
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

  const filteredEvents = selectedDate
    ? mockEvents.filter(event =>
        format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      )
    : mockEvents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
        <p className="text-muted-foreground">
          Gerencie seus compromissos e eventos importantes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Eventos para {selectedDate ? format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR }) : 'hoje'}
            </CardTitle>
            <CardDescription>
              {filteredEvents.length} evento(s) agendado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum evento agendado para esta data.
                </p>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="mt-0.5 bg-muted p-1.5 rounded-full">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.description}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="flex items-center gap-1 py-0 px-2">
                          <span
                            className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`}
                          />
                          <span>
                            {event.priority === 'high' && 'Alta'}
                            {event.priority === 'medium' && 'Média'}
                            {event.priority === 'low' && 'Baixa'}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
