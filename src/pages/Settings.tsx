
/**
 * Página de Configurações da Conta
 * Permite ao usuário gerenciar dados pessoais, perfis, senha e preferências
 */
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalInfoForm } from '@/components/settings/PersonalInfoForm';
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm';
import { PasswordChangeForm } from '@/components/settings/PasswordChangeForm';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';
import { LanguageSettings } from '@/components/settings/LanguageSettings';

/**
 * Componente principal da página de configurações
 * Organiza as diferentes seções de configuração em abas
 */
export function Settings() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações da Conta</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais, preferências e configurações de segurança.
        </p>
      </div>

      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="profiles">Perfis</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais e informações de contato.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PersonalInfoForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Perfis</CardTitle>
              <CardDescription>
                Configure os perfis disponíveis na sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Altere sua senha e configure as opções de segurança.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure suas preferências de notificação.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationPreferences />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Idioma</CardTitle>
                <CardDescription>
                  Defina o idioma padrão da interface.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageSettings />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
