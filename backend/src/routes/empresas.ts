import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { checkTrialStatus } from '../middleware/trial';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(checkTrialStatus);

router.get('/me', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.empresaId) {
      return res.status(400).json({ message: 'Usuário não está vinculado a nenhuma empresa' });
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: req.user.empresaId },
      include: {
        usuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            isActive: true,
            createdAt: true,
            plano: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!empresa) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    const maxUsuarios = 2;

    return res.json({
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        createdAt: empresa.createdAt,
        updatedAt: empresa.updatedAt
      },
      usuarios: empresa.usuarios,
      stats: {
        totalUsuarios: empresa.usuarios.length,
        maxUsuarios
      }
    });
  } catch (error) {
    console.error('Erro ao buscar empresa atual:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.post('/usuarios', async (req: AuthenticatedRequest, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!req.user?.empresaId) {
      return res.status(400).json({ message: 'Usuário não está vinculado a nenhuma empresa' });
    }

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: req.user.empresaId },
      include: {
        usuarios: {
          where: { isActive: true }
        }
      }
    });

    if (!empresa) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    const usuariosAtivos = empresa.usuarios.length;

    if (usuariosAtivos >= 2) {
      return res.status(400).json({
        message: 'Limite de usuários atingido para esta empresa. Compre mais usuários no painel para adicionar novos membros.'
      });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        empresaId: empresa.id,
        plano: req.user.plano || 'TRIAL',
        trialStart: new Date(),
        trialEnd: null,
        isActive: true
      },
      select: {
        id: true,
        nome: true,
        email: true,
        empresaId: true,
        plano: true,
        createdAt: true,
        isActive: true
      }
    });

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: novoUsuario
    });
  } catch (error) {
    console.error('Erro ao criar usuário da empresa:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
