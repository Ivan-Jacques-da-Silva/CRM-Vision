#!/usr/bin/env node

const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');

// Start backend server on port 5000
console.log('🚀 Starting backend server on port 5000...');
const backend = spawn('npm', ['run', 'dev'], { 
  cwd: './backend',
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

// Wait a moment for backend to start, then start frontend
setTimeout(() => {
  console.log('🚀 Starting frontend server on port 5000...');
  const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
    stdio: 'inherit'
  });
  
  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });
}, 2000);

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