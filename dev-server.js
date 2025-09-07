#!/usr/bin/env node

import { createServer } from 'vite'
import { spawn } from 'child_process'

async function startServers() {
  // Start backend on port 5000
  console.log('🚀 Starting backend server...')
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: './backend',
    stdio: 'inherit',
    env: { ...process.env, PORT: '5000' }
  })

  // Start frontend Vite server on port 3000
  console.log('🚀 Starting Vite dev server...')
  const server = await createServer({
    server: {
      host: '0.0.0.0',
      port: 3000
    }
  })
  
  await server.listen()
  console.log('✅ Frontend server ready on port 5000')
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down servers...')
    backend.kill()
    await server.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    backend.kill()
    await server.close()
    process.exit(0)
  })
}

startServers().catch((err) => {
  console.error('Error starting servers:', err)
  process.exit(1)
})