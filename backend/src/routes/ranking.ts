import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { checkTrialStatus } from '../middleware/trial';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(checkTrialStatus);

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      return res.status(400).json({ message: 'Usuário não pertence a nenhuma empresa' });
    }

    const ranking = await prisma.usuario.findMany({
      where: {
        empresaId,
        isActive: true
      },
      select: {
        id: true,
        nome: true,
        email: true,
        salesPoints: true,
        _count: {
          select: {
            oportunidades: {
              where: {
                status: 'GANHO'
              }
            }
          }
        }
      },
      orderBy: {
        salesPoints: 'desc'
      }
    });

    const rankingComPosicao = ranking.map((usuario, index) => ({
      ...usuario,
      posicao: index + 1,
      vendasConcluidas: usuario._count.oportunidades
    }));

    res.json(rankingComPosicao);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
