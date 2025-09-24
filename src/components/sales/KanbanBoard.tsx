import React, { useState, useEffect } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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

export const KanbanBoard: React.FC = () => {
  const [oportunidades, setOportunidades] = useState<
    Record<string, Oportunidade[]>
  >({});
  const [dialogAberto, setDialogAberto] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState([
    { id: "1", nome: "Pipeline Principal", ativo: true },
    { id: "2", nome: "Pipeline Produtos", ativo: false },
    { id: "3", nome: "Pipeline Serviços", ativo: false },
  ]);
  const [pipelineAtivo, setPipelineAtivo] = useState("1");
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [oportunidadesData, clientesData] = await Promise.all([
        buscarOportunidades(),
        buscarClientes(),
      ]);

      const oportunidadesOrganizadas: Record<string, Oportunidade[]> = {};
      etapasComerciais.forEach(
        (etapa) => (oportunidadesOrganizadas[etapa.id] = []),
      );

      // Card de exemplo (não persiste)
      oportunidadesOrganizadas["LEAD"] = [
        {
          id: "exemplo-1",
          titulo: "Oportunidade de Exemplo",
          descricao: "Descrição da oportunidade de exemplo para demonstração",
          valor: 15000,
          status: "LEAD",
          probabilidade: 20,
          dataPrevisao: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
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
              nomeEmpresa:
                o.cliente?.nomeEmpresa || o.cliente?.empresa?.nome || "",
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

      // aceitar tanto array quanto { clientes: [] }
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

  const aoTerminarArrasto = async (resultado: DropResult) => {
    const { destination, source, draggableId } = resultado;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    try {
      const origemLista = oportunidades[source.droppableId] || [];
      const oportunidadeArrastada = origemLista.find(
        (op) => op.id === draggableId,
      );
      if (!oportunidadeArrastada) return;

      const novasOportunidades = structuredClone(oportunidades);

      // remover da coluna origem
      novasOportunidades[source.droppableId] = (
        novasOportunidades[source.droppableId] || []
      ).filter((op) => op.id !== draggableId);

      // inserir na coluna destino na posição
      const destinoLista = [
        ...(novasOportunidades[destination.droppableId] || []),
      ];
      const oportunidadeAtualizada: Oportunidade = {
        ...oportunidadeArrastada,
        status: destination.droppableId,
      };
      destinoLista.splice(destination.index, 0, oportunidadeAtualizada);
      novasOportunidades[destination.droppableId] = destinoLista;

      setOportunidades(novasOportunidades);

      if (draggableId !== "exemplo-1") {
        await atualizarOportunidade(draggableId, {
          status: destination.droppableId,
        });
      }

      const etapaDestino = etapasComerciais.find(
        (e) => e.id === destination.droppableId,
      );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">
            Carregando oportunidades...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Pipeline Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-border/50 bg-muted/20 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={pipelineAtivo}
            onChange={(e) => setPipelineAtivo(e.target.value)}
            className="bg-background border border-border rounded-md px-2 py-1 text-xs sm:text-sm text-foreground flex-1 sm:flex-none"
            data-testid="select-pipeline"
          >
            {pipelines.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id}>
                {pipeline.nome}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const nome = prompt("Nome do novo pipeline:");
              if (nome) {
                const novoId = String(pipelines.length + 1);
                setPipelines([
                  ...pipelines,
                  { id: novoId, nome, ativo: false },
                ]);
              }
            }}
            className="text-xs whitespace-nowrap"
            data-testid="button-new-pipeline"
          >
            <Plus className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Pipeline</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
        <Button
          onClick={() => setDialogAberto(true)}
          className="glass-button shine-effect w-full sm:w-auto"
          size="sm"
          data-testid="button-new-opportunity"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Oportunidade
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={aoTerminarArrasto}>
          <div className="flex gap-3 p-3 min-w-max">
            {etapasComerciais.map((etapa) => {
              const items = oportunidades[etapa.id] || [];
              const IconeEtapa = etapa.icone;

              const totalColuna = items.reduce(
                (total, item) => total + (item.valor || 0),
                0,
              );
              const mediaProb =
                items.length > 0
                  ? Math.round(
                      items.reduce(
                        (total, item) => total + (item.probabilidade || 0),
                        0,
                      ) / items.length,
                    )
                  : 0;

              return (
                <Droppable key={etapa.id} droppableId={etapa.id}>
                  {(provided, snapshot) => (
                    <div
                      // className={`w-64 sm:w-72 lg:w-80 transition-all duration-200 ${
                      //   snapshot.isDraggingOver
                      //     ? "bg-primary/5 rounded-lg ring-2 ring-primary/20"
                      //     : ""
                      // }`}
                      className={`w-64 sm:w-72 lg:w-80 transition-all duration-200`}
                    >
                      <div className="glass-card rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className={`p-1.5 rounded-lg ${etapa.cor} bg-opacity-10 flex-shrink-0`}
                            >
                              <IconeEtapa
                                className={`h-3.5 w-3.5 ${etapa.cor.replace("bg-", "text-")}`}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-foreground text-sm truncate">
                                {etapa.nome}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {totalColuna.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs">
                              {items.length}
                            </Badge>
                            {items.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {mediaProb}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2 h-[calc(100vh-160px)] overflow-y-auto"
                      >
                        {items.map((oportunidade, index) => (
                          <Draggable
                            key={oportunidade.id}
                            draggableId={oportunidade.id}
                            index={index}
                          >
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                className={
                                  snap.isDragging
                                    ? "cursor-grabbing"
                                    : "cursor-grab"
                                }
                                style={prov.draggableProps.style}
                                data-testid={`card-opportunity-${oportunidade.id}`}
                              >
                                <Card
                                  {...prov.dragHandleProps}
                                  className={
                                    snap.isDragging
                                      ? "border border-primary/50"
                                      : "glass-card border-border/50 bg-card/80 backdrop-blur-sm"
                                  }
                                >
                                  <CardHeader className="pb-1 px-3 pt-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <CardTitle className="text-sm font-medium truncate flex-1 min-w-0">
                                        {oportunidade.titulo}
                                      </CardTitle>
                                      <div className="flex gap-0.5 flex-shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5"
                                          data-testid={`button-edit-opportunity-${oportunidade.id}`}
                                        >
                                          <Edit2 className="w-2.5 h-2.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            excluirOportunidadeHandler(
                                              oportunidade.id,
                                            );
                                          }}
                                          data-testid={`button-delete-opportunity-${oportunidade.id}`}
                                        >
                                          <Trash2 className="w-2.5 h-2.5 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0 px-3 pb-3">
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                      {oportunidade.descricao}
                                    </p>

                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2 text-xs">
                                        <DollarSign className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                        <span className="font-medium text-emerald-600 truncate">
                                          {oportunidade.valor
                                            ? oportunidade.valor.toLocaleString(
                                                "pt-BR",
                                                {
                                                  style: "currency",
                                                  currency: "BRL",
                                                },
                                              )
                                            : "R$ 0,00"}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <User className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">
                                          {oportunidade.cliente.nome}
                                        </span>
                                      </div>

                                      {oportunidade.dataPrevisao && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Calendar className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate">
                                            {new Date(
                                              oportunidade.dataPrevisao,
                                            ).toLocaleDateString("pt-BR")}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-border/50">
                                      <div className="flex items-center justify-between gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs truncate max-w-[60%]"
                                        >
                                          {oportunidade.usuario.nome}
                                        </Badge>
                                        {!!oportunidade.probabilidade && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs flex-shrink-0"
                                          >
                                            {oportunidade.probabilidade}%
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
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