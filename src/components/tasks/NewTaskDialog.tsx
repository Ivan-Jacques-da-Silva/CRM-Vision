
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { criarTarefa, buscarClientes } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
}

export const NewTaskDialog: React.FC<NewTaskDialogProps> = ({
  open,
  onOpenChange,
  onTaskCreated
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'PENDENTE' as 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA',
    prioridade: 'MEDIA' as 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE',
    dataVencimento: '',
    clienteId: ''
  });
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      carregarClientes();
    }
  }, [open]);

  const carregarClientes = async () => {
    try {
      const response = await buscarClientes();
      setClientes(response.clientes || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await criarTarefa(formData);
      
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso",
      });

      onTaskCreated();
      
      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        status: 'PENDENTE',
        prioridade: 'MEDIA',
        dataVencimento: '',
        clienteId: ''
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select
              value={formData.prioridade}
              onValueChange={(value: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE') => 
                setFormData({ ...formData, prioridade: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAIXA">Baixa</SelectItem>
                <SelectItem value="MEDIA">Média</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="dataVencimento">Data de Vencimento</Label>
            <Input
              id="dataVencimento"
              type="date"
              value={formData.dataVencimento}
              onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="cliente">Cliente (Opcional)</Label>
            <Select
              value={formData.clienteId}
              onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
