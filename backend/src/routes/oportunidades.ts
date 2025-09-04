import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { checkTrialStatus, requireActiveTrial } from '../middleware/trial';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação e verificação de trial a todas as rotas
router.use(authMiddleware);
router.use(checkTrialStatus);

// GET /api/oportunidades - Listar oportunidades (filtrado por empresa)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    // Buscar apenas oportunidades de clientes da mesma empresa
    const whereClause: any = {
      usuarioId: req.userId!
    };

    if (req.user?.empresaId) {
      whereClause.cliente = {
        empresaId: req.user.empresaId
      };
    }

    const oportunidades = await prisma.oportunidade.findMany({
      where: whereClause,
      include: {
        cliente: {
          select: { nome: true, email: true, empresaId: true },
          include: { empresa: { select: { nome: true } } }
        },
        usuario: { select: { nome: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(oportunidades);
  } catch (error) {
    console.error('Erro ao buscar oportunidades:', error);
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
      clienteId
    } = req.body;

    if (!titulo || !clienteId) {
      return res.status(400).json({ message: 'Título e cliente são obrigatórios' });
    }

    // Verificar se o cliente pertence ao usuário e à empresa do usuário
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: clienteId,
        usuarioId: req.userId!,
        empresaId: req.user?.empresaId // Adicionado filtro por empresa
      }
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
        clienteId,
        usuarioId: req.userId!,
        empresaId: req.user?.empresaId // Adicionado empresaId à oportunidade
      },
      include: {
        cliente: {
          select: { nome: true, email: true, empresaId: true },
          include: { empresa: { select: { nome: true } } }
        },
        usuario: { select: { nome: true } }
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
    const updates = req.body;

    // Verificar se a oportunidade pertence ao usuário e à empresa do usuário
    const oportunidade = await prisma.oportunidade.findFirst({
      where: {
        id,
        usuarioId: req.userId!,
        empresaId: req.user?.empresaId // Adicionado filtro por empresa
      }
    });

    if (!oportunidade) {
      return res.status(404).json({ message: 'Oportunidade não encontrada ou não pertence à sua empresa' });
    }

    // Remover empresaId e usuarioId do corpo da requisição para evitar alterações indevidas
    delete updates.empresaId;
    delete updates.usuarioId;
    delete updates.clienteId; // Cliente não deve ser alterado diretamente aqui

    const oportunidadeAtualizada = await prisma.oportunidade.update({
      where: { id },
      data: updates,
      include: {
        cliente: {
          select: { nome: true, email: true, empresaId: true },
          include: { empresa: { select: { nome: true } } }
        },
        usuario: { select: { nome: true } }
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

    // Verificar se a oportunidade pertence ao usuário e à empresa do usuário
    const oportunidade = await prisma.oportunidade.findFirst({
      where: {
        id,
        usuarioId: req.userId!,
        empresaId: req.user?.empresaId // Adicionado filtro por empresa
      }
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