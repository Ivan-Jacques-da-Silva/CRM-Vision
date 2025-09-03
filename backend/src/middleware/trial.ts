
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        nome: string;
        email: string;
        plano: string;
        isTrialExpired: boolean;
      };
    }
  }
}

export const checkTrialStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o trial expirou
    const now = new Date();
    const trialEnd = usuario.trialEnd || new Date(usuario.trialStart.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    if (usuario.plano === 'TRIAL' && now > trialEnd) {
      // Atualizar status para expirado
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { 
          plano: 'EXPIRADO',
          isActive: false 
        }
      });

      req.user.plano = 'EXPIRADO';
      req.user.isTrialExpired = true;
    } else {
      req.user.plano = usuario.plano;
      req.user.isTrialExpired = false;
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar trial:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const requireActiveTrial = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.plano === 'EXPIRADO' || req.user?.isTrialExpired) {
    return res.status(403).json({ 
      message: 'Trial expirado. Upgrade para continuar usando o sistema.',
      trialExpired: true 
    });
  }
  next();
};
