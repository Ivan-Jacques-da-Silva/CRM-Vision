
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { criarOportunidade, criarTarefa } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

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
  pipelineId: string;
}

export const NewOpportunityDialog: React.FC<NewOpportunityDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  clientes,
  pipelineId,
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
  const [criarTarefaFlag, setCriarTarefaFlag] = useState(false);
  const [taskTitulo, setTaskTitulo] = useState('');
  const [taskDataHora, setTaskDataHora] = useState('');

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
      const probabilidadeNumero =
        formData.probabilidade !== ''
          ? Math.max(0, Math.min(100, Number(formData.probabilidade)))
          : undefined;

      const dataNormalizada =
        formData.dataFechamentoEsperada && formData.dataFechamentoEsperada.length === 10
          ? `${formData.dataFechamentoEsperada}T00:00:00`
          : formData.dataFechamentoEsperada || null;

      const oportunidadeData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor) || 0,
        clienteId: formData.clienteId,
        status: 'LEAD',
        prioridade: 'MEDIA',
        dataPrevisao: dataNormalizada,
        pipeline: pipelineId || 'principal',
        ...(probabilidadeNumero !== undefined && { probabilidade: probabilidadeNumero })
      };

      const resp = await criarOportunidade(oportunidadeData);
      const oportunidadeCriada = resp?.oportunidade || resp;
      const oportunidadeId = oportunidadeCriada?.id;
      
      if (criarTarefaFlag && taskDataHora) {
        const tituloTarefa = taskTitulo?.trim() || `Follow-up: ${formData.titulo}`;
        const tarefaData = {
          titulo: tituloTarefa,
          descricao: formData.descricao || '',
          status: 'PENDENTE',
          prioridade: 'MEDIA',
          dataVencimento: taskDataHora,
          clienteId: formData.clienteId || undefined,
          oportunidadeId: oportunidadeId || undefined
        };
        await criarTarefa(tarefaData);
      }
      
      toast({
        title: "Sucesso",
        description: criarTarefaFlag ? "Oportunidade criada e tarefa agendada" : "Oportunidade criada com sucesso",
      });

      onSubmit(oportunidadeCriada || oportunidadeData);
      
      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        valor: '',
        clienteId: '',
        probabilidade: '',
        dataFechamentoEsperada: ''
      });
      setCriarTarefaFlag(false);
      setTaskTitulo('');
      setTaskDataHora('');
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
      <DialogContent className="glass-card animate-scale-in max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nova Oportunidade</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
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
          
          <div className="md:col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="glass-card"
              rows={8}
            />
          </div>
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="criar-tarefa"
                checked={criarTarefaFlag}
                onCheckedChange={(checked) => setCriarTarefaFlag(!!checked)}
              />
              <Label htmlFor="criar-tarefa">Criar tarefa</Label>
            </div>
            {criarTarefaFlag && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="taskDataHora">Para quando</Label>
                  <Input
                    id="taskDataHora"
                    type="datetime-local"
                    value={taskDataHora}
                    onChange={(e) => setTaskDataHora(e.target.value)}
                    className="glass-card"
                  />
                </div>
                <div>
                  <Label htmlFor="taskTitulo">Título da tarefa</Label>
                  <Input
                    id="taskTitulo"
                    value={taskTitulo}
                    placeholder={`Follow-up: ${formData.titulo || 'Oportunidade'}`}
                    onChange={(e) => setTaskTitulo(e.target.value)}
                    className="glass-card"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
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
