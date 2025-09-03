
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { checkTrialStatus } from '../middleware/trial';

const router = express.Router();
const prisma = new PrismaClient();

// Verificar status do trial
router.get('/status', authenticateToken, checkTrialStatus, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        nome: true,
        email: true,
        plano: true,
        trialStart: true,
        trialEnd: true,
        isActive: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const now = new Date();
    const trialEnd = usuario.trialEnd || new Date(usuario.trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const diasRestantes = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isTrialExpired = usuario.plano === 'TRIAL' && now > trialEnd;

    res.json({
      usuario: {
        ...usuario,
        diasRestantes,
        isTrialExpired,
        plano: isTrialExpired ? 'EXPIRADO' : usuario.plano
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status do trial:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Simular upgrade para premium (para testes)
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.update({
      where: { id: req.user!.id },
      data: {
        plano: 'PREMIUM',
        isActive: true
      },
      select: {
        id: true,
        nome: true,
        email: true,
        plano: true,
        isActive: true
      }
    });

    res.json({
      message: 'Upgrade realizado com sucesso!',
      usuario
    });
  } catch (error) {
    console.error('Erro ao fazer upgrade:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
