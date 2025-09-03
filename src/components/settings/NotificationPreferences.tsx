
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { buscarPreferenciasNotificacao, atualizarPreferenciasNotificacao } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PreferenciasNotificacao {
  novosLeads: boolean;
  oportunidadesAtualizadas: boolean;
  lembretesTarefas: boolean;
  emailMarketing: boolean;
  notificacoesPush: boolean;
}

export const NotificationPreferences: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [preferencias, setPreferencias] = useState<PreferenciasNotificacao>({
    novosLeads: true,
    oportunidadesAtualizadas: true,
    lembretesTarefas: true,
    emailMarketing: false,
    notificacoesPush: true
  });

  const { data: preferenciasDados } = useQuery({
    queryKey: ['preferencias-notificacao'],
    queryFn: buscarPreferenciasNotificacao
  });

  const mutationAtualizar = useMutation({
    mutationFn: atualizarPreferenciasNotificacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferencias-notificacao'] });
      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificação foram salvas com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as preferências.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (preferenciasDados) {
      setPreferencias(preferenciasDados);
    }
  }, [preferenciasDados]);

  const handleToggle = (campo: keyof PreferenciasNotificacao) => {
    setPreferencias(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const handleSalvar = () => {
    mutationAtualizar.mutate(preferencias);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Preferências de Notificação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Novos Leads</div>
            <div className="text-sm text-muted-foreground">
              Receber notificações quando novos leads forem cadastrados
            </div>
          </div>
          <Switch
            checked={preferencias.novosLeads}
            onCheckedChange={() => handleToggle('novosLeads')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Oportunidades Atualizadas</div>
            <div className="text-sm text-muted-foreground">
              Notificações sobre mudanças no pipeline de vendas
            </div>
          </div>
          <Switch
            checked={preferencias.oportunidadesAtualizadas}
            onCheckedChange={() => handleToggle('oportunidadesAtualizadas')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Lembretes de Tarefas</div>
            <div className="text-sm text-muted-foreground">
              Alertas sobre tarefas próximas do vencimento
            </div>
          </div>
          <Switch
            checked={preferencias.lembretesTarefas}
            onCheckedChange={() => handleToggle('lembretesTarefas')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Email Marketing</div>
            <div className="text-sm text-muted-foreground">
              Receber novidades e dicas sobre vendas
            </div>
          </div>
          <Switch
            checked={preferencias.emailMarketing}
            onCheckedChange={() => handleToggle('emailMarketing')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Notificações Push</div>
            <div className="text-sm text-muted-foreground">
              Notificações no navegador
            </div>
          </div>
          <Switch
            checked={preferencias.notificacoesPush}
            onCheckedChange={() => handleToggle('notificacoesPush')}
          />
        </div>

        <Button 
          onClick={handleSalvar} 
          disabled={mutationAtualizar.isPending}
          className="w-full"
        >
          {mutationAtualizar.isPending ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </CardContent>
    </Card>
  );
};
