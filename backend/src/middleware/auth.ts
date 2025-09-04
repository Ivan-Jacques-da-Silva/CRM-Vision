import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token de acesso requerido' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: { id: true, nome: true, email: true, empresaId: true, plano: true, trialStart: true, trialEnd: true }
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Calcular se o trial expirou
    const now = new Date();
    // Se trialEnd não estiver definido, calcula com base em trialStart
    const trialEnd = usuario.trialEnd || (usuario.trialStart ? new Date(usuario.trialStart.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date());
    const isTrialExpired = usuario.plano === 'TRIAL' && now > trialEnd;

    // Adicionar usuário ao request
    req.userId = usuario.id; // Adicionar userId ao request
    req.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      empresaId: usuario.empresaId,
      plano: isTrialExpired ? 'EXPIRADO' : usuario.plano,
      isTrialExpired
    };
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Alias para compatibilidade com rotas que usam authenticateToken
export const authenticateToken = authMiddleware;