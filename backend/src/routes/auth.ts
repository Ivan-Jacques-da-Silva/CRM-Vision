import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const AUTH_COOKIE_NAME = 'auth_token';
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function parseSameSite(value?: string): 'lax' | 'strict' | 'none' {
  if (value === 'strict' || value === 'none' || value === 'lax') return value;
  return 'lax';
}

function shouldUseSecureCookie(req: express.Request): boolean {
  if (process.env.COOKIE_SECURE === 'true') return true;
  if (process.env.COOKIE_SECURE === 'false') return false;

  const forwardedProto = req.headers['x-forwarded-proto'];
  return req.secure || forwardedProto === 'https' || process.env.NODE_ENV === 'production';
}

function setAuthCookie(req: express.Request, res: express.Response, token: string) {
  const sameSite = parseSameSite(process.env.COOKIE_SAME_SITE);
  const secure = sameSite === 'none' ? true : shouldUseSecureCookie(req);
  const domain = process.env.COOKIE_DOMAIN;

  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: TOKEN_MAX_AGE_MS,
    path: '/',
    ...(domain ? { domain } : {}),
  });
}

function clearAuthCookie(req: express.Request, res: express.Response) {
  const sameSite = parseSameSite(process.env.COOKIE_SAME_SITE);
  const secure = sameSite === 'none' ? true : shouldUseSecureCookie(req);
  const domain = process.env.COOKIE_DOMAIN;

  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    ...(domain ? { domain } : {}),
  });
}

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, empresaNome } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha sao obrigatorios' });
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email ja esta em uso' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const nomeEmpresaFinal =
      (empresaNome && String(empresaNome).trim()) || String(nome).trim();

    const empresa = await prisma.empresa.create({
      data: {
        nome: nomeEmpresaFinal
      }
    });

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        empresaId: empresa.id,
        plano: 'TRIAL',
        trialEnd,
        isActive: true
      },
      select: {
        id: true,
        nome: true,
        email: true,
        empresaId: true,
        kanbanPipelineAtivo: true,
        plano: true,
        trialEnd: true
      }
    });

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign({ userId: usuario.id }, jwtSecret, { expiresIn: '7d' });
    setAuthCookie(req, res, token);

    return res.status(201).json({
      message: 'Usuario criado com sucesso',
      usuario,
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha sao obrigatorios' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const isValidPassword = await bcrypt.compare(senha, usuario.senha);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign({ userId: usuario.id }, jwtSecret, { expiresIn: '7d' });
    setAuthCookie(req, res, token);

    const now = new Date();
    const trialEnd = usuario.trialEnd || new Date(usuario.trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isTrialExpired = usuario.plano === 'TRIAL' && now > trialEnd;
    const diasRestantes = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return res.json({
      message: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        empresaId: usuario.empresaId,
        kanbanPipelineAtivo: usuario.kanbanPipelineAtivo,
        plano: isTrialExpired ? 'EXPIRADO' : usuario.plano,
        trialEnd,
        diasRestantes,
        isTrialExpired
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.post('/logout', (req, res) => {
  clearAuthCookie(req, res);
  return res.json({ message: 'Logout realizado com sucesso' });
});

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatar: true,
        empresaId: true,
        kanbanPipelineAtivo: true,
        plano: true,
        trialStart: true,
        trialEnd: true,
        isActive: true,
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario nao encontrado' });
    }

    const now = new Date();
    const trialEnd = usuario.trialEnd || new Date(usuario.trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isTrialExpired = usuario.plano === 'TRIAL' && now > trialEnd;
    const diasRestantes = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        avatar: usuario.avatar,
        empresaId: usuario.empresaId,
        kanbanPipelineAtivo: usuario.kanbanPipelineAtivo,
        plano: isTrialExpired ? 'EXPIRADO' : usuario.plano,
        trialEnd,
        diasRestantes,
        isTrialExpired,
        isActive: usuario.isActive,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar sessao do usuario:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
