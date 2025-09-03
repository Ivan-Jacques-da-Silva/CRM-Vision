#!/usr/bin/env node

import { spawn } from 'child_process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';

// Start backend server
console.log('🚀 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], { 
  cwd: './backend',
  stdio: 'inherit'
});

// Start frontend with proxy
console.log('🚀 Starting frontend server...');
const frontend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});