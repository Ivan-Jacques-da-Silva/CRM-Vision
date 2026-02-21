export type Environment = 'development' | 'replit' | 'vps' | 'production';

export interface EnvironmentConfig {
  environment: Environment;
  isProduction: boolean;
  isDevelopment: boolean;
  isReplit: boolean;
  isVPS: boolean;
  frontendUrl?: string;
  backendPort?: number;
}

export function detectServerEnvironment(): EnvironmentConfig {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const REPL_ID = process.env.REPL_ID;
  const REPL_SLUG = process.env.REPL_SLUG;
  const REPL_OWNER = process.env.REPL_OWNER;
  const REPLIT_DB_URL = process.env.REPLIT_DB_URL;
  
  let environment: Environment;
  let backendPort: number;
  let frontendUrl: string;
  
  if (REPL_ID || REPLIT_DB_URL || REPL_SLUG) {
    environment = 'replit';
    backendPort = parseInt(process.env.PORT || '5050', 10);
    
    if (REPL_SLUG && REPL_OWNER) {
      frontendUrl = process.env.FRONTEND_URL || `https://${REPL_SLUG}-${REPL_OWNER}-5173.replit.app`;
    } else {
      frontendUrl = process.env.FRONTEND_URL || 'https://repl-frontend.replit.app';
    }
  } else if (NODE_ENV === 'development') {
    environment = 'development';
    backendPort = parseInt(process.env.PORT || '5050', 10);
    frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  } else {
    environment = 'vps';
    backendPort = parseInt(process.env.PORT || '5050', 10);
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

export function getCorsOrigins(config: EnvironmentConfig): string[] {
  if (config.isDevelopment) {
    return [
      'http://localhost:5173',
      'http://localhost:5049', 
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5049',
      'http://0.0.0.0:5173',
      'http://0.0.0.0:5049'
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

export function logEnvironmentConfig(config: EnvironmentConfig, context: 'backend') {
  console.log(`🌍 [${context.toUpperCase()}] Ambiente detectado: ${config.environment}`);
  console.log(`🚀 Porta do backend: ${config.backendPort}`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
  
  if (config.isReplit) {
    console.log('🔧 Configurações do Replit ativas');
  }
  
  if (config.isVPS) {
    console.log('🖥️  Configurações de VPS/Produção ativas');
  }
}

