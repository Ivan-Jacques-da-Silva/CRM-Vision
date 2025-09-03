
/**
 * Página de Integrações e Webhooks
 * Gerencia as configurações de integração com plataformas externas
 */
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookSettings } from '@/components/integrations/WebhookSettings';
import { ChatIntegrations } from '@/components/integrations/ChatIntegrations';
import { Webhook, MessageCircle } from 'lucide-react';

/**
 * Componente principal da página de integrações
 * Centraliza a configuração de webhooks e integrações de chat
 */
export function Integrations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
        <p className="text-muted-foreground">
          Configure integrações com plataformas externas como Zapier, Make.com e sistemas de chat.
        </p>
      </div>
      
      <Tabs defaultValue="webhooks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="webhooks" className="flex items-center space-x-2">
            <Webhook className="h-4 w-4" />
            <span>Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="webhooks">
          <WebhookSettings />
        </TabsContent>
        
        <TabsContent value="chat">
          <ChatIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
