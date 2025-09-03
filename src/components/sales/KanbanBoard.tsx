
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Calendar, DollarSign, User, Users, Send, Handshake, Clock, CheckCircle, Trophy, XCircle, Edit2, Trash2 } from 'lucide-react';
import { NewOpportunityDialog } from './NewOpportunityDialog';
import { buscarOportunidades, atualizarOportunidade, excluirOportunidade, buscarClientes } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Oportunidade {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  estagio: string;
  probabilidade: number;
  dataFechamentoEsperada?: string;
  cliente: {
    id: string;
    nome: string;
    nomeEmpresa?: string;
  };
  responsavel: {
    id: string;
    nome: string;
  };
  criadoEm: string;
}

interface Cliente {
  id: string;
  nome: string;
  nomeEmpresa?: string;
}

const etapasComerciais = [
  { id: 'LEAD', nome: 'Lead Recebido', icone: Users, cor: 'bg-blue-500' },
  { id: 'QUALIFICADO', nome: 'Qualificado', icone: User, cor: 'bg-indigo-500' },
  { id: 'PROPOSTA', nome: 'Proposta', icone: Send, cor: 'bg-purple-500' },
  { id: 'NEGOCIACAO', nome: 'Negociação', icone: Handshake, cor: 'bg-yellow-500' },
  { id: 'GANHO', nome: 'Ganho', icone: Trophy, cor: 'bg-green-500' },
  { id: 'PERDIDO', nome: 'Perdido', icone: XCircle, cor: 'bg-red-500' }
];

export const KanbanBoard: React.FC = () => {
  const [oportunidades, setOportunidades] = useState<{ [key: string]: Oportunidade[] }>({});
  const [dialogAberto, setDialogAberto] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState([
    { id: '1', nome: 'Pipeline Principal', ativo: true },
    { id: '2', nome: 'Pipeline Produtos', ativo: false },
    { id: '3', nome: 'Pipeline Serviços', ativo: false }
  ]);
  const [pipelineAtivo, setPipelineAtivo] = useState('1');
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [oportunidadesData, clientesData] = await Promise.all([
        buscarOportunidades(),
        buscarClientes()
      ]);

      // Organizar oportunidades por estágio
      const oportunidadesOrganizadas: { [key: string]: Oportunidade[] } = {};
      etapasComerciais.forEach(etapa => {
        oportunidadesOrganizadas[etapa.id] = [];
      });

      // Adicionar card de exemplo em LEAD
      oportunidadesOrganizadas['LEAD'] = [{
        id: 'exemplo-1',
        titulo: 'Oportunidade de Exemplo',
        descricao: 'Descrição da oportunidade de exemplo para demonstração',
        valor: 15000,
        estagio: 'LEAD',
        probabilidade: 20,
        dataFechamentoEsperada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cliente: {
          id: 'cliente-exemplo',
          nome: 'Cliente Exemplo',
          nomeEmpresa: 'Empresa Exemplo'
        },
        responsavel: {
          id: 'user-exemplo',
          nome: 'Vendedor Exemplo'
        },
        criadoEm: new Date().toISOString()
      }];

      if (oportunidadesData.oportunidades) {
        oportunidadesData.oportunidades.forEach((oportunidade: Oportunidade) => {
          const estagio = oportunidade.estagio || 'LEAD';
          if (oportunidadesOrganizadas[estagio]) {
            oportunidadesOrganizadas[estagio].push(oportunidade);
          }
        });
      }

      setOportunidades(oportunidadesOrganizadas);
      setClientes(clientesData.clientes || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar oportunidades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const aoTerminarArrasto = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se não há destino, cancela
    if (!destination) return;

    // Se não houve mudança de posição, cancela
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    try {
      // Encontrar a oportunidade arrastada
      const oportunidadeArrastada = oportunidades[source.droppableId].find(op => op.id === draggableId);
      if (!oportunidadeArrastada) return;

      // Feedback visual imediato - atualizar estado local primeiro
      const novasOportunidades = { ...oportunidades };
      
      // Remover da origem
      novasOportunidades[source.droppableId] = oportunidades[source.droppableId].filter(
        oportunidade => oportunidade.id !== draggableId
      );

      // Adicionar no destino na posição correta
      const oportunidadeAtualizada = { ...oportunidadeArrastada, estagio: destination.droppableId };
      const destinationItems = [...novasOportunidades[destination.droppableId]];
      destinationItems.splice(destination.index, 0, oportunidadeAtualizada);
      novasOportunidades[destination.droppableId] = destinationItems;

      // Atualizar estado imediatamente para feedback visual
      setOportunidades(novasOportunidades);

      // Então atualizar no backend
      await atualizarOportunidade(draggableId, { estagio: destination.droppableId });

      // Toast de sucesso
      const etapaDestino = etapasComerciais.find(e => e.id === destination.droppableId);
      toast({
        title: "Oportunidade movida",
        description: `Movida para "${etapaDestino?.nome}" com sucesso`,
      });

    } catch (error) {
      console.error('Erro ao mover oportunidade:', error);
      
      // Em caso de erro, reverter estado local
      carregarDados();
      
      toast({
        title: "Erro",
        description: "Erro ao mover oportunidade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const adicionarOportunidade = (novaOportunidade: any) => {
    carregarDados(); // Recarregar dados após adicionar
    setDialogAberto(false);
  };

  const excluirOportunidadeHandler = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta oportunidade?')) {
      try {
        await excluirOportunidade(id);
        carregarDados();
        toast({
          title: "Sucesso",
          description: "Oportunidade excluída com sucesso",
        });
      } catch (error) {
        console.error('Erro ao excluir oportunidade:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir oportunidade",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando oportunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Seletor de Pipeline */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <select 
            value={pipelineAtivo} 
            onChange={(e) => setPipelineAtivo(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
          >
            {pipelines.map(pipeline => (
              <option key={pipeline.id} value={pipeline.id}>{pipeline.nome}</option>
            ))}
          </select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const nome = prompt('Nome do novo pipeline:');
              if (nome) {
                const novoId = String(pipelines.length + 1);
                setPipelines([...pipelines, { id: novoId, nome, ativo: false }]);
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pipeline
          </Button>
        </div>
        <Button onClick={() => setDialogAberto(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Oportunidade
        </Button>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={aoTerminarArrasto}>
          <div className="flex gap-4 p-4 min-w-max">
            {etapasComerciais.map((etapa) => {
              const items = oportunidades[etapa.id] || [];
              const IconeEtapa = etapa.icone;
              
              return (
                <Droppable key={etapa.id} droppableId={etapa.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`w-72 transition-all duration-200 ${
                        snapshot.isDraggingOver 
                          ? 'bg-primary/5 rounded-lg ring-2 ring-primary/20 transform scale-102' 
                          : ''
                      }`}
                    >
                      <div className="glass-card rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${etapa.cor} bg-opacity-10`}>
                              <IconeEtapa className={`h-4 w-4 ${etapa.cor.replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground text-sm">{etapa.nome}</h3>
                              <p className="text-xs text-muted-foreground">
                                {items.reduce((total, item) => total + (item.valor || 0), 0).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {items.length}
                            </Badge>
                            {items.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Média: {Math.round(items.reduce((total, item) => total + (item.probabilidade || 0), 0) / items.length)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 h-[calc(100vh-200px)] overflow-y-auto">
                        {items.map((oportunidade, index) => (
                          <Draggable
                            key={oportunidade.id}
                            draggableId={oportunidade.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                 className={`cursor-grab glass-card transition-all duration-200 hover:shadow-md ${
                                   snapshot.isDragging 
                                     ? 'shadow-2xl opacity-95 rotate-3 scale-105 ring-2 ring-primary/20' 
                                     : 'hover:shadow-lg'
                                 }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  transform: snapshot.isDragging 
                                    ? `${provided.draggableProps.style?.transform} rotate(3deg)` 
                                    : provided.draggableProps.style?.transform,
                                }}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium truncate">
                                      {oportunidade.titulo}
                                    </CardTitle>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          excluirOportunidadeHandler(oportunidade.id);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {oportunidade.descricao}
                                  </p>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs">
                                      <DollarSign className="w-3 h-3 text-emerald-500" />
                                      <span className="font-medium text-emerald-600">
                                        {oportunidade.valor ? oportunidade.valor.toLocaleString('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL',
                                        }) : 'R$ 0,00'}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <User className="w-3 h-3" />
                                      <span>{oportunidade.cliente.nome}</span>
                                    </div>
                                    
                                    {oportunidade.dataFechamentoEsperada && (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(oportunidade.dataFechamentoEsperada).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="mt-3 pt-3 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-xs">
                                        {oportunidade.responsavel.nome}
                                      </Badge>
                                      {oportunidade.probabilidade && (
                                        <Badge variant="secondary" className="text-xs">
                                          {oportunidade.probabilidade}%
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      <NewOpportunityDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        onSubmit={adicionarOportunidade}
        clientes={clientes}
      />
    </div>
  );
};
