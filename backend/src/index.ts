import { config as dotenvConfig } from 'dotenv';
import path from 'path';
// Força restart do backend - v2
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { detectServerEnvironment, getCorsOrigins, logEnvironmentConfig } from './environment';
import authRoutes from './routes/auth';
import clientesRoutes from './routes/clientes';
import tarefasRoutes from './routes/tarefas';
import oportunidadesRoutes from './routes/oportunidades';
import trialRoutes from './routes/trial';
import empresasRoutes from './routes/empresas';
import rankingRoutes from './routes/ranking';
import usuariosRoutes from './routes/usuarios';

// Configurar dotenv para carregar .env de múltiplos locais
[
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env')
].forEach(envPath => {
  dotenvConfig({ path: envPath, override: false });
});

const app = express();
const prisma = new PrismaClient();

// Configuração automática do ambiente
const environmentConfig = detectServerEnvironment();
const PORT = environmentConfig.backendPort!;

// Verificação de segurança - JWT Secret obrigatório
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET é obrigatório. Configure a variável de ambiente.');
  if (environmentConfig.isDevelopment || environmentConfig.isReplit) {
    console.warn('⚠️  Continuando sem JWT_SECRET em ambiente de desenvolvimento/Replit');
  } else {
    process.exit(1);
  }
}

// Configuração segura do CORS baseada no ambiente
const allowedOrigins = getCorsOrigins(environmentConfig);

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Log das requisições  
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/tarefas', tarefasRoutes);
app.use('/api/oportunidades', oportunidadesRoutes);
app.use('/api/trial', trialRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/usuarios', usuariosRoutes);

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
    // Log da configuração de ambiente
    logEnvironmentConfig(environmentConfig, 'backend');
    console.log(`🔗 Origins permitidas no CORS:`, allowedOrigins);
    
    // Iniciar servidor primeiro
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`🌐 Servidor acessível em todas as interfaces de rede`);
      
      // Conectar ao banco após o servidor estar rodando
      connectToDatabase();
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
  } catch (error) {
    console.error('⚠️  Erro ao conectar com o banco de dados:', error);
    console.log('🔄 Tentando reconectar em 5 segundos...');
    setTimeout(connectToDatabase, 5000);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\n⏹️  Desligando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
