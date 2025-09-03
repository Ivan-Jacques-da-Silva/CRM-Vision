import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, empresaNome } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar empresa se fornecida
    let empresa = null;
    if (empresaNome) {
      empresa = await prisma.empresa.create({
        data: { nome: empresaNome }
      });
    }

    // Calcular data de fim do trial (7 dias)
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        empresaId: empresa?.id,
        plano: 'TRIAL',
        trialEnd: trialEnd,
        isActive: true
      },
      select: {
        id: true,
        nome: true,
        email: true,
        empresaId: true,
        plano: true,
        trialEnd: true
      }
    });

    // Gerar token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign({ userId: usuario.id }, jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario,
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, usuario.senha);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Gerar token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign({ userId: usuario.id }, jwtSecret, { expiresIn: '7d' });

    // Verificar status do trial
    const now = new Date();
    const trialEnd = usuario.trialEnd || new Date(usuario.trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const isTrialExpired = usuario.plano === 'TRIAL' && now > trialEnd;
    const diasRestantes = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    res.json({
      message: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        empresaId: usuario.empresaId,
        plano: isTrialExpired ? 'EXPIRADO' : usuario.plano,
        trialEnd: trialEnd,
        diasRestantes,
        isTrialExpired
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;