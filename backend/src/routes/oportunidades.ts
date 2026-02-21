import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { checkTrialStatus, requireActiveTrial } from '../middleware/trial';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação e verificação de trial a todas as rotas
router.use(authMiddleware);
router.use(checkTrialStatus);

// GET /api/oportunidades - Listar oportunidades (visíveis para todos usuários da mesma empresa)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { q } = req.query as { q?: string };

    const baseWhere: any = req.user?.empresaId
      ? { empresaId: req.user.empresaId }
      : { usuarioId: req.userId! };

    const searchWhere =
      q && q.trim()
        ? {
            OR: [
              { titulo: { contains: q, mode: 'insensitive' } },
              { descricao: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {};

    const oportunidades = await prisma.oportunidade.findMany({
      where: {
        ...baseWhere,
        ...searchWhere,
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            nomeEmpresa: true,
            empresa: { 
              select: { nome: true } 
            }
          }
        },
        usuario: { 
          select: { 
            id: true,
            nome: true 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(oportunidades);
  } catch (error) {
    console.error('Erro ao buscar oportunidades:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ==================== CONFIGURAÇÃO DE KANBAN / PIPELINES ====================

// Listar pipelines do Kanban (com configuração básica)
router.get('/pipeline-ativo', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId! },
      select: {
        empresaId: true,
        kanbanPipelineAtivo: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario nao encontrado' });
    }

    let pipelineAtivo = usuario.kanbanPipelineAtivo || 'principal';

    if (usuario.empresaId) {
      const existe = await prisma.pipelineKanban.findFirst({
        where: {
          empresaId: usuario.empresaId,
          slug: pipelineAtivo,
        },
        select: { id: true },
      });

      if (!existe) {
        pipelineAtivo = 'principal';
        await prisma.usuario.update({
          where: { id: req.userId! },
          data: { kanbanPipelineAtivo: pipelineAtivo },
        });
      }
    }

    return res.json({ pipelineAtivo });
  } catch (error) {
    console.error('Erro ao buscar pipeline ativo do usuario:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.put('/pipeline-ativo', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    const { pipelineAtivo } = req.body;

    if (!pipelineAtivo || typeof pipelineAtivo !== 'string') {
      return res.status(400).json({ message: 'pipelineAtivo e obrigatorio' });
    }

    if (!req.user?.empresaId) {
      return res.status(400).json({ message: 'Usuario nao possui empresa vinculada' });
    }

    let pipeline = await prisma.pipelineKanban.findFirst({
      where: {
        empresaId: req.user.empresaId,
        slug: pipelineAtivo,
      },
    });

    if (!pipeline && pipelineAtivo === 'principal') {
      pipeline = await prisma.pipelineKanban.create({
        data: {
          empresaId: req.user.empresaId,
          slug: 'principal',
          nome: 'Pipeline Principal',
        },
      });
    }

    if (!pipeline) {
      return res.status(404).json({ message: 'Pipeline nao encontrado para esta empresa' });
    }

    await prisma.usuario.update({
      where: { id: req.userId! },
      data: { kanbanPipelineAtivo: pipelineAtivo },
    });

    return res.json({ pipelineAtivo });
  } catch (error) {
    console.error('Erro ao atualizar pipeline ativo do usuario:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.get('/pipelines', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.empresaId) {
      return res.status(400).json({ message: 'Usuário não possui empresa vinculada' });
    }

    const empresaId = req.user.empresaId;

    // Buscar pipelines já configurados
    let pipelines = await prisma.pipelineKanban.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'asc' },
    });

    // Garantir pelo menos o pipeline principal
    if (pipelines.length === 0) {
      const principal = await prisma.pipelineKanban.create({
        data: {
          empresaId,
          slug: 'principal',
          nome: 'Pipeline Principal',
        },
      });
      pipelines = [principal];
    }

    res.json(pipelines);
  } catch (error) {
    console.error('Erro ao buscar pipelines do Kanban:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar novo pipeline do Kanban
router.post('/pipelines', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.empresaId) {
      return res.status(400).json({ message: 'Usuário não possui empresa vinculada' });
    }

    const { nome } = req.body;

    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ message: 'Nome do pipeline é obrigatório' });
    }

    const empresaId = req.user.empresaId;
    const baseSlug = nome.toLowerCase().trim().replace(/\s+/g, '-');
    const slug = baseSlug || `pipeline-${Date.now()}`;

    // Verificar duplicidade por empresa
    const existente = await prisma.pipelineKanban.findFirst({
      where: {
        empresaId,
        slug,
      },
    });

    if (existente) {
      return res.status(400).json({ message: 'Já existe um pipeline com este identificador' });
    }

    const pipeline = await prisma.pipelineKanban.create({
      data: {
        empresaId,
        slug,
        nome: nome.trim(),
      },
    });

    res.status(201).json(pipeline);
  } catch (error) {
    console.error('Erro ao criar pipeline do Kanban:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar configuração (etapas personalizadas e ordem) de um pipeline
router.put('/pipelines/:slug/config', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.empresaId) {
      return res.status(400).json({ message: 'Usuário não possui empresa vinculada' });
    }

    const { slug } = req.params;
    const { etapasPersonalizadas, ordemEtapas, nome } = req.body;

    const empresaId = req.user.empresaId;

    // Garantir existência do pipeline
    let pipeline = await prisma.pipelineKanban.findFirst({
      where: {
        empresaId,
        slug,
      },
    });

    if (!pipeline) {
      pipeline = await prisma.pipelineKanban.create({
        data: {
          empresaId,
          slug,
          nome: nome && typeof nome === 'string'
            ? nome.trim()
            : slug === 'principal'
              ? 'Pipeline Principal'
              : slug
                  .split('-')
                  .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
                  .join(' '),
          etapasPersonalizadas: etapasPersonalizadas ?? undefined,
          ordemEtapas: ordemEtapas ?? undefined,
        },
      });
    } else {
      pipeline = await prisma.pipelineKanban.update({
        where: { id: pipeline.id },
        data: {
          nome:
            nome && typeof nome === 'string'
              ? nome.trim()
              : pipeline.nome,
          etapasPersonalizadas: etapasPersonalizadas ?? pipeline.etapasPersonalizadas,
          ordemEtapas: ordemEtapas ?? pipeline.ordemEtapas,
        },
      });
    }

    res.json(pipeline);
  } catch (error) {
    console.error('Erro ao atualizar configuração do pipeline do Kanban:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar oportunidade (requer trial ativo)
router.post('/', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      titulo,
      descricao,
      valor,
      status,
      prioridade,
      dataPrevisao,
      clienteId,
      pipeline,
    } = req.body;

    if (!titulo || !clienteId) {
      return res.status(400).json({ message: 'Título e cliente são obrigatórios' });
    }

    const clienteWhere: any = req.user?.empresaId
      ? { id: clienteId, empresaId: req.user.empresaId }
      : { id: clienteId, usuarioId: req.userId! };

    const cliente = await prisma.cliente.findFirst({
      where: clienteWhere
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado ou não pertence à sua empresa' });
    }

    const oportunidade = await prisma.oportunidade.create({
      data: {
        titulo,
        descricao,
        valor: valor ? parseFloat(valor) : null,
        status: status || 'LEAD',
        prioridade: prioridade || 'MEDIA',
        dataPrevisao: dataPrevisao ? new Date(dataPrevisao) : null,
        pipeline: pipeline || 'principal',
        clienteId,
        usuarioId: req.userId!,
        empresaId: req.user?.empresaId
      },
      include: {
        cliente: {
          include: { 
            empresa: { 
              select: { nome: true } 
            } 
          }
        },
        usuario: { 
          select: { nome: true } 
        }
      }
    });

    res.status(201).json({ oportunidade });
  } catch (error) {
    console.error('Erro ao criar oportunidade:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar oportunidade (requer trial ativo)
router.put('/:id', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates: any = { ...req.body };

    const whereClause: any = req.user?.empresaId
      ? { id, empresaId: req.user.empresaId }
      : { id, usuarioId: req.userId! };

    const oportunidade = await prisma.oportunidade.findFirst({
      where: whereClause
    });

    if (!oportunidade) {
      return res.status(404).json({ message: 'Oportunidade não encontrada ou não pertence à sua empresa' });
    }

    // Verificar se status mudou para GANHO para adicionar pontos
    const statusMudouParaGanho = updates.status === 'GANHO' && oportunidade.status !== 'GANHO';

    // Remover empresaId e usuarioId do corpo da requisição para evitar alterações indevidas
    delete updates.empresaId;
    delete updates.usuarioId;
    delete updates.clienteId; // Cliente não deve ser alterado diretamente aqui

    if (Object.prototype.hasOwnProperty.call(updates, 'dataPrevisao')) {
      if (updates.dataPrevisao) {
        updates.dataPrevisao = new Date(updates.dataPrevisao);
      } else {
        updates.dataPrevisao = null;
      }
    }

    const oportunidadeAtualizada = await prisma.oportunidade.update({
      where: { id },
      data: updates,
      include: {
        cliente: {
          include: { 
            empresa: { 
              select: { nome: true } 
            } 
          }
        },
        usuario: { 
          select: { nome: true } 
        }
      }
    });

    res.json({ oportunidade: oportunidadeAtualizada });
  } catch (error) {
    console.error('Erro ao atualizar oportunidade:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar oportunidade (requer trial ativo)
router.delete('/:id', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const whereClause: any = req.user?.empresaId
      ? { id, empresaId: req.user.empresaId }
      : { id, usuarioId: req.userId! };

    const oportunidade = await prisma.oportunidade.findFirst({
      where: whereClause
    });

    if (!oportunidade) {
      return res.status(404).json({ message: 'Oportunidade não encontrada ou não pertence à sua empresa' });
    }

    await prisma.oportunidade.delete({
      where: { id }
    });

    res.json({ message: 'Oportunidade deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar oportunidade:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
