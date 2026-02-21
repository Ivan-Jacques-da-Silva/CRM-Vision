import express, { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { checkTrialStatus, requireActiveTrial } from '../middleware/trial';

const router = express.Router();
const prisma = new PrismaClient();

// Autenticação + trial
router.use(authMiddleware);
router.use(checkTrialStatus);

// GET /api/tarefas - Tarefas visíveis para todos usuários da mesma empresa
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q } = req.query as { q?: string };

    const baseWhere: Prisma.TarefaWhereInput = req.user?.empresaId
      ? { usuario: { empresaId: req.user.empresaId } }
      : { usuarioId: req.userId! };

    const searchWhere: Prisma.TarefaWhereInput =
      q && q.trim()
        ? {
            OR: [
              { titulo: { contains: q, mode: 'insensitive' } },
              { descricao: { contains: q, mode: 'insensitive' } }
            ]
          }
        : {};

    const tarefas = await prisma.tarefa.findMany({
      where: {
        ...baseWhere,
        ...searchWhere
      },
      include: {
        cliente: {
          include: {
            empresa: { select: { nome: true } },
          },
        },
        oportunidade: { select: { titulo: true } },
        usuario: { select: { nome: true } },
      },
      orderBy: { dataVencimento: 'asc' },
    });

    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/tarefas
router.post('/', requireActiveTrial, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      titulo,
      descricao,
      status,
      prioridade,
      dataVencimento,
      clienteId,
      oportunidadeId,
      usuarioId,
    } = req.body as {
      titulo: string;
      descricao?: string;
      status?: string;
      prioridade?: string;
      dataVencimento: string | Date;
      clienteId?: string | null;
      oportunidadeId?: string | null;
      usuarioId?: string;
    };

    if (!titulo || !dataVencimento) {
      return res.status(400).json({ message: 'Título e data de vencimento são obrigatórios' });
    }

    if (clienteId && req.user?.empresaId) {
      const cliente = await prisma.cliente.findFirst({
        where: {
          id: clienteId,
          empresaId: req.user.empresaId,
        },
      });

      if (!cliente) {
        return res
          .status(404)
          .json({ message: 'Cliente não encontrado ou não pertence à sua empresa' });
      }
    }

    if (oportunidadeId && req.user?.empresaId) {
      const oportunidade = await prisma.oportunidade.findFirst({
        where: {
          id: oportunidadeId,
          empresaId: req.user.empresaId,
        },
      });

      if (!oportunidade) {
        return res
          .status(404)
          .json({ message: 'Oportunidade não encontrada ou não pertence à sua empresa' });
      }
    }

    let usuarioResponsavelId = req.userId!;

    if (usuarioId && req.user?.empresaId) {
      const usuarioResponsavel = await prisma.usuario.findFirst({
        where: {
          id: usuarioId,
          empresaId: req.user.empresaId,
          isActive: true,
        },
      });

      if (!usuarioResponsavel) {
        return res
          .status(400)
          .json({ message: 'Usuário responsável não encontrado ou não pertence à sua empresa' });
      }

      usuarioResponsavelId = usuarioResponsavel.id;
    }

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo,
        descricao,
        status: status ?? 'PENDENTE',
        prioridade: prioridade ?? 'MEDIA',
        dataVencimento: new Date(dataVencimento),
        clienteId: clienteId ?? null,
        oportunidadeId: oportunidadeId ?? null,
        usuarioId: usuarioResponsavelId,
      },
      include: {
        cliente: {
          include: {
            empresa: { select: { nome: true } },
          },
        },
        oportunidade: { select: { titulo: true } },
        usuario: { select: { nome: true } },
      },
    });

    res.status(201).json({ tarefa });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/tarefas/:id
router.put('/:id', requireActiveTrial, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Se o ID da sua tabela for Int, use Number(id)
    const filtroId = { id }; // ou { id: Number(id) }

    const whereClause: Prisma.TarefaWhereInput = req.user?.empresaId
      ? { ...filtroId, usuario: { empresaId: req.user.empresaId } }
      : { ...filtroId, usuarioId: req.userId! };

    const tarefa = await prisma.tarefa.findFirst({
      where: whereClause,
    });

    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    // Permitir apenas campos seguros
    const { titulo, descricao, status, prioridade, dataVencimento, clienteId, oportunidadeId } = req.body as {
      titulo?: string;
      descricao?: string;
      status?: string;
      prioridade?: string;
      dataVencimento?: string | Date;
      clienteId?: string | null;
      oportunidadeId?: string | null;
    };

    const tarefaAtualizada = await prisma.tarefa.update({
      where: filtroId,
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(descricao !== undefined && { descricao }),
        ...(status !== undefined && { status }),
        ...(prioridade !== undefined && { prioridade }),
        ...(dataVencimento !== undefined && { dataVencimento: new Date(dataVencimento) }),
        ...(clienteId !== undefined && { clienteId }),
        ...(oportunidadeId !== undefined && { oportunidadeId }),
      },
      include: {
        cliente: {
          include: {
            empresa: { select: { nome: true } },
          },
        },
        oportunidade: { select: { titulo: true } },
      },
    });

    res.json({ tarefa: tarefaAtualizada });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/tarefas/:id
router.delete('/:id', requireActiveTrial, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const filtroId = { id }; // ou { id: Number(id) }

    const whereClause: Prisma.TarefaWhereInput = req.user?.empresaId
      ? { ...filtroId, usuario: { empresaId: req.user.empresaId } }
      : { ...filtroId, usuarioId: req.userId! };

    const tarefa = await prisma.tarefa.findFirst({
      where: whereClause,
    });

    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    await prisma.tarefa.delete({ where: filtroId });

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
