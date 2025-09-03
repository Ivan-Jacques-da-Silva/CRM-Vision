import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import clientesRoutes from './routes/clientes';
import tarefasRoutes from './routes/tarefas';
import oportunidadesRoutes from './routes/oportunidades';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log das requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/tarefas', tarefasRoutes);
app.use('/api/oportunidades', oportunidadesRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
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
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Iniciar servidor
async function startServer() {
  try {
    // Conectar ao banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
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