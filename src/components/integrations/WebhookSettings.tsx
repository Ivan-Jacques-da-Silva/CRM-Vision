
/**
 * Componente para configuração de Webhooks
 * Permite gerenciar URLs de webhook para integrações com plataformas externas
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Link, Check, X, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

/**
 * Interface para configuração de webhook
 */
interface ConfiguracaoWebhook {
  id: string;
  nome: string;
  url: string;
  eventos: string[];
  ativo: boolean;
  dataCriacao: Date;
  ultimaAtualizacao: Date;
  ultimoDisparo?: Date;
}

/**
 * Schema de validação para formulário de webhook
 */
const webhookSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  url: z.string().url('URL deve ser válida'),
  eventos: z.array(z.string()).min(1, 'Selecione pelo menos um evento'),
  ativo: z.boolean(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

/**
 * Componente principal de configuração de webhooks
 */
export function WebhookSettings() {
  const { toast } = useToast();
  
  // Estados
  const [webhooks, setWebhooks] = useState<ConfiguracaoWebhook[]>([
    {
      id: '1',
      nome: 'Zapier - Novos Leads',
      url: 'https://hooks.zapier.com/hooks/catch/123456/abc123/',
      eventos: ['novo_lead', 'oportunidade_criada'],
      ativo: true,
      dataCriacao: new Date('2024-01-15'),
      ultimaAtualizacao: new Date('2024-01-20'),
      ultimoDisparo: new Date('2024-01-25T10:30:00'),
    },
    {
      id: '2',
      nome: 'Make.com - Vendas Fechadas',
      url: 'https://hook.integromat.com/abc123def456',
      eventos: ['venda_fechada'],
      ativo: false,
      dataCriacao: new Date('2024-01-10'),
      ultimaAtualizacao: new Date('2024-01-15'),
    },
  ]);
  
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Eventos disponíveis para webhook
  const eventosDisponiveis = [
    { id: 'novo_lead', nome: 'Novo Lead Criado' },
    { id: 'oportunidade_criada', nome: 'Oportunidade Criada' },
    { id: 'oportunidade_atualizada', nome: 'Oportunidade Atualizada' },
    { id: 'venda_fechada', nome: 'Venda Fechada' },
    { id: 'cliente_criado', nome: 'Cliente Criado' },
    { id: 'tarefa_criada', nome: 'Tarefa Criada' },
  ];

  // Formulário
  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      nome: '',
      url: '',
      eventos: [],
      ativo: true,
    },
  });

  /**
   * Submete o formulário de webhook
   */
  const onSubmit = (data: WebhookFormData) => {
    try {
      if (editandoId) {
        // Atualizar webhook existente
        setWebhooks(prev => prev.map(webhook => 
          webhook.id === editandoId 
            ? { 
                ...webhook, 
                nome: data.nome,
                url: data.url,
                eventos: data.eventos,
                ativo: data.ativo,
                ultimaAtualizacao: new Date() 
              }
            : webhook
        ));
        
        toast({
          title: "Webhook atualizado",
          description: "As configurações foram salvas com sucesso.",
        });
      } else {
        // Criar novo webhook
        const novoWebhook: ConfiguracaoWebhook = {
          id: Date.now().toString(),
          nome: data.nome,
          url: data.url,
          eventos: data.eventos,
          ativo: data.ativo,
          dataCriacao: new Date(),
          ultimaAtualizacao: new Date(),
        };
        
        setWebhooks(prev => [...prev, novoWebhook]);
        
        toast({
          title: "Webhook criado",
          description: "Nova configuração de webhook foi adicionada.",
        });
      }
      
      // Reset do formulário
      form.reset();
      setEditandoId(null);
      setMostrarFormulario(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  /**
   * Inicia edição de webhook
   */
  const iniciarEdicao = (webhook: ConfiguracaoWebhook) => {
    setEditandoId(webhook.id);
    setMostrarFormulario(true);
    form.reset({
      nome: webhook.nome,
      url: webhook.url,
      eventos: webhook.eventos,
      ativo: webhook.ativo,
    });
  };

  /**
   * Remove webhook
   */
  const removerWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
    toast({
      title: "Webhook removido",
      description: "A configuração foi excluída com sucesso.",
    });
  };

  /**
   * Alterna status ativo/inativo do webhook
   */
  const alternarStatus = (id: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id 
        ? { ...webhook, ativo: !webhook.ativo, ultimaAtualizacao: new Date() }
        : webhook
    ));
  };

  /**
   * Testa webhook enviando requisição
   */
  const testarWebhook = async (webhook: ConfiguracaoWebhook) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          evento: 'teste',
          timestamp: new Date().toISOString(),
          origem: 'VisionCRM',
          dados: {
            teste: true,
            webhook_id: webhook.id,
          },
        }),
      });

      // Atualizar último disparo
      setWebhooks(prev => prev.map(w => 
        w.id === webhook.id 
          ? { ...w, ultimoDisparo: new Date() }
          : w
      ));

      toast({
        title: "Teste enviado",
        description: "O webhook de teste foi disparado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar o teste para o webhook.",
        variant: "destructive",
      });
    }
  };

  /**
   * Formata data para exibição
   */
  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuração de Webhooks</h2>
          <p className="text-muted-foreground">
            Configure URLs de webhook para integrar com Zapier, Make.com e outras plataformas.
          </p>
        </div>
        <Button onClick={() => setMostrarFormulario(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Webhook
        </Button>
      </div>

      {/* Formulário de criação/edição */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editandoId ? 'Editar Webhook' : 'Novo Webhook'}
            </CardTitle>
            <CardDescription>
              Configure os detalhes do webhook para integração externa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Webhook</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Zapier - Novos Leads" {...field} />
                      </FormControl>
                      <FormDescription>
                        Um nome descritivo para identificar este webhook.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Webhook</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://hooks.zapier.com/hooks/catch/..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        URL fornecida pela plataforma de integração (Zapier, Make.com, etc).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eventos que Disparam o Webhook</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {eventosDisponiveis.map((evento) => (
                          <div key={evento.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={evento.id}
                              checked={field.value.includes(evento.id)}
                              onChange={(e) => {
                                const novoEventos = e.target.checked
                                  ? [...field.value, evento.id]
                                  : field.value.filter(id => id !== evento.id);
                                field.onChange(novoEventos);
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={evento.id} className="text-sm">
                              {evento.nome}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Webhook Ativo</FormLabel>
                        <FormDescription>
                          Quando ativo, o webhook será disparado automaticamente.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setMostrarFormulario(false);
                      setEditandoId(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editandoId ? 'Atualizar' : 'Criar'} Webhook
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Lista de webhooks */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{webhook.nome}</h3>
                    <Badge variant={webhook.ativo ? "default" : "secondary"}>
                      {webhook.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link className="h-4 w-4" />
                    <span className="font-mono">{webhook.url}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {webhook.eventos.map((eventoId) => {
                      const evento = eventosDisponiveis.find(e => e.id === eventoId);
                      return (
                        <Badge key={eventoId} variant="outline" className="text-xs">
                          {evento?.nome || eventoId}
                        </Badge>
                      );
                    })}
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Criado em: {formatarData(webhook.dataCriacao)}</div>
                    <div>Última atualização: {formatarData(webhook.ultimaAtualizacao)}</div>
                    {webhook.ultimoDisparo && (
                      <div>Último disparo: {formatarData(webhook.ultimoDisparo)}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={webhook.ativo}
                    onCheckedChange={() => alternarStatus(webhook.id)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testarWebhook(webhook)}
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Testar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => iniciarEdicao(webhook)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removerWebhook(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {webhooks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-2">
                <h3 className="font-medium">Nenhum webhook configurado</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione seu primeiro webhook para começar a integrar com plataformas externas.
                </p>
                <Button onClick={() => setMostrarFormulario(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
