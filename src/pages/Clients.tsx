
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
  ClipboardList,
  X
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { buscarClientes, criarCliente, atualizarCliente, excluirCliente, ApiError, type Cliente } from '@/services/api';

export function Clients() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
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
  const [newTag, setNewTag] = useState('');
  const [editTag, setEditTag] = useState('');
  
  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [tagFilter, setTagFilter] = useState<string>('');

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
  
  const filteredClients = clients.filter(client => {
    // Filtro por busca de texto
    const matchesSearch = client.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (client.nomeEmpresa && client.nomeEmpresa.toLowerCase().includes(searchQuery.toLowerCase())) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por status
    const matchesStatus = statusFilter === 'TODOS' || client.status === statusFilter;
    
    // Filtro por tag
    const matchesTag = !tagFilter || (client.tags && client.tags.some(tag => 
      tag.toLowerCase().includes(tagFilter.toLowerCase())
    ));
    
    return matchesSearch && matchesStatus && matchesTag;
  });

  // Obter todas as tags únicas para o filtro
  const allTags = Array.from(new Set(clients.flatMap(client => client.tags || []))).sort();

  // Funções para gerenciar tags
  const addNewTag = () => {
    if (newTag.trim() && !newClientData.tags.includes(newTag.trim())) {
      setNewClientData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeNewTag = (tagToRemove: string) => {
    setNewClientData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addEditTag = () => {
    if (editTag.trim() && selectedClient && !selectedClient.tags.includes(editTag.trim())) {
      setSelectedClient(prev => prev ? {
        ...prev,
        tags: [...(prev.tags || []), editTag.trim()]
      } : null);
      setEditTag('');
    }
  };

  const removeEditTag = (tagToRemove: string) => {
    setSelectedClient(prev => prev ? {
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    } : null);
  };

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
      setNewTag(''); // Limpar tag temporária também
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

  const handleEditClient = (client: Cliente) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    try {
      setIsEditing(true);
      const updatedClient = await atualizarCliente(selectedClient.id, selectedClient);
      
      // Atualizar o cliente na lista
      setClients(prev => prev.map(client => 
        client.id === selectedClient.id ? updatedClient.cliente || updatedClient : client
      ));
      
      toast({
        title: "Cliente atualizado com sucesso!",
        description: `${selectedClient.nome} foi atualizado.`,
      });
      
      setEditDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      
      let errorMessage = 'Erro interno do servidor';
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao atualizar cliente",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${clientName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await excluirCliente(clientId);
      
      // Remover o cliente da lista
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      toast({
        title: "Cliente excluído com sucesso!",
        description: `${clientName} foi removido dos seus contatos.`,
      });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      
      let errorMessage = 'Erro interno do servidor';
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao excluir cliente",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handlePhoneCall = (telefone: string) => {
    if (!telefone) {
      toast({
        title: "Telefone não disponível",
        description: "Este cliente não possui telefone cadastrado.",
        variant: "destructive"
      });
      return;
    }
    
    // Remove caracteres não numéricos para criar o link tel
    const cleanPhone = telefone.replace(/\D/g, '');
    window.open(`tel:${cleanPhone}`, '_self');
  };

  const handleEmailClient = (email: string, nome: string) => {
    if (!email) {
      toast({
        title: "Email não disponível",
        description: "Este cliente não possui email cadastrado.",
        variant: "destructive"
      });
      return;
    }
    
    window.open(`mailto:${email}?subject=Contato - ${nome}`, '_self');
  };

  const exportToCSV = () => {
    if (clients.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há clientes para exportar.",
        variant: "destructive"
      });
      return;
    }

    // Function to sanitize CSV fields and prevent formula injection
    const sanitizeCSVField = (field: string): string => {
      if (!field) return '';
      // Convert to string and remove control characters
      const cleanField = String(field).replace(/[\r\n\t]/g, ' ');
      // Prefix with single quote if field starts with formula characters
      if (/^[=+\-@]/.test(cleanField)) {
        return `'${cleanField}`;
      }
      return cleanField;
    };

    const headers = ['Nome', 'Email', 'Telefone', 'Empresa', 'Cargo', 'Status', 'Data de Registro'];
    const csvData = clients.map(client => [
      sanitizeCSVField(client.nome),
      sanitizeCSVField(client.email),
      sanitizeCSVField(client.telefone || ''),
      sanitizeCSVField(client.nomeEmpresa || ''),
      sanitizeCSVField(client.cargo || ''),
      sanitizeCSVField(client.status),
      sanitizeCSVField(client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : '')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída!",
        description: "Os dados dos clientes foram exportados para CSV.",
      });
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
        <Button onClick={() => setClientDialogOpen(true)} data-testid="button-new-client">
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
                data-testid="input-search"
              />
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-filters">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filtros</h4>
                      <p className="text-sm text-muted-foreground">
                        Filtre a lista de clientes por status e tags.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TODOS">Todos</SelectItem>
                            <SelectItem value="ATIVO">Ativo</SelectItem>
                            <SelectItem value="INATIVO">Inativo</SelectItem>
                            <SelectItem value="LEAD">Lead</SelectItem>
                            <SelectItem value="CLIENTE">Cliente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <Select value={tagFilter} onValueChange={setTagFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filtrar por tag" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas as tags</SelectItem>
                            {allTags.map((tag) => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setStatusFilter('TODOS');
                            setTagFilter('');
                          }}
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={exportToCSV} data-testid="button-export-csv">
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
                  <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
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
                      {client.createdAt ? format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handlePhoneCall(client.telefone)}
                          title="Ligar para cliente"
                          data-testid={`button-call-${client.id}`}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEmailClient(client.email, client.nome)}
                          title="Enviar email"
                          data-testid={`button-email-${client.id}`}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${client.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opções</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditClient(client)} data-testid={`menu-edit-${client.id}`}>
                              <PenLine className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem data-testid={`menu-history-${client.id}`}>
                              <ClipboardList className="mr-2 h-4 w-4" /> Ver Histórico
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClient(client.id, client.nome)}
                              data-testid={`menu-delete-${client.id}`}
                            >
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
                  data-testid="input-create-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa">Empresa</Label>
                <Input 
                  id="nomeEmpresa" 
                  placeholder="Nome da empresa" 
                  value={newClientData.nomeEmpresa}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                  data-testid="input-create-company"
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
                  data-testid="input-create-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  placeholder="(99) 99999-9999" 
                  value={newClientData.telefone}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, telefone: e.target.value }))}
                  data-testid="input-create-phone"
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
                data-testid="input-create-position"
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
                data-testid="input-create-notes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    id="tags"
                    placeholder="Adicionar nova tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
                    data-testid="input-create-tag"
                  />
                  <Button type="button" onClick={addNewTag} variant="outline" size="sm" data-testid="button-add-tag">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newClientData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newClientData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeNewTag(tag)}
                          className="text-muted-foreground hover:text-destructive"
                          data-testid={`button-remove-tag-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientDialogOpen(false)} data-testid="button-cancel-create">
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} disabled={isCreating} data-testid="button-save-client">
              {isCreating ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize os dados do cliente. Clique em salvar para confirmar as alterações.
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome *</Label>
                  <Input 
                    id="edit-nome" 
                    placeholder="Nome completo" 
                    value={selectedClient.nome}
                    onChange={(e) => setSelectedClient(prev => prev ? { ...prev, nome: e.target.value } : null)}
                    data-testid="input-edit-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-nomeEmpresa">Empresa</Label>
                  <Input 
                    id="edit-nomeEmpresa" 
                    placeholder="Nome da empresa" 
                    value={selectedClient.nomeEmpresa || ''}
                    onChange={(e) => setSelectedClient(prev => prev ? { ...prev, nomeEmpresa: e.target.value } : null)}
                    data-testid="input-edit-company"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    type="email" 
                    placeholder="email@exemplo.com" 
                    value={selectedClient.email}
                    onChange={(e) => setSelectedClient(prev => prev ? { ...prev, email: e.target.value } : null)}
                    data-testid="input-edit-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-telefone">Telefone</Label>
                  <Input 
                    id="edit-telefone" 
                    placeholder="(99) 99999-9999" 
                    value={selectedClient.telefone || ''}
                    onChange={(e) => setSelectedClient(prev => prev ? { ...prev, telefone: e.target.value } : null)}
                    data-testid="input-edit-phone"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cargo">Cargo</Label>
                <Input 
                  id="edit-cargo" 
                  placeholder="Cargo na empresa" 
                  value={selectedClient.cargo || ''}
                  onChange={(e) => setSelectedClient(prev => prev ? { ...prev, cargo: e.target.value } : null)}
                  data-testid="input-edit-position"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-observacoes">Observações</Label>
                <Textarea 
                  id="edit-observacoes"
                  placeholder="Informações adicionais sobre o cliente..."
                  rows={3}
                  value={selectedClient.observacoes || ''}
                  onChange={(e) => setSelectedClient(prev => prev ? { ...prev, observacoes: e.target.value } : null)}
                  data-testid="input-edit-notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      id="edit-tags"
                      placeholder="Adicionar nova tag..."
                      value={editTag}
                      onChange={(e) => setEditTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEditTag())}
                      data-testid="input-edit-tag"
                    />
                    <Button type="button" onClick={addEditTag} variant="outline" size="sm" data-testid="button-add-edit-tag">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {(selectedClient.tags && selectedClient.tags.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeEditTag(tag)}
                            className="text-muted-foreground hover:text-destructive"
                            data-testid={`button-remove-edit-tag-${index}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} data-testid="button-cancel-edit">
              Cancelar
            </Button>
            <Button onClick={handleUpdateClient} disabled={isEditing} data-testid="button-update-client">
              {isEditing ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
