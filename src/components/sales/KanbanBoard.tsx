import React, { useState, useEffect, useRef } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  PhoneCall,
  MessageCircle,
  FileText,
  Star,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { NewOpportunityDialog } from "./NewOpportunityDialog";
import {
  buscarOportunidades,
  atualizarOportunidade,
  excluirOportunidade,
  buscarClientes,
  buscarPipelinesKanban,
  buscarPipelineAtivoKanban,
  salvarPipelineAtivoKanban,
  criarPipelineKanban,
  salvarConfigKanban,
  PipelineKanban,
  criarTarefa,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { createPortal } from "react-dom";

/* --------- Portal para evitar offset durante o arrasto --------- */
const PortalArrasto: React.FC<{ ativo: boolean; children: React.ReactNode }> = ({
  ativo,
  children,
}) => {
  if (!ativo) return <>{children}</>;
  if (typeof document === "undefined") return null;
  let el = document.getElementById("dnd-portal");
  if (!el) {
    el = document.createElement("div");
    el.id = "dnd-portal";
    document.body.appendChild(el);
  }
  return createPortal(children, el);
};

interface Oportunidade {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  status: string;
  probabilidade: number;
  dataPrevisao?: string;
   pipeline?: string;
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

const ICONES_ETAPAS: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; cor: string; label: string }
> = {
  users: { icon: Users, cor: "bg-blue-500", label: "Leads" },
  user: { icon: User, cor: "bg-slate-500", label: "Contato" },
  send: { icon: Send, cor: "bg-purple-500", label: "Proposta/Envio" },
  handshake: { icon: Handshake, cor: "bg-yellow-500", label: "Negociação" },
  trophy: { icon: Trophy, cor: "bg-green-500", label: "Ganho" },
  xcircle: { icon: XCircle, cor: "bg-red-500", label: "Perdido" },
  phone: { icon: PhoneCall, cor: "bg-emerald-500", label: "Ligação" },
  message: { icon: MessageCircle, cor: "bg-sky-500", label: "Mensagem/Chat" },
  document: { icon: FileText, cor: "bg-indigo-500", label: "Documento" },
  star: { icon: Star, cor: "bg-amber-500", label: "Prioritário" },
  alert: { icon: AlertCircle, cor: "bg-orange-500", label: "Atenção" },
  done: { icon: CheckCircle2, cor: "bg-green-600", label: "Concluído" },
};

const etapasComerciais = [
  { id: "LEAD", nome: "Lead Recebido", icone: Users, cor: "bg-blue-500" },
  { id: "SEM_CONTATO", nome: "Sem contato", icone: User, cor: "bg-slate-500" },
  { id: "QUALIFICADO", nome: "Qualificado", icone: User, cor: "bg-indigo-500" },
  { id: "PROPOSTA", nome: "Proposta", icone: Send, cor: "bg-purple-500" },
  { id: "NEGOCIACAO", nome: "Negociação", icone: Handshake, cor: "bg-yellow-500" },
  { id: "GANHO", nome: "Ganho", icone: Trophy, cor: "bg-green-500" },
  { id: "PERDIDO", nome: "Perdido", icone: XCircle, cor: "bg-red-500" },
] as const;

export const KanbanBoard: React.FC = () => {
  const [todasOportunidades, setTodasOportunidades] = useState<Oportunidade[]>([]);
  const [oportunidades, setOportunidades] = useState<Record<string, Oportunidade[]>>({});
  const [dialogAberto, setDialogAberto] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [etapasPersonalizadas, setEtapasPersonalizadas] = useState<
    Record<string, { id: string; nome: string; cor: string; icone?: string }[]>
  >({});
  const [pipelines, setPipelines] = useState<{ id: string; nome: string; ativo: boolean }[]>([
    { id: "principal", nome: "Pipeline Principal", ativo: true },
  ]);
  const [pipelineAtivo, setPipelineAtivo] = useState("principal");
  const { toast } = useToast();
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [oportunidadeParaExcluir, setOportunidadeParaExcluir] = useState<string | null>(null);
  const [modalNovoPipelineAberto, setModalNovoPipelineAberto] = useState(false);
  const [nomeNovoPipeline, setNomeNovoPipeline] = useState("");
  const [modalNovaColunaAberto, setModalNovaColunaAberto] = useState(false);
  const [nomeNovaColuna, setNomeNovaColuna] = useState("");
  const [iconeNovaColuna, setIconeNovaColuna] = useState("user");
  const [posicaoNovaColuna, setPosicaoNovaColuna] = useState("end");
  const [salvandoPipeline, setSalvandoPipeline] = useState(false);
  const [salvandoColuna, setSalvandoColuna] = useState(false);
  const [ordemEtapas, setOrdemEtapas] = useState<Record<string, string[]>>({});
  const [modalExcluirColunaAberto, setModalExcluirColunaAberto] = useState(false);
  const [colunaParaExcluir, setColunaParaExcluir] = useState<{ id: string; nome: string } | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [oportunidadeEmEdicao, setOportunidadeEmEdicao] = useState<Oportunidade | null>(null);
  const [formEdicao, setFormEdicao] = useState({
    titulo: "",
    valor: "",
    probabilidade: "",
    dataPrevisao: "",
    descricao: "",
  });
  const [criarTarefaEdicao, setCriarTarefaEdicao] = useState(false);
  const [taskTituloEdicao, setTaskTituloEdicao] = useState("");
  const [taskDataHoraEdicao, setTaskDataHoraEdicao] = useState("");
  const [colWidth, setColWidth] = useState<number>(320);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    carregarConfigKanban();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const width = el.clientWidth;
      const etapas = obterEtapasParaPipeline(pipelineAtivo);
      const n = etapas.length || 1;
      const gap = 12; // gap-3 ≈ 12px
      const padding = 24; // p-3 (left+right) ≈ 24px
      const available = width - padding - gap * (n - 1);
      let w = Math.floor(available / n);
      w = Math.max(240, w);
      setColWidth(w);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pipelineAtivo, ordemEtapas, etapasPersonalizadas]);

  const carregarConfigKanban = async () => {
    try {
      const [resposta, preferenciaPipeline] = await Promise.all([
        buscarPipelinesKanban(),
        buscarPipelineAtivoKanban().catch(() => null),
      ]);
      const lista: PipelineKanban[] = Array.isArray(resposta) ? resposta : [];

      if (lista.length === 0) {
        return;
      }

      const pipelinesMapeados = lista.map((p) => ({
        id: p.slug,
        nome: p.nome,
        ativo: false,
      }));

      const pipelinePreferido =
        preferenciaPipeline &&
        typeof preferenciaPipeline === "object" &&
        "pipelineAtivo" in preferenciaPipeline &&
        typeof (preferenciaPipeline as any).pipelineAtivo === "string"
          ? (preferenciaPipeline as any).pipelineAtivo
          : null;

      let ativo = pipelinePreferido || pipelineAtivo;

      if (!pipelinesMapeados.some((p) => p.id === ativo)) {
        ativo = pipelinesMapeados[0].id;
      }

      if (ativo !== pipelineAtivo) {
        setPipelineAtivo(ativo);
      }

      if (pipelinePreferido !== ativo) {
        salvarPipelineAtivoKanban(ativo).catch((error) => {
          console.error("Erro ao sincronizar pipeline ativo do usuario:", error);
        });
      }

      setPipelines(
        pipelinesMapeados.map((p) => ({
          ...p,
          ativo: p.id === ativo,
        }))
      );

      const novasEtapasPersonalizadas: Record<string, { id: string; nome: string; cor: string; icone?: string }[]> =
        {};
      const novaOrdem: Record<string, string[]> = {};

      lista.forEach((p) => {
        if (p.etapasPersonalizadas && typeof p.etapasPersonalizadas === "object") {
          novasEtapasPersonalizadas[p.slug] = p.etapasPersonalizadas as any;
        }
        if (p.ordemEtapas && Array.isArray(p.ordemEtapas)) {
          novaOrdem[p.slug] = p.ordemEtapas as any;
        }
      });

      setEtapasPersonalizadas(novasEtapasPersonalizadas);
      setOrdemEtapas(novaOrdem);
    } catch (error) {
      console.error("Erro ao carregar configuração do Kanban:", error);
    }
  };

  const criarNovoPipeline = async () => {
    const nome = nomeNovoPipeline.trim();
    if (!nome) {
      setModalNovoPipelineAberto(false);
      setNomeNovoPipeline("");
      return;
    }

    try {
      setSalvandoPipeline(true);
      const pipelineCriado = await criarPipelineKanban({ nome });
      await carregarConfigKanban();
      if (pipelineCriado?.slug) {
        setPipelineAtivo(pipelineCriado.slug);
        await salvarPipelineAtivoKanban(pipelineCriado.slug);
      }

      toast({
        title: "Pipeline criado",
        description: `O pipeline "${nome}" foi salvo com sucesso.`,
      });

      setModalNovoPipelineAberto(false);
      setNomeNovoPipeline("");
    } catch (error) {
      console.error("Erro ao criar pipeline:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel salvar o novo pipeline.",
        variant: "destructive",
      });
    } finally {
      setSalvandoPipeline(false);
    }
  };

  const obterEtapasParaPipeline = (pipelineId: string) => {
    const custom = etapasPersonalizadas[pipelineId] || [];
    const base = [
      ...etapasComerciais,
      ...custom.map((etapa) => ({
        id: etapa.id,
        nome: etapa.nome,
        icone: (etapa.icone && ICONES_ETAPAS[etapa.icone]?.icon) || User,
        cor: etapa.cor || (etapa.icone && ICONES_ETAPAS[etapa.icone]?.cor) || "bg-slate-500",
      })),
    ];

    const ordem = ordemEtapas[pipelineId];
    if (!ordem || ordem.length === 0) {
      return base;
    }

    const mapa = new Map(base.map((e) => [e.id, e]));
    const ordenadas: typeof base = [];

    ordem.forEach((id) => {
      const etapa = mapa.get(id);
      if (etapa) {
        ordenadas.push(etapa);
        mapa.delete(id);
      }
    });

    mapa.forEach((etapa) => ordenadas.push(etapa));
    return ordenadas;
  };

  const montarQuadroPorPipeline = (
    lista: Oportunidade[],
    pipelineId: string,
    etapasPipeline: { id: string }[]
  ): Record<string, Oportunidade[]> => {
    const mapa: Record<string, Oportunidade[]> = {};
    etapasPipeline.forEach((etapa) => (mapa[etapa.id] = []));

    lista
      .filter((o) => (o.pipeline || "principal") === pipelineId)
      .forEach((o) => {
        const status = o.status || "LEAD";
        if (!mapa[status]) {
          mapa[status] = [];
        }
        mapa[status].push(o);
      });

    return mapa;
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      const etapas = obterEtapasParaPipeline(pipelineAtivo);
      setOportunidades(montarQuadroPorPipeline(todasOportunidades, pipelineAtivo, etapas));
    }
  }, [pipelineAtivo, todasOportunidades, loading, etapasPersonalizadas, ordemEtapas]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [oportunidadesData, clientesData] = await Promise.all([
        buscarOportunidades(),
        buscarClientes(),
      ]);

      const oportunidadesBrutas: Oportunidade[] = [];
      if (Array.isArray(oportunidadesData)) {
        oportunidadesData.forEach((o: any) => {
          const status: string = o.status || "LEAD";
          const oportunidadeMapeada: Oportunidade = {
            id: String(o.id),
            titulo: o.titulo,
            descricao: o.descricao || "",
            valor: Number(o.valor || 0),
            status,
            probabilidade: Number(o.probabilidade || 0),
            dataPrevisao: o.dataPrevisao,
            pipeline: o.pipeline || "principal",
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

          oportunidadesBrutas.push(oportunidadeMapeada);
        });
      }

      setTodasOportunidades(oportunidadesBrutas);
      const etapas = obterEtapasParaPipeline(pipelineAtivo);
      setOportunidades(montarQuadroPorPipeline(oportunidadesBrutas, pipelineAtivo, etapas));

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

  const abrirModalEdicao = (oportunidade: Oportunidade) => {
    setOportunidadeEmEdicao(oportunidade);
    setFormEdicao({
      titulo: oportunidade.titulo || "",
      valor: oportunidade.valor ? String(oportunidade.valor) : "",
      probabilidade:
        oportunidade.probabilidade !== undefined && oportunidade.probabilidade !== null
          ? String(oportunidade.probabilidade)
          : "",
      dataPrevisao: oportunidade.dataPrevisao
        ? new Date(oportunidade.dataPrevisao).toISOString().slice(0, 10)
        : "",
      descricao: oportunidade.descricao || "",
    });
    setCriarTarefaEdicao(false);
    setTaskTituloEdicao("");
    setTaskDataHoraEdicao("");
    setModalEditarAberto(true);
  };

  const salvarEdicaoOportunidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oportunidadeEmEdicao) return;

    try {
      const valorNumero = formEdicao.valor !== "" ? Number(formEdicao.valor) : undefined;
      const probabilidadeNumero =
        formEdicao.probabilidade !== ""
          ? Math.max(0, Math.min(100, Number(formEdicao.probabilidade)))
          : undefined;

      const payload: any = {
        titulo: formEdicao.titulo,
        descricao: formEdicao.descricao,
      };

      if (valorNumero !== undefined && !Number.isNaN(valorNumero)) {
        payload.valor = valorNumero;
      }

      if (formEdicao.dataPrevisao) {
        payload.dataPrevisao =
          formEdicao.dataPrevisao.length === 10
            ? `${formEdicao.dataPrevisao}T00:00:00`
            : formEdicao.dataPrevisao;
      } else {
        payload.dataPrevisao = null;
      }

      if (probabilidadeNumero !== undefined && !Number.isNaN(probabilidadeNumero)) {
        payload.probabilidade = probabilidadeNumero;
      }

      await atualizarOportunidade(oportunidadeEmEdicao.id, payload);

      if (criarTarefaEdicao && taskDataHoraEdicao) {
        const tituloTarefa =
          taskTituloEdicao.trim() || `Follow-up: ${formEdicao.titulo || oportunidadeEmEdicao.titulo}`;
        await criarTarefa({
          titulo: tituloTarefa,
          descricao: formEdicao.descricao || oportunidadeEmEdicao?.descricao || "",
          status: "PENDENTE",
          prioridade: "MEDIA",
          dataVencimento: taskDataHoraEdicao,
          clienteId: oportunidadeEmEdicao?.cliente?.id || undefined,
          oportunidadeId: oportunidadeEmEdicao.id,
        });
      }
      await carregarDados();

      toast({
        title: "Oportunidade atualizada",
        description: criarTarefaEdicao
          ? "Oportunidade atualizada e tarefa agendada."
          : "As informações da oportunidade foram salvas com sucesso.",
      });

      setModalEditarAberto(false);
      setOportunidadeEmEdicao(null);
    } catch (error) {
      console.error("Erro ao atualizar oportunidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações da oportunidade.",
        variant: "destructive",
      });
    }
  };

  const aoTerminarArrasto = async (resultado: DropResult) => {
    const { destination, source, draggableId } = resultado;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      const origemLista = oportunidades[source.droppableId] || [];
      const oportunidadeArrastada = origemLista.find((op) => op.id === draggableId);
      if (!oportunidadeArrastada) return;

      const novasOportunidades = structuredClone(oportunidades);

      // remover da coluna origem
      novasOportunidades[source.droppableId] = (novasOportunidades[source.droppableId] || []).filter(
        (op) => op.id !== draggableId
      );

      // inserir na coluna destino na posição
      const destinoLista = [...(novasOportunidades[destination.droppableId] || [])];
      const oportunidadeAtualizada: Oportunidade = {
        ...oportunidadeArrastada,
        status: destination.droppableId,
      };
      destinoLista.splice(destination.index, 0, oportunidadeAtualizada);
      novasOportunidades[destination.droppableId] = destinoLista;

      setOportunidades(novasOportunidades);
      setTodasOportunidades((anteriores) =>
        anteriores.map((op) =>
          op.id === draggableId ? { ...op, status: destination.droppableId } : op
        )
      );

      if (draggableId !== "exemplo-1") {
        await atualizarOportunidade(draggableId, { status: destination.droppableId });
      }

      const etapaDestino = etapasComerciais.find((e) => e.id === destination.droppableId);
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

  const salvarNovaColunaPipeline = async () => {
    const nome = nomeNovaColuna.trim();
    if (!nome) {
      setModalNovaColunaAberto(false);
      return;
    }

    const slugBase = nome.toUpperCase().replace(/\s+/g, "_");
    const slug = slugBase || `ETAPA_${Date.now()}`;
    const etapasAtuais = etapasPersonalizadas[pipelineAtivo] || [];

    if (
      etapasAtuais.some((etapa) => etapa.id === slug) ||
      etapasComerciais.some((etapa) => etapa.id === slug)
    ) {
      toast({
        title: "Coluna ja existe",
        description: "Escolha outro nome para criar uma nova coluna.",
        variant: "destructive",
      });
      return;
    }

    const configIcone = ICONES_ETAPAS[iconeNovaColuna] || ICONES_ETAPAS["user"];
    const novasEtapasPipeline = [
      ...etapasAtuais,
      { id: slug, nome, cor: configIcone.cor, icone: iconeNovaColuna },
    ];

    const etapasOrdenadas = obterEtapasParaPipeline(pipelineAtivo);
    const ordemAtual = ordemEtapas[pipelineAtivo] || etapasOrdenadas.map((e) => e.id);

    let novaOrdem: string[] = [];
    if (posicaoNovaColuna === "end") {
      novaOrdem = [...ordemAtual, slug];
    } else if (posicaoNovaColuna.startsWith("before:")) {
      const alvoId = posicaoNovaColuna.replace("before:", "");
      let inserido = false;
      novaOrdem = [];
      ordemAtual.forEach((id) => {
        if (id === alvoId && !inserido) {
          novaOrdem.push(slug);
          inserido = true;
        }
        novaOrdem.push(id);
      });
      if (!inserido) {
        novaOrdem.push(slug);
      }
    } else {
      novaOrdem = [...ordemAtual, slug];
    }

    const novaOrdemPorPipeline: Record<string, string[]> = {
      ...ordemEtapas,
      [pipelineAtivo]: novaOrdem,
    };

    const novasEtapasPorPipeline = {
      ...etapasPersonalizadas,
      [pipelineAtivo]: novasEtapasPipeline,
    };

    setOrdemEtapas(novaOrdemPorPipeline);
    setEtapasPersonalizadas(novasEtapasPorPipeline);

    try {
      setSalvandoColuna(true);
      await salvarConfigKanban(pipelineAtivo, {
        etapasPersonalizadas: novasEtapasPipeline,
        ordemEtapas: novaOrdem,
      });

      toast({
        title: "Coluna criada",
        description: "A nova etapa foi salva no pipeline.",
      });

      setModalNovaColunaAberto(false);
      setNomeNovaColuna("");
      setIconeNovaColuna("user");
      setPosicaoNovaColuna("end");
    } catch (error) {
      console.error("Erro ao salvar coluna personalizada:", error);
      await carregarConfigKanban();
      toast({
        title: "Erro",
        description: "Nao foi possivel salvar a nova coluna no banco de dados.",
        variant: "destructive",
      });
    } finally {
      setSalvandoColuna(false);
    }
  };

  const confirmarExclusaoOportunidade = async () => {
    if (!oportunidadeParaExcluir || oportunidadeParaExcluir === "exemplo-1") {
      setModalExcluirAberto(false);
      setOportunidadeParaExcluir(null);
      return;
    }

    try {
      await excluirOportunidade(oportunidadeParaExcluir);
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
    } finally {
      setModalExcluirAberto(false);
      setOportunidadeParaExcluir(null);
    }
  };

  const confirmarExclusaoColuna = async () => {
    if (!colunaParaExcluir) {
      setModalExcluirColunaAberto(false);
      return;
    }

    const colunaId = colunaParaExcluir.id;

    try {
      const etapasAtuais = etapasPersonalizadas[pipelineAtivo] || [];
      const filtradas = etapasAtuais.filter((etapa) => etapa.id !== colunaId);
      const ordemAtual = ordemEtapas[pipelineAtivo] || [];
      const novaOrdem = ordemAtual.filter((id) => id !== colunaId);

      setEtapasPersonalizadas((anteriores) => ({
        ...anteriores,
        [pipelineAtivo]: filtradas,
      }));

      setOrdemEtapas((anteriores) => ({
        ...anteriores,
        [pipelineAtivo]: novaOrdem,
      }));

      await salvarConfigKanban(pipelineAtivo, {
        etapasPersonalizadas: filtradas,
        ordemEtapas: novaOrdem,
      });

      const afetadas = todasOportunidades.filter(
        (op) => (op.pipeline || "principal") === pipelineAtivo && op.status === colunaId
      );

      if (afetadas.length > 0) {
        await Promise.all(
          afetadas.map((op) =>
            atualizarOportunidade(op.id, {
              status: "LEAD",
            })
          )
        );
      }

      await carregarDados();

      toast({
        title: "Coluna removida",
        description: "A coluna foi excluída e as oportunidades foram movidas para Lead Recebido.",
      });
    } catch (error) {
      console.error("Erro ao excluir coluna personalizada:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a coluna personalizada.",
        variant: "destructive",
      });
    } finally {
      setModalExcluirColunaAberto(false);
      setColunaParaExcluir(null);
    }
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

  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho compacto do pipeline */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-border/50 bg-muted/20 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={pipelineAtivo}
            onChange={(e) => {
              const novoPipeline = e.target.value;
              setPipelineAtivo(novoPipeline);
              salvarPipelineAtivoKanban(novoPipeline).catch((error) => {
                console.error("Erro ao salvar pipeline ativo do usuario:", error);
              });
            }}
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
              setNomeNovoPipeline("");
              setModalNovoPipelineAberto(true);
            }}
            className="text-xs whitespace-nowrap"
            data-testid="button-new-pipeline"
          >
            <Plus className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Pipeline</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNomeNovaColuna("");
              setModalNovaColunaAberto(true);
            }}
            className="w-full sm:w-auto text-xs sm:text-sm"
            data-testid="button-new-column"
          >
            <Plus className="w-3 h-3 mr-1" />
            Nova Coluna
          </Button>
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
      </div>

      <div className="flex-1 overflow-x-auto" ref={containerRef}>
        <DragDropContext onDragEnd={aoTerminarArrasto}>
          <div className="flex gap-3 p-3 min-w-max">
            {obterEtapasParaPipeline(pipelineAtivo).map((etapa) => {
              const items = oportunidades[etapa.id] || [];
              const IconeEtapa = etapa.icone;
              const etapaPadrao = etapasComerciais.some((e) => e.id === etapa.id);

              const totalColuna = items.reduce((total, item) => total + (item.valor || 0), 0);
              const mediaProb =
                items.length > 0
                  ? Math.round(items.reduce((total, item) => total + (item.probabilidade || 0), 0) / items.length)
                  : 0;

              return (
                <Droppable key={etapa.id} droppableId={etapa.id}>
                  {(provided) => (
                    <div
                      className="transition-all duration-200"
                      style={{ width: `${colWidth}px` }}
                    >
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`p-1.5 rounded-lg ${etapa.cor} bg-opacity-10 flex-shrink-0`}>
                              <IconeEtapa className={`h-3.5 w-3.5 ${etapa.cor.replace("bg-", "text-")}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-foreground text-sm truncate">{etapa.nome}</h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {totalColuna.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {items.length}
                              </Badge>
                              {items.length > 0 && <div className="text-xs text-muted-foreground">{mediaProb}%</div>}
                            </div>
                            {!etapaPadrao && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => {
                                  setColunaParaExcluir({ id: etapa.id, nome: etapa.nome });
                                  setModalExcluirColunaAberto(true);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-3 min-h-[200px] h-[calc(100vh-160px)] overflow-y-auto p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 relative"
                      >
                        {items.map((oportunidade, index) => (
                          <Draggable key={oportunidade.id} draggableId={oportunidade.id} index={index}>
                            {(prov, snap) => {
                              const Conteudo = (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className={`${
                                    snap.isDragging
                                      ? "cursor-grabbing opacity-90 z-[9999]"
                                      : "cursor-grab hover:shadow-md"
                                  } transition-all duration-200 ease-out`}
                                  style={{
                                    ...prov.draggableProps.style, // mantém transform/top/left calculados pela lib
                                    ...(snap.isDragging && {
                                      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                                      borderRadius: "12px",
                                      backgroundColor: "rgba(255,255,255,0.95)",
                                      border: "2px solid #3b82f6",
                                    }),
                                  }}
                                  data-testid={`card-opportunity-${oportunidade.id}`}
                                >
                                  <Card
                                    className={`${
                                      snap.isDragging
                                        ? "border-blue-400 border-2 pointer-events-none bg-white dark:bg-gray-800 shadow-lg"
                                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
                                    }`}
                                  >
                                    <CardHeader className="pb-1 px-3 pt-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-sm font-medium truncate flex-1 min-w-0">
                                          {oportunidade.titulo}
                                        </CardTitle>
                                        {oportunidade.id !== "exemplo-1" && (
                                          <div className="flex gap-0.5 flex-shrink-0 pointer-events-auto">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-5 w-5"
                                              onMouseDown={(e) => e.stopPropagation()}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                abrirModalEdicao(oportunidade);
                                              }}
                                              data-testid={`button-edit-opportunity-${oportunidade.id}`}
                                            >
                                              <Edit2 className="w-2.5 h-2.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-5 w-5"
                                              onMouseDown={(e) => e.stopPropagation()}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setOportunidadeParaExcluir(oportunidade.id);
                                                setModalExcluirAberto(true);
                                              }}
                                              data-testid={`button-delete-opportunity-${oportunidade.id}`}
                                            >
                                              <Trash2 className="w-2.5 h-2.5 text-destructive" />
                                            </Button>
                                          </div>
                                        )}
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
                                              ? oportunidade.valor.toLocaleString("pt-BR", {
                                                  style: "currency",
                                                  currency: "BRL",
                                                })
                                              : "R$ 0,00"}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <User className="w-3 h-3 flex-shrink-0" />
                                          <span className="truncate">{oportunidade.cliente.nome}</span>
                                        </div>

                                        {oportunidade.dataPrevisao && (
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">
                                              {new Date(oportunidade.dataPrevisao).toLocaleDateString("pt-BR")}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="mt-2 pt-2 border-t border-border/50">
                                        <div className="flex items-center justify-between gap-2">
                                          <Badge variant="outline" className="text-xs truncate max-w-[60%]">
                                            {oportunidade.usuario.nome}
                                          </Badge>
                                          {!!oportunidade.probabilidade && (
                                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                                              {oportunidade.probabilidade}%
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              );
                              return <PortalArrasto ativo={snap.isDragging}>{Conteudo}</PortalArrasto>;
                            }}
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
        pipelineId={pipelineAtivo}
      />

      <Dialog
        open={modalEditarAberto}
        onOpenChange={(open) => {
          setModalEditarAberto(open);
          if (!open) {
            setOportunidadeEmEdicao(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar oportunidade</DialogTitle>
            <DialogDescription>
              Atualize as informações da oportunidade selecionada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={salvarEdicaoOportunidade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="editar-titulo">Título</Label>
              <Input
                id="editar-titulo"
                value={formEdicao.titulo}
                onChange={(e) => setFormEdicao({ ...formEdicao, titulo: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="editar-valor">Valor (R$)</Label>
              <Input
                id="editar-valor"
                type="number"
                step="0.01"
                value={formEdicao.valor}
                onChange={(e) => setFormEdicao({ ...formEdicao, valor: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="editar-probabilidade">Probabilidade (%)</Label>
              <Input
                id="editar-probabilidade"
                type="number"
                min={0}
                max={100}
                value={formEdicao.probabilidade}
                onChange={(e) => setFormEdicao({ ...formEdicao, probabilidade: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="editar-data-previsao">Data de fechamento esperada</Label>
              <Input
                id="editar-data-previsao"
                type="date"
                value={formEdicao.dataPrevisao}
                onChange={(e) => setFormEdicao({ ...formEdicao, dataPrevisao: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="editar-descricao">Descrição</Label>
              <Textarea
                id="editar-descricao"
                rows={8}
                value={formEdicao.descricao}
                onChange={(e) => setFormEdicao({ ...formEdicao, descricao: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="editar-criar-tarefa"
                  checked={criarTarefaEdicao}
                  onCheckedChange={(checked) => setCriarTarefaEdicao(!!checked)}
                />
                <Label htmlFor="editar-criar-tarefa">Criar tarefa</Label>
              </div>
              {criarTarefaEdicao && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="editar-taskDataHora">Para quando</Label>
                    <Input
                      id="editar-taskDataHora"
                      type="datetime-local"
                      value={taskDataHoraEdicao}
                      onChange={(e) => setTaskDataHoraEdicao(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editar-taskTitulo">Título da tarefa</Label>
                    <Input
                      id="editar-taskTitulo"
                      value={taskTituloEdicao}
                      placeholder={`Follow-up: ${formEdicao.titulo || oportunidadeEmEdicao?.titulo || "Oportunidade"}`}
                      onChange={(e) => setTaskTituloEdicao(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalEditarAberto(false);
                  setOportunidadeEmEdicao(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={modalExcluirAberto} onOpenChange={setModalExcluirAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir oportunidade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta oportunidade? Esta ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalExcluirAberto(false);
                setOportunidadeParaExcluir(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmarExclusaoOportunidade}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalNovoPipelineAberto} onOpenChange={setModalNovoPipelineAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo pipeline</DialogTitle>
            <DialogDescription>
              Informe o nome do novo pipeline para organizar suas oportunidades.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={nomeNovoPipeline}
              onChange={(e) => setNomeNovoPipeline(e.target.value)}
              placeholder="Nome do pipeline"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalNovoPipelineAberto(false);
                  setNomeNovoPipeline("");
                }}
                disabled={salvandoPipeline}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={criarNovoPipeline}
                disabled={salvandoPipeline}
              >
                {salvandoPipeline ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalNovaColunaAberto} onOpenChange={setModalNovaColunaAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova coluna</DialogTitle>
            <DialogDescription>Crie uma nova etapa personalizada para o pipeline atual.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={nomeNovaColuna}
              onChange={(e) => setNomeNovaColuna(e.target.value)}
              placeholder="Nome da nova coluna"
            />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Ícone</p>
              <Select value={iconeNovaColuna} onValueChange={setIconeNovaColuna}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ICONES_ETAPAS).map(([key, config]) => {
                    const IconComp = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1 rounded-md ${config.cor} bg-opacity-10 flex items-center justify-center`}
                          >
                            <IconComp className={`w-3 h-3 ${config.cor.replace("bg-", "text-")}`} />
                          </span>
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Posição</p>
              <Select value={posicaoNovaColuna} onValueChange={setPosicaoNovaColuna}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a posição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end">Ao final do pipeline</SelectItem>
                  {obterEtapasParaPipeline(pipelineAtivo).map((etapa) => (
                    <SelectItem key={etapa.id} value={`before:${etapa.id}`}>
                      Antes de "{etapa.nome}"
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalNovaColunaAberto(false);
                  setNomeNovaColuna("");
                  setIconeNovaColuna("user");
                  setPosicaoNovaColuna("end");
                }}
                disabled={salvandoColuna}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={salvarNovaColunaPipeline} disabled={salvandoColuna}>
                {salvandoColuna ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalExcluirColunaAberto} onOpenChange={setModalExcluirColunaAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir coluna</DialogTitle>
            <DialogDescription>
              {colunaParaExcluir
                ? `Tem certeza que deseja excluir a coluna "${colunaParaExcluir.nome}"? Todas as oportunidades dessa coluna serão movidas para "Lead Recebido".`
                : "Tem certeza que deseja excluir esta coluna personalizada?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalExcluirColunaAberto(false);
                setColunaParaExcluir(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmarExclusaoColuna}>
              Excluir coluna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
