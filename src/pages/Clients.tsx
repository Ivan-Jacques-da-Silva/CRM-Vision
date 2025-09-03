
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2,
  PenLine,
  Phone,
  Mail,
  ClipboardList
} from "lucide-react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { buscarClientes, criarCliente, ApiError, type Cliente } from '@/services/api';

export function Clients() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nome: '',
    email: '',
    telefone: '',
    nomeEmpresa: '', // Atualizado para o novo nome do campo
    cargo: '',
    endereco: '',
    observacoes: '',
    status: 'ATIVO',
    fonte: '',
    tags: [] as string[]
  });

  // Carregar clientes na inicialização
  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setIsLoading(true);
      const response = await buscarClientes();
      setClients(response.clientes || response || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (client.nomeEmpresa && client.nomeEmpresa.toLowerCase().includes(searchQuery.toLowerCase())) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClient = async () => {
    if (!newClientData.nome.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreating(true);
      const response = await criarCliente(newClientData);
      
      // Adicionar o novo cliente à lista
      setClients(prev => [response.cliente || response, ...prev]);
      
      toast({
        title: "Cliente criado com sucesso!",
        description: `${newClientData.nome} foi adicionado aos seus contatos.`,
      });
      
      // Limpar formulário e fechar dialog
      setNewClientData({
        nome: '',
        email: '',
        telefone: '',
        nomeEmpresa: '', // Atualizado
        cargo: '',
        endereco: '',
        observacoes: '',
        status: 'ATIVO',
        fonte: '',
        tags: []
      });
      setClientDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      
      let errorMessage = 'Erro interno do servidor';
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao criar cliente",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <h3 className="font-medium">Carregando...</h3>
              <p className="text-sm text-muted-foreground">
                Buscando seus clientes no servidor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus contatos e acompanhe interações.
          </p>
        </div>
        <Button onClick={() => setClientDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar clientes..."
                className="pl-9 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome / Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Registro</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {client.nomeEmpresa}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.telefone}</TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'ATIVO' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(client.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opções</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <PenLine className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ClipboardList className="mr-2 h-4 w-4" /> Ver Histórico
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredClients.length === 0 && (
            <div className="p-8 text-center">
              <div className="space-y-2">
                <h3 className="font-medium">Nenhum cliente encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  {clients.length === 0 
                    ? "Crie seu primeiro cliente clicando no botão 'Novo Cliente'."
                    : "Nenhum cliente corresponde aos critérios de busca."
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* New Client Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo cliente. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome completo" 
                  value={newClientData.nome}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa">Empresa</Label>
                <Input 
                  id="nomeEmpresa" 
                  placeholder="Nome da empresa" 
                  value={newClientData.nomeEmpresa}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  value={newClientData.email}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  placeholder="(99) 99999-9999" 
                  value={newClientData.telefone}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, telefone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input 
                id="cargo" 
                placeholder="Cargo na empresa" 
                value={newClientData.cargo}
                onChange={(e) => setNewClientData(prev => ({ ...prev, cargo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes"
                placeholder="Informações adicionais sobre o cliente..."
                rows={3}
                value={newClientData.observacoes}
                onChange={(e) => setNewClientData(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} disabled={isCreating}>
              {isCreating ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
