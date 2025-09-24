
import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  DollarSign,
  User,
  Users,
  Send,
  Handshake,
  Trophy,
  XCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { NewOpportunityDialog } from "./NewOpportunityDialog";
import {
  buscarOportunidades,
  atualizarOportunidade,
  excluirOportunidade,
  buscarClientes,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Oportunidade {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  status: string;
  probabilidade: number;
  dataPrevisao?: string;
  cliente: {
    id: string;
    nome: string;
    nomeEmpresa?: string;
    empresa?: { nome: string };
  };
  usuario: {
    id?: string;
    nome: string;
  };
  createdAt: string;
}

interface Cliente {
  id: string;
  nome: string;
  nomeEmpresa?: string;
}

const etapasComerciais = [
  { id: "LEAD", nome: "Lead Recebido", icone: Users, cor: "bg-blue-500" },
  { id: "QUALIFICADO", nome: "Qualificado", icone: User, cor: "bg-indigo-500" },
  { id: "PROPOSTA", nome: "Proposta", icone: Send, cor: "bg-purple-500" },
  {
    id: "NEGOCIACAO",
    nome: "Negociação",
    icone: Handshake,
    cor: "bg-yellow-500",
  },
  { id: "GANHO", nome: "Ganho", icone: Trophy, cor: "bg-green-500" },
  { id: "PERDIDO", nome: "Perdido", icone: XCircle, cor: "bg-red-500" },
] as const;

interface SortableCardProps {
  oportunidade: Oportunidade;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableCard({ oportunidade, onEdit, onDelete }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: oportunidade.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? "z-50 shadow-2xl cursor-grabbing rotate-2" : "cursor-grab hover:shadow-lg"} transition-all duration-200`}
      data-testid={`card-opportunity-${oportunidade.id}`}
    >
      <Card className="glass-card border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium truncate">
              {oportunidade.titulo}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(oportunidade.id);
                }}
                data-testid={`button-edit-opportunity-${oportunidade.id}`}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(oportunidade.id);
                }}
                data-testid={`button-delete-opportunity-${oportunidade.id}`}
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
                {oportunidade.valor
                  ? oportunidade.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "R$ 0,00"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{oportunidade.cliente.nome}</span>
            </div>

            {oportunidade.dataPrevisao && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(oportunidade.dataPrevisao).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {oportunidade.usuario.nome}
              </Badge>
              {!!oportunidade.probabilidade && (
                <Badge variant="secondary" className="text-xs">
                  {oportunidade.probabilidade}%
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DroppableColumnProps {
  etapa: typeof etapasComerciais[0];
  oportunidades: Oportunidade[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function DroppableColumn({ etapa, oportunidades, onEdit, onDelete }: DroppableColumnProps) {
  const IconeEtapa = etapa.icone;
  const totalColuna = oportunidades.reduce((total, item) => total + (item.valor || 0), 0);
  const mediaProb = oportunidades.length > 0
    ? Math.round(oportunidades.reduce((total, item) => total + (item.probabilidade || 0), 0) / oportunidades.length)
    : 0;

  return (
    <div className="w-72">
      <div className="glass-card rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${etapa.cor} bg-opacity-10`}>
              <IconeEtapa className={`h-4 w-4 ${etapa.cor.replace("bg-", "text-")}`} />
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">{etapa.nome}</h3>
              <p className="text-xs text-muted-foreground">
                {totalColuna.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="text-xs">
              {oportunidades.length}
            </Badge>
            {oportunidades.length > 0 && (
              <div className="text-xs text-muted-foreground">Média: {mediaProb}%</div>
            )}
          </div>
        </div>
      </div>

      <SortableContext items={oportunidades.map(o => o.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 h-[calc(100vh-200px)] overflow-y-auto">
          {oportunidades.map((oportunidade) => (
            <SortableCard
              key={oportunidade.id}
              oportunidade={oportunidade}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export const KanbanBoard: React.FC = () => {
  const [oportunidades, setOportunidades] = useState<Record<string, Oportunidade[]>>({});
  const [dialogAberto, setDialogAberto] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [pipelines, setPipelines] = useState([
    { id: "1", nome: "Pipeline Principal", ativo: true },
    { id: "2", nome: "Pipeline Produtos", ativo: false },
    { id: "3", nome: "Pipeline Serviços", ativo: false },
  ]);
  const [pipelineAtivo, setPipelineAtivo] = useState("1");
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [oportunidadesData, clientesData] = await Promise.all([
        buscarOportunidades(),
        buscarClientes(),
      ]);

      const oportunidadesOrganizadas: Record<string, Oportunidade[]> = {};
      etapasComerciais.forEach((etapa) => (oportunidadesOrganizadas[etapa.id] = []));

      // Card de exemplo (não persiste)
      oportunidadesOrganizadas["LEAD"] = [
        {
          id: "exemplo-1",
          titulo: "Oportunidade de Exemplo",
          descricao: "Descrição da oportunidade de exemplo para demonstração",
          valor: 15000,
          status: "LEAD",
          probabilidade: 20,
          dataPrevisao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cliente: {
            id: "cliente-exemplo",
            nome: "Cliente Exemplo",
            nomeEmpresa: "Empresa Exemplo",
          },
          usuario: { id: "user-exemplo", nome: "Vendedor Exemplo" },
          createdAt: new Date().toISOString(),
        },
      ];

      if (Array.isArray(oportunidadesData)) {
        oportunidadesData.forEach((o: any) => {
          const status: string = o.status || "LEAD";
          if (!oportunidadesOrganizadas[status]) return;

          const oportunidadeMapeada: Oportunidade = {
            id: String(o.id),
            titulo: o.titulo,
            descricao: o.descricao || "",
            valor: Number(o.valor || 0),
            status,
            probabilidade: Number(o.probabilidade || 0),
            dataPrevisao: o.dataPrevisao,
            cliente: {
              id: o.cliente?.id ? String(o.cliente.id) : "",
              nome: o.cliente?.nome || "Cliente não identificado",
              nomeEmpresa: o.cliente?.nomeEmpresa || o.cliente?.empresa?.nome || "",
              empresa: o.cliente?.empresa,
            },
            usuario: {
              id: o.usuario?.id || o.usuarioId,
              nome: o.usuario?.nome || "Usuário não identificado",
            },
            createdAt: o.createdAt || o.criadoEm || new Date().toISOString(),
          };

          oportunidadesOrganizadas[status].push(oportunidadeMapeada);
        });
      }

      setOportunidades(oportunidadesOrganizadas);

      const listaClientes = Array.isArray(clientesData)
        ? clientesData
        : Array.isArray(clientesData?.clientes)
        ? clientesData.clientes
        : [];
      setClientes(listaClientes);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar oportunidades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the source column
    let sourceColumn = '';
    let targetColumn = '';
    
    for (const [columnId, items] of Object.entries(oportunidades)) {
      if (items.find(item => item.id === activeId)) {
        sourceColumn = columnId;
        break;
      }
    }

    // Determine target column
    if (etapasComerciais.find(etapa => etapa.id === overId)) {
      targetColumn = overId as string;
    } else {
      // Find which column the overId belongs to
      for (const [columnId, items] of Object.entries(oportunidades)) {
        if (items.find(item => item.id === overId)) {
          targetColumn = columnId;
          break;
        }
      }
    }

    if (!sourceColumn || !targetColumn) return;

    const sourceItems = oportunidades[sourceColumn];
    const targetItems = oportunidades[targetColumn];
    const activeItem = sourceItems.find(item => item.id === activeId);

    if (!activeItem) return;

    if (sourceColumn === targetColumn) {
      // Reordering within the same column
      const oldIndex = sourceItems.findIndex(item => item.id === activeId);
      const newIndex = sourceItems.findIndex(item => item.id === overId);
      
      if (oldIndex !== newIndex) {
        const newItems = arrayMove(sourceItems, oldIndex, newIndex);
        setOportunidades(prev => ({
          ...prev,
          [sourceColumn]: newItems,
        }));
      }
    } else {
      // Moving between columns
      try {
        const updatedItem = { ...activeItem, status: targetColumn };
        
        setOportunidades(prev => ({
          ...prev,
          [sourceColumn]: prev[sourceColumn].filter(item => item.id !== activeId),
          [targetColumn]: [...prev[targetColumn], updatedItem],
        }));

        if (activeId !== "exemplo-1") {
          await atualizarOportunidade(activeId as string, { status: targetColumn });
        }

        const etapaDestino = etapasComerciais.find(e => e.id === targetColumn);
        toast({
          title: "Oportunidade movida",
          description: `Movida para "${etapaDestino?.nome}" com sucesso`,
        });
      } catch (error) {
        console.error("Erro ao mover oportunidade:", error);
        await carregarDados();
        toast({
          title: "Erro",
          description: "Erro ao mover oportunidade. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const adicionarOportunidade = () => {
    carregarDados();
    setDialogAberto(false);
  };

  const excluirOportunidadeHandler = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta oportunidade?")) {
      try {
        await excluirOportunidade(id);
        await carregarDados();
        toast({
          title: "Sucesso",
          description: "Oportunidade excluída com sucesso",
        });
      } catch (error) {
        console.error("Erro ao excluir oportunidade:", error);
        toast({
          title: "Erro",
          description: "Erro ao excluir oportunidade",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (id: string) => {
    // Implementar lógica de edição
    console.log("Editar oportunidade:", id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Carregando oportunidades...</p>
        </div>
      </div>
    );
  }

  const activeItem = activeId ? 
    Object.values(oportunidades).flat().find(item => item.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Seletor de Pipeline */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <select
            value={pipelineAtivo}
            onChange={(e) => setPipelineAtivo(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            data-testid="select-pipeline"
          >
            {pipelines.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id}>
                {pipeline.nome}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nome = prompt("Nome do novo pipeline:");
              if (nome) {
                const novoId = String(pipelines.length + 1);
                setPipelines([...pipelines, { id: novoId, nome, ativo: false }]);
              }
            }}
            data-testid="button-new-pipeline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pipeline
          </Button>
        </div>
        <Button onClick={() => setDialogAberto(true)} data-testid="button-new-opportunity">
          <Plus className="w-4 h-4 mr-2" />
          Nova Oportunidade
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-4 min-w-max">
            {etapasComerciais.map((etapa) => (
              <DroppableColumn
                key={etapa.id}
                etapa={etapa}
                oportunidades={oportunidades[etapa.id] || []}
                onEdit={handleEdit}
                onDelete={excluirOportunidadeHandler}
              />
            ))}
          </div>

          <DragOverlay>
            {activeItem ? (
              <SortableCard
                oportunidade={activeItem}
                onEdit={handleEdit}
                onDelete={excluirOportunidadeHandler}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
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
