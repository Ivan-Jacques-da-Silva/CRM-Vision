
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Users, CreditCard, CalendarClock } from "lucide-react";

export function Subscription() {
  const [userCount, setUserCount] = useState(1);
  const basePrice = 287;
  const additionalUserPrice = 64.90;
  const totalPrice = basePrice + (additionalUserPrice * (userCount - 1));
  
  const nextPaymentDate = new Date();
  nextPaymentDate.setDate(nextPaymentDate.getDate() + 15); // Just an example date
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e usuários do VisionCRM.
        </p>
      </div>

      <Tabs defaultValue="subscription" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Detalhes da Assinatura</CardTitle>
                <CardDescription>
                  Informações sobre seu plano atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium">Plano Premium</p>
                    <p className="text-muted-foreground">Recursos completos</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Ativo
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Plano base (1 usuário)</p>
                    <p>{formatCurrency(basePrice)}</p>
                  </div>
                  
                  {userCount > 1 && (
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">
                        Usuários adicionais ({userCount - 1} x {formatCurrency(additionalUserPrice)})
                      </p>
                      <p>{formatCurrency(additionalUserPrice * (userCount - 1))}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t">
                    <p className="font-medium">Total mensal</p>
                    <p className="font-bold text-lg">{formatCurrency(totalPrice)}</p>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md flex items-center">
                  <CalendarClock className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Próxima cobrança</p>
                    <p className="text-muted-foreground">
                      {nextPaymentDate.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline">Gerenciar Forma de Pagamento</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                    <p>Clientes ilimitados</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                    <p>Funil de vendas</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                    <p>Histórico de interações</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                    <p>Agenda integrada</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                    <p>Relatórios e dashboards</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
                    <p>Suporte prioritário</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full">Atualizar Plano</Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Abril 2024</p>
                    <p className="text-muted-foreground text-sm">
                      Plano Premium - {userCount} usuário{userCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(totalPrice)}</p>
                    <p className="text-sm text-emerald-500">Pago</p>
                  </div>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Março 2024</p>
                    <p className="text-muted-foreground text-sm">
                      Plano Premium - {userCount} usuário{userCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(totalPrice)}</p>
                    <p className="text-sm text-emerald-500">Pago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Gerenciar Usuários</span>
                <Badge variant="outline">{userCount} usuário{userCount > 1 ? 's' : ''}</Badge>
              </CardTitle>
              <CardDescription>
                Adicione ou remova usuários da sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Quantidade de usuários</Label>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setUserCount(Math.max(1, userCount - 1))}
                    disabled={userCount <= 1}
                  >
                    -
                  </Button>
                  <Input 
                    className="w-20 mx-2 text-center" 
                    value={userCount} 
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1) {
                        setUserCount(value);
                      }
                    }}
                    min="1"
                    type="number"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setUserCount(userCount + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-start">
                  <Users className="h-5 w-5 mr-3 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Impacto no valor</p>
                    <p className="text-muted-foreground">
                      Plano base: {formatCurrency(basePrice)} + {userCount - 1} usuário(s) adicional(is): {formatCurrency(additionalUserPrice * (userCount - 1))}
                    </p>
                    <p className="font-bold mt-1">
                      Novo total mensal: {formatCurrency(totalPrice)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                      A
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@company.com</p>
                    </div>
                  </div>
                  <Badge>Admin</Badge>
                </div>
                
                {userCount > 1 && Array.from({ length: userCount - 1 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {String.fromCharCode(66 + i)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Usuário {i + 2}</p>
                        <p className="text-xs text-muted-foreground">user{i + 2}@company.com</p>
                      </div>
                    </div>
                    <Badge variant="outline">Vendedor</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Alterações</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Informações de Cobrança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Mastercard **** 4321</p>
                  <p className="text-muted-foreground text-sm">Expira em 05/2025</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Atualizar Forma de Pagamento</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Subscription;
