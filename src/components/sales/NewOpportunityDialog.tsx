
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { criarOportunidade } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Cliente {
  id: string;
  nome: string;
  nomeEmpresa?: string;
}

interface NewOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (oportunidade: any) => void;
  clientes: Cliente[];
}

export const NewOpportunityDialog: React.FC<NewOpportunityDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  clientes
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor: '',
    clienteId: '',
    probabilidade: '',
    dataFechamentoEsperada: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Dados do usuário são obtidos automaticamente pela autenticação

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.clienteId) {
      toast({
        title: "Erro",
        description: "Título e cliente são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const oportunidadeData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor) || 0,
        clienteId: formData.clienteId,
        status: 'LEAD',
        prioridade: 'MEDIA',
        dataPrevisao: formData.dataFechamentoEsperada || null
      };

      await criarOportunidade(oportunidadeData);
      
      toast({
        title: "Sucesso",
        description: "Oportunidade criada com sucesso",
      });

      onSubmit(oportunidadeData);
      
      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        valor: '',
        clienteId: '',
        probabilidade: '',
        dataFechamentoEsperada: ''
      });
    } catch (error) {
      console.error('Erro ao criar oportunidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar oportunidade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card animate-scale-in max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Oportunidade</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              className="glass-card"
            />
          </div>
          
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Select
              value={formData.clienteId}
              onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
            >
              <SelectTrigger className="glass-card">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome} {cliente.nomeEmpresa && `(${cliente.nomeEmpresa})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              className="glass-card"
            />
          </div>
          
          <div>
            <Label htmlFor="probabilidade">Probabilidade (%)</Label>
            <Input
              id="probabilidade"
              type="number"
              min="0"
              max="100"
              value={formData.probabilidade}
              onChange={(e) => setFormData({ ...formData, probabilidade: e.target.value })}
              className="glass-card"
            />
          </div>
          
          <div>
            <Label htmlFor="dataFechamentoEsperada">Data de Fechamento Esperada</Label>
            <Input
              id="dataFechamentoEsperada"
              type="date"
              value={formData.dataFechamentoEsperada}
              onChange={(e) => setFormData({ ...formData, dataFechamentoEsperada: e.target.value })}
              className="glass-card"
            />
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="glass-card"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="transition-all hover:scale-105">
              {loading ? 'Criando...' : 'Criar Oportunidade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
