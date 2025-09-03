import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/tarefas - Listar tarefas (filtrado por empresa)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    // Buscar apenas tarefas de clientes da mesma empresa
    const whereClause: any = {
      usuarioId: req.userId!
    };

    if (req.user?.empresaId) {
      whereClause.OR = [
        { cliente: { empresaId: req.user.empresaId } },
        { cliente: null } // Tarefas sem cliente específico
      ];
    }

    const tarefas = await prisma.tarefa.findMany({
      where: whereClause,
      include: {
        cliente: { 
          select: { nome: true, empresaId: true },
          include: { empresa: { select: { nome: true } } }
        },
        oportunidade: { select: { titulo: true } },
        usuario: { select: { nome: true } }
      },
      orderBy: { dataVencimento: 'asc' }
    });

    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar tarefa
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const {
      titulo,
      descricao,
      status,
      prioridade,
      dataVencimento,
      clienteId,
      oportunidadeId
    } = req.body;

    if (!titulo || !dataVencimento) {
      return res.status(400).json({ message: 'Título e data de vencimento são obrigatórios' });
    }

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo,
        descricao,
        status: status || 'PENDENTE',
        prioridade: prioridade || 'MEDIA',
        dataVencimento: new Date(dataVencimento),
        clienteId,
        oportunidadeId,
        usuarioId: req.userId!
      },
      include: {
        cliente: true,
        oportunidade: true
      }
    });

    res.status(201).json({ tarefa });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar tarefa
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id,
        usuarioId: req.userId!
      }
    });

    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    const tarefaAtualizada = await prisma.tarefa.update({
      where: { id },
      data: updates,
      include: {
        cliente: true,
        oportunidade: true
      }
    });

    res.json({ tarefa: tarefaAtualizada });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar tarefa
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id,
        usuarioId: req.userId!
      }
    });

    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    await prisma.tarefa.delete({
      where: { id }
    });

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;