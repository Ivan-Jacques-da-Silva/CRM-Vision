
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, Mail, CalendarClock, FileText } from 'lucide-react';
import { buscarOportunidades } from '@/services/api';

type ActivityType = 'call' | 'email' | 'meeting' | 'note';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: Date;
  createdBy: string;
}

export function RecentActivities() {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const carregarAtividades = async () => {
      try {
        const response = await buscarOportunidades();
        const oportunidades: any[] = Array.isArray(response) ? response : [];

        const atividades: Activity[] = oportunidades.slice(0, 5).map((oportunidade: any) => {
          const status = oportunidade.status as string | undefined;

          let type: ActivityType = 'note';
          switch (status) {
            case 'QUALIFICADO':
              type = 'call';
              break;
            case 'PROPOSTA':
              type = 'email';
              break;
            case 'NEGOCIACAO':
            case 'GANHO':
              type = 'meeting';
              break;
            default:
              type = 'note';
          }

          const tituloBase = oportunidade.titulo || 'Oportunidade';
          const clienteNome = oportunidade.cliente?.nome as string | undefined;

          const title = clienteNome ? `${tituloBase} - ${clienteNome}` : tituloBase;

          const description = status ? `Status: ${status}` : 'Atualização de oportunidade';

          const dataBase = oportunidade.updatedAt || oportunidade.createdAt;
          const date = dataBase ? new Date(dataBase) : new Date();

          const createdBy =
            (oportunidade.usuario?.nome as string | undefined) ||
            'Você';

          return {
            id: oportunidade.id,
            type,
            title,
            description,
            date,
            createdBy,
          };
        });

        if (isMounted) {
          setRecentActivities(atividades);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar atividades recentes:', error);
        if (isMounted) {
          setRecentActivities([]);
          setLoading(false);
        }
      }
    };

    carregarAtividades();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper function to determine icon by interaction type
  const getIcon = (type: ActivityType) => {
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
          Últimas interações registradas nas oportunidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Carregando atividades recentes...
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Nenhuma atividade recente encontrada.
          </div>
        ) : (
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
                      {format(activity.date, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                    <span>•</span>
                    <span>{activity.createdBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
