/**
 * Utilitário para detecção automática de ambiente
 * Funciona tanto no frontend (browser) quanto no backend (Node.js)
 */

export type Environment = 'development' | 'replit' | 'vps' | 'production';

export interface EnvironmentConfig {
  environment: Environment;
  isProduction: boolean;
  isDevelopment: boolean;
  isReplit: boolean;
  isVPS: boolean;
  apiBaseUrl?: string;
  frontendUrl?: string;
  backendPort?: number;
}

/**
 * Detecta o ambiente no frontend (browser)
 */
export function detectBrowserEnvironment(): EnvironmentConfig {
  if (typeof window === 'undefined') {
    throw new Error('detectBrowserEnvironment() deve ser usado apenas no browser');
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  let environment: Environment;
  let apiBaseUrl: string;
  
  // Detectar Replit
  if (hostname.includes('replit.app') || 
      hostname.includes('repl.co') || 
      hostname.includes('replit.dev')) {
    environment = 'replit';
    // No Replit, trocar a porta para 5000 (backend)
    const backendHostname = hostname.replace(/(-\d+)?\./, '-5000.');
    apiBaseUrl = `${protocol}//${backendHostname}/api`;
  }
  // Detectar desenvolvimento local
  else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    environment = 'development';
    apiBaseUrl = 'http://localhost:5000/api';
  }
  // Detectar VPS/Produção
  else {
    environment = 'vps';
    // Em VPS, assumir que o backend roda na porta 5000
    apiBaseUrl = `${protocol}//${hostname}:5000/api`;
  }
  
  return {
    environment,
    isProduction: environment === 'vps',
    isDevelopment: environment === 'development',
    isReplit: environment === 'replit',
    isVPS: environment === 'vps',
    apiBaseUrl,
    frontendUrl: `${protocol}//${hostname}${window.location.port ? ':' + window.location.port : ''}`
  };
}

/**
 * Detecta o ambiente no backend (Node.js)
 */
export function detectServerEnvironment(): EnvironmentConfig {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const REPL_ID = process.env.REPL_ID;
  const REPL_SLUG = process.env.REPL_SLUG;
  const REPL_OWNER = process.env.REPL_OWNER;
  const REPLIT_DB_URL = process.env.REPLIT_DB_URL;
  
  let environment: Environment;
  let backendPort: number;
  let frontendUrl: string;
  
  // Detectar Replit
  if (REPL_ID || REPLIT_DB_URL || REPL_SLUG) {
    environment = 'replit';
    backendPort = parseInt(process.env.PORT || '5050', 10); // Allow PORT override, default 5050
    
    if (REPL_SLUG && REPL_OWNER) {
      frontendUrl = process.env.FRONTEND_URL || `https://${REPL_SLUG}-${REPL_OWNER}-5173.replit.app`;
    } else {
      frontendUrl = process.env.FRONTEND_URL || 'https://repl-frontend.replit.app';
    }
  }
  // Detectar desenvolvimento local
  else if (NODE_ENV === 'development') {
    environment = 'development';
    backendPort = parseInt(process.env.PORT || '5000', 10);
    frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  }
  // Detectar VPS/Produção
  else {
    environment = 'vps';
    backendPort = parseInt(process.env.PORT || '5000', 10);
    frontendUrl = process.env.FRONTEND_URL || 'https://seu-dominio.com';
  }
  
  return {
    environment,
    isProduction: environment === 'vps',
    isDevelopment: environment === 'development', 
    isReplit: environment === 'replit',
    isVPS: environment === 'vps',
    backendPort,
    frontendUrl
  };
}

/**
 * Configurações específicas do ambiente para CORS
 */
export function getCorsOrigins(config: EnvironmentConfig): string[] {
  if (config.isDevelopment) {
    return [
      'http://localhost:5173',
      'http://localhost:5000', 
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5000',
      'http://0.0.0.0:5173',
      'http://0.0.0.0:5000'
    ];
  }
  
  if (config.isReplit) {
    const replSlug = process.env.REPL_SLUG;
    const replOwner = process.env.REPL_OWNER;
    
    const origins = [config.frontendUrl];
    
    if (replSlug && replOwner) {
      origins.push(
        `https://${replSlug}-${replOwner}.replit.app`,
        `https://${replSlug}-${replOwner}-5173.replit.app`,
        `https://${replSlug}-${replOwner}-5000.replit.app`,
        `https://${replSlug}-${replOwner}.repl.co`,
        `https://${replSlug}-${replOwner}-5173.repl.co`,
        `https://${replSlug}-${replOwner}-5000.repl.co`
      );
    }
    
    return origins.filter(Boolean) as string[];
  }
  
  if (config.isVPS) {
    return [
      config.frontendUrl,
      process.env.FRONTEND_URL
    ].filter(Boolean) as string[];
  }
  
  return [config.frontendUrl].filter(Boolean) as string[];
}

/**
 * Log das configurações de ambiente
 */
export function logEnvironmentConfig(config: EnvironmentConfig, context: 'frontend' | 'backend') {
  console.log(`🌍 [${context.toUpperCase()}] Ambiente detectado: ${config.environment}`);
  
  if (context === 'backend') {
    console.log(`🚀 Porta do backend: ${config.backendPort}`);
    console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
  } else {
    console.log(`📡 API Base URL: ${config.apiBaseUrl}`);
  }
  
  if (config.isReplit) {
    console.log('🔧 Configurações do Replit ativas');
  }
  
  if (config.isVPS) {
    console.log('🖥️  Configurações de VPS/Produção ativas');
  }
}