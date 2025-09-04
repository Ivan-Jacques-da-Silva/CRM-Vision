import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { checkTrialStatus, requireActiveTrial } from '../middleware/trial';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação e verificação de trial a todas as rotas
router.use(authMiddleware);
router.use(checkTrialStatus);

// GET /api/clientes - Listar clientes (filtrado por empresa)
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const whereClause: any = {
      usuarioId: req.userId!
    };

    // Se usuário tem empresa, filtrar apenas clientes da mesma empresa
    if (req.user?.empresaId) {
      whereClause.empresaId = req.user.empresaId;
    }

    const clientes = await prisma.cliente.findMany({
      where: whereClause,
      include: {
        usuario: { select: { nome: true } },
        empresa: { select: { nome: true } },
        _count: { select: { oportunidades: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/clientes - Criar cliente (com empresa do usuário)
router.post('/', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    const cliente = await prisma.cliente.create({
      data: {
        ...req.body,
        usuarioId: req.userId!,
        empresaId: req.user?.empresaId || null // Atribuir empresa automaticamente
      },
      include: {
        usuario: { select: { nome: true } },
        empresa: { select: { nome: true } }
      }
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar cliente por ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findFirst({
      where: {
        id,
        usuarioId: req.userId!,
        empresaId: req.user?.empresaId // Adiciona filtro de empresa
      }
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json({ cliente });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar cliente (requer trial ativo)
router.put('/:id', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const cliente = await prisma.cliente.findFirst({
      where: {
        id,
        usuarioId: req.userId!,
        empresaId: req.user?.empresaId // Adiciona filtro de empresa
      }
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: updates
    });

    res.json({ cliente: clienteAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar cliente (requer trial ativo)
router.delete('/:id', requireActiveTrial, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findFirst({
      where: {
        id,
        usuarioId: req.userId!,
        empresaId: req.user?.empresaId // Adiciona filtro de empresa
      }
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    await prisma.cliente.delete({
      where: { id }
    });

    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;