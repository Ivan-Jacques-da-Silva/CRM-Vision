#!/usr/bin/env node

import { spawn } from 'child_process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';

// Start backend server on port 5000  
console.log('🚀 Starting backend server on port 5000...');
const backend = spawn('npx', ['tsx', 'src/index.ts'], { 
  cwd: './backend',
  stdio: 'pipe',
  env: { ...process.env, PORT: '5000', NODE_ENV: 'development' }
});

// Capture backend output
backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
});

// Wait for backend to start, then start frontend
setTimeout(() => {
  console.log('🚀 Starting frontend server on port 5173...');
  const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
    stdio: 'pipe'
  });
  
  // Capture frontend output
  frontend.stdout.on('data', (data) => {
    console.log(`[FRONTEND] ${data.toString().trim()}`);
  });

  frontend.stderr.on('data', (data) => {
    console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
  });
  
  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Backend error:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down servers...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  process.exit(0);
});