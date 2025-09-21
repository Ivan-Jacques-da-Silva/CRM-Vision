import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import clientesRoutes from './routes/clientes';
import tarefasRoutes from './routes/tarefas';
import oportunidadesRoutes from './routes/oportunidades';
import trialRoutes from './routes/trial';

const app = express();
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '5050', 10);

// Verificação de segurança - JWT Secret obrigatório
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET é obrigatório. Configure a variável de ambiente.');
  process.exit(1);
}

// Configuração segura do CORS
const allowedOrigins = process.env.FRONTEND_URL ? 
  [process.env.FRONTEND_URL] : 
  ['http://localhost:5173', 'http://localhost:5000', 'http://0.0.0.0:5173', 'http://0.0.0.0:5000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false // Permite embeds se necessário
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP por janela
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Rate limiting mais restritivo para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // apenas 5 tentativas de login por IP por 15 minutos
  message: 'Muitas tentativas de login, tente novamente em 15 minutos.',
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log das requisições  
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/tarefas', tarefasRoutes);
app.use('/api/oportunidades', oportunidadesRoutes);
app.use('/api/trial', trialRoutes);

// Rota de teste
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ 
    message: 'Backend funcionando!', 
    timestamp: new Date().toISOString(),
    port: PORT,
    host: req.get('host'),
    url: req.url,
    origin: req.get('origin') || 'N/A'
  });
});

// Middleware de erro
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
});

// Rota 404
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Iniciar servidor
async function startServer() {
  try {
    // Conectar ao banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`🌐 Servidor acessível em todas as interfaces de rede`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\n⏹️  Desligando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();