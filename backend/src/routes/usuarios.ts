import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas!'));
  }
});

// Update personal data
router.put('/dados-pessoais', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { nome, email, telefone } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: { nome, email, telefone },
      select: { id: true, nome: true, email: true, telefone: true, avatar: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar dados pessoais:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados pessoais' });
  }
});

// Change password
router.post('/alterar-senha', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const isValidPassword = await bcrypt.compare(senhaAtual, user.senha);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id: userId },
      data: { senha: hashedPassword }
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

// Upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    // URL to access the file (assuming public folder is served statically)
    const avatarUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: { id: true, avatar: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do avatar' });
  }
});

export default router;