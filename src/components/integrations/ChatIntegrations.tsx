
/**
 * Componente para configuração de integrações de chat
 * Permite configurar Facebook, Instagram e WhatsApp
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Facebook, Instagram, MessageCircle, CheckCircle2, AlertCircle, Settings, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegracaoChat {
  id: string;
  plataforma: 'facebook' | 'instagram' | 'whatsapp';
  nome: string;
  conectada: boolean;
  configuracao: {
    appId?: string;
    appSecret?: string;
    accessToken?: string;
    pageId?: string;
    phoneNumberId?: string;
    businessAccountId?: string;
  };
  ultimaConexao?: Date;
}

export function ChatIntegrations() {
  const { toast } = useToast();
  
  const [integracoes, setIntegracoes] = useState<IntegracaoChat[]>([
    {
      id: '1',
      plataforma: 'facebook',
      nome: 'Facebook Messenger',
      conectada: false,
      configuracao: {},
    },
    {
      id: '2',
      plataforma: 'instagram',
      nome: 'Instagram Direct',
      conectada: false,
      configuracao: {},
    },
    {
      id: '3',
      plataforma: 'whatsapp',
      nome: 'WhatsApp Business',
      conectada: true,
      configuracao: {
        phoneNumberId: '+55 11 99999-9999',
        businessAccountId: 'xxx-xxx-xxx',
      },
      ultimaConexao: new Date('2024-06-10T15:30:00'),
    },
  ]);

  const getPlataformaIcon = (plataforma: string) => {
    switch (plataforma) {
      case 'facebook':
        return <Facebook className="h-6 w-6 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-6 w-6 text-pink-600" />;
      case 'whatsapp':
        return <MessageCircle className="h-6 w-6 text-green-600" />;
      default:
        return <MessageCircle className="h-6 w-6" />;
    }
  };

  const getPlataformaColor = (plataforma: string) => {
    switch (plataforma) {
      case 'facebook':
        return 'border-blue-200 bg-blue-50';
      case 'instagram':
        return 'border-pink-200 bg-pink-50';
      case 'whatsapp':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const alternarConexao = (id: string) => {
    setIntegracoes(prev => prev.map(integracao => {
      if (integracao.id === id) {
        const novaConexao = !integracao.conectada;
        return {
          ...integracao,
          conectada: novaConexao,
          ultimaConexao: novaConexao ? new Date() : integracao.ultimaConexao,
        };
      }
      return integracao;
    }));

    const integracao = integracoes.find(i => i.id === id);
    if (integracao) {
      toast({
        title: integracao.conectada ? "Integração desconectada" : "Integração conectada",
        description: `${integracao.nome} foi ${integracao.conectada ? 'desconectada' : 'conectada'} com sucesso.`,
      });
    }
  };

  const salvarConfiguracao = (id: string, config: any) => {
    setIntegracoes(prev => prev.map(integracao => 
      integracao.id === id 
        ? { ...integracao, configuracao: { ...integracao.configuracao, ...config } }
        : integracao
    ));

    toast({
      title: "Configuração salva",
      description: "As configurações da integração foram atualizadas.",
    });
  };

  const testarConexao = async (integracao: IntegracaoChat) => {
    toast({
      title: "Testando conexão",
      description: `Verificando conectividade com ${integracao.nome}...`,
    });

    // Simular teste de conexão
    setTimeout(() => {
      toast({
        title: "Teste concluído",
        description: integracao.conectada 
          ? "Conexão funcionando corretamente!" 
          : "Erro na conexão. Verifique as configurações.",
        variant: integracao.conectada ? "default" : "destructive",
      });
    }, 2000);
  };

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
      <div>
        <h3 className="text-xl font-semibold mb-2">Integrações de Chat</h3>
        <p className="text-muted-foreground">
          Configure as integrações com plataformas de mensagem para centralizar todos os chats no CRM.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {integracoes.map((integracao) => (
              <Card key={integracao.id} className={`${getPlataformaColor(integracao.plataforma)} border-2`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPlataformaIcon(integracao.plataforma)}
                      <CardTitle className="text-lg">{integracao.nome}</CardTitle>
                    </div>
                    <Badge variant={integracao.conectada ? "default" : "secondary"}>
                      {integracao.conectada ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" />Conectado</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" />Desconectado</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {integracao.ultimaConexao && (
                    <p className="text-xs text-muted-foreground">
                      Última conexão: {formatarData(integracao.ultimaConexao)}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`switch-${integracao.id}`}>Ativo</Label>
                    <Switch
                      id={`switch-${integracao.id}`}
                      checked={integracao.conectada}
                      onCheckedChange={() => alternarConexao(integracao.id)}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => testarConexao(integracao)}
                    >
                      Testar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="facebook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                <span>Configuração do Facebook Messenger</span>
              </CardTitle>
              <CardDescription>
                Configure a integração com o Facebook Messenger para receber mensagens diretamente no CRM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Para configurar a integração com Facebook, você precisa criar um App no Facebook Developers 
                  e obter as credenciais necessárias.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fb-app-id">App ID</Label>
                  <Input
                    id="fb-app-id"
                    placeholder="Digite o App ID do Facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-app-secret">App Secret</Label>
                  <Input
                    id="fb-app-secret"
                    type="password"
                    placeholder="Digite o App Secret"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-access-token">Access Token</Label>
                  <Input
                    id="fb-access-token"
                    placeholder="Digite o Access Token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-page-id">Page ID</Label>
                  <Input
                    id="fb-page-id"
                    placeholder="Digite o Page ID"
                  />
                </div>
              </div>
              
              <Button className="w-full">
                Salvar Configuração do Facebook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instagram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                <span>Configuração do Instagram Direct</span>
              </CardTitle>
              <CardDescription>
                Configure a integração com Instagram Direct para gerenciar mensagens privadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  A integração com Instagram requer uma conta Instagram Business conectada ao Facebook.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ig-business-id">Instagram Business Account ID</Label>
                  <Input
                    id="ig-business-id"
                    placeholder="Digite o Business Account ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ig-access-token">Access Token</Label>
                  <Input
                    id="ig-access-token"
                    type="password"
                    placeholder="Digite o Access Token"
                  />
                </div>
              </div>
              
              <Button className="w-full">
                Salvar Configuração do Instagram
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span>Configuração do WhatsApp Business</span>
              </CardTitle>
              <CardDescription>
                Configure a integração com WhatsApp Business API para receber e enviar mensagens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  WhatsApp Business API configurado e funcionando. Última sincronização há 2 horas.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wa-phone-id">Phone Number ID</Label>
                  <Input
                    id="wa-phone-id"
                    value="+55 11 99999-9999"
                    placeholder="Digite o Phone Number ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa-business-id">Business Account ID</Label>
                  <Input
                    id="wa-business-id"
                    value="xxx-xxx-xxx"
                    placeholder="Digite o Business Account ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa-access-token">Access Token</Label>
                  <Input
                    id="wa-access-token"
                    type="password"
                    placeholder="Digite o Access Token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wa-webhook-url">Webhook URL</Label>
                  <Input
                    id="wa-webhook-url"
                    value="https://seudominio.com/webhook/whatsapp"
                    placeholder="URL do webhook"
                  />
                </div>
              </div>
              
              <Button className="w-full">
                Atualizar Configuração do WhatsApp
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
