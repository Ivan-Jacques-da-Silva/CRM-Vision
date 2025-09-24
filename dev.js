#!/usr/bin/env node

import { spawn } from 'child_process';

// Set environment variables for proper configuration
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://0.0.0.0:5050';

console.log('🚀 Iniciando backend na porta 5050...');
const backend = spawn('npm', ['run', 'dev'], { 
  cwd: './backend',
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: '5050',
    NODE_ENV: 'development',
    DATABASE_URL: process.env.DATABASE_URL
  }
});

// Aguardar o backend iniciar antes de iniciar o frontend
setTimeout(() => {
  console.log('🚀 Iniciando frontend na porta 5000...');
  const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
    stdio: 'inherit',
    env: { 
      ...process.env,
      VITE_API_URL: 'http://0.0.0.0:5050'
    }
  });

  frontend.on('error', (err) => {
    console.error('❌ Erro no frontend:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('❌ Erro no backend:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Desligando servidores...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  process.exit(0);
});