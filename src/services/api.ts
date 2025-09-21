/**
 * Serviço de API para interação com o backend
 * Detecta automaticamente o ambiente (localhost, Replit, VPS)
 */

import { detectBrowserEnvironment, logEnvironmentConfig } from '@shared/environment';

// Configuração automática do ambiente
const environmentConfig = detectBrowserEnvironment();
const API_BASE_URL = environmentConfig.apiBaseUrl!;

// Log da configuração para debug
if (import.meta.env.DEV) {
  logEnvironmentConfig(environmentConfig, 'frontend');
}

/**
 * Classe para lidar com erros da API
 */
class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Função helper para fazer requisições HTTP
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Adicionar token de autenticação se disponível
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.erro || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Erro de conexão: ${error}`, 0);
  }
}

// ==================== AUTENTICAÇÃO ====================

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  empresaNome?: string;
}

export async function login(credentials: LoginCredentials) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  if (response.token) {
    localStorage.setItem('authToken', response.token);
  }
  
  return response;
}

export async function register(userData: RegisterData) {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  if (response.token) {
    localStorage.setItem('authToken', response.token);
  }
  
  return response;
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    localStorage.removeItem('authToken');
  }
}

// ==================== CLIENTES ====================

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nomeEmpresa: string; // Atualizado para o novo nome do campo
  cargo?: string;
  endereco?: string;
  observacoes?: string;
  status: string;
  fonte?: string;
  tags: string[];
  criadoEm: string;
}

export async function buscarClientes(params: any = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const endpoint = queryParams ? `/clientes?${queryParams}` : '/clientes';
  return await apiRequest(endpoint);
}

export async function buscarClientePorId(id: string) {
  return await apiRequest(`/clientes/${id}`);
}

export async function criarCliente(clienteData: Partial<Cliente>) {
  return await apiRequest('/clientes', {
    method: 'POST',
    body: JSON.stringify(clienteData),
  });
}

export async function atualizarCliente(id: string, clienteData: Partial<Cliente>) {
  return await apiRequest(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clienteData),
  });
}

export async function excluirCliente(id: string) {
  return await apiRequest(`/clientes/${id}`, {
    method: 'DELETE',
  });
}

// ==================== TAREFAS ====================

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  dataVencimento: string;
  clienteId?: string;
  oportunidadeId?: string;
  usuarioResponsavel?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export async function buscarTarefas(params: any = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const endpoint = queryParams ? `/tarefas?${queryParams}` : '/tarefas';
  return await apiRequest(endpoint);
}

export async function criarTarefa(tarefaData: any) {
  return await apiRequest('/tarefas', {
    method: 'POST',
    body: JSON.stringify(tarefaData),
  });
}

export async function atualizarTarefa(id: string, tarefaData: Partial<Tarefa>) {
  return await apiRequest(`/tarefas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tarefaData),
  });
}

export async function excluirTarefa(id: string) {
  return await apiRequest(`/tarefas/${id}`, {
    method: 'DELETE',
  });
}

// ==================== OPORTUNIDADES ====================

export interface Oportunidade {
  id: string;
  titulo: string;
  descricao?: string;
  valor: number;
  status: string;
  prioridade?: string;
  probabilidade?: number;
  dataPrevisao?: string;
  clienteId: string;
  usuarioId: string;
  empresaId?: string;
  createdAt: string;
  cliente?: {
    id: string;
    nome: string;
    email: string;
    nomeEmpresa?: string;
    empresa?: {
      nome: string;
    };
  };
  usuario?: {
    id: string;
    nome: string;
  };
}

export async function buscarOportunidades(params: any = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const endpoint = queryParams ? `/oportunidades?${queryParams}` : '/oportunidades';
  return await apiRequest(endpoint);
}

export async function criarOportunidade(oportunidadeData: any) {
  return await apiRequest('/oportunidades', {
    method: 'POST',
    body: JSON.stringify(oportunidadeData),
  });
}

export async function atualizarOportunidade(id: string, oportunidadeData: Partial<Oportunidade>) {
  return await apiRequest(`/oportunidades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(oportunidadeData),
  });
}

export async function excluirOportunidade(id: string) {
  return await apiRequest(`/oportunidades/${id}`, {
    method: 'DELETE',
  });
}

// ==================== DASHBOARD ====================

export async function buscarEstatisticasDashboard() {
  return await apiRequest('/dashboard/estatisticas');
}

// ==================== RELATÓRIOS ====================

export async function buscarRelatorios(tipo: string, params: any = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const endpoint = queryParams ? `/relatorios/${tipo}?${queryParams}` : `/relatorios/${tipo}`;
  return await apiRequest(endpoint);
}

// ==================== WEBHOOKS ====================

export interface ConfiguracaoWebhook {
  id?: string;
  nome: string;
  url: string;
  eventos: string[];
  ativo: boolean;
}

export async function buscarWebhooks() {
  return await apiRequest('/webhooks');
}

export async function criarWebhook(webhookData: ConfiguracaoWebhook) {
  return await apiRequest('/webhooks', {
    method: 'POST',
    body: JSON.stringify(webhookData),
  });
}

export async function atualizarWebhook(id: string, webhookData: Partial<ConfiguracaoWebhook>) {
  return await apiRequest(`/webhooks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(webhookData),
  });
}

export async function excluirWebhook(id: string) {
  return await apiRequest(`/webhooks/${id}`, {
    method: 'DELETE',
  });
}

// ==================== CONFIGURAÇÕES DE USUÁRIO ====================

export async function buscarDadosUsuario() {
  return await apiRequest('/usuarios/perfil');
}

export async function atualizarDadosUsuario(userData: any) {
  return await apiRequest('/usuarios/perfil', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

export async function alterarSenha(senhaData: { senhaAtual: string; novaSenha: string }) {
  return await apiRequest('/usuarios/alterar-senha', {
    method: 'POST',
    body: JSON.stringify(senhaData),
  });
}

// ==================== CONFIGURAÇÕES - FUNÇÕES PLACEHOLDER ====================

export async function buscarPreferenciasNotificacao() {
  try {
    return await apiRequest('/usuarios/preferencias-notificacao');
  } catch (error) {
    console.log('Endpoint não implementado ainda, retornando dados padrão');
    return {
      novosLeads: true,
      oportunidadesAtualizadas: true,
      lembretesTarefas: true,
      emailMarketing: false,
      notificacoesPush: true
    };
  }
}

export async function atualizarPreferenciasNotificacao(preferencias: any) {
  try {
    return await apiRequest('/usuarios/preferencias-notificacao', {
      method: 'PUT',
      body: JSON.stringify(preferencias),
    });
  } catch (error) {
    console.log('Endpoint não implementado ainda');
    return { success: true };
  }
}

export async function buscarIdioma() {
  try {
    return await apiRequest('/usuarios/idioma');
  } catch (error) {
    console.log('Endpoint não implementado ainda, retornando padrão');
    return { codigo: 'pt-BR' };
  }
}

export async function atualizarIdioma(idioma: any) {
  try {
    return await apiRequest('/usuarios/idioma', {
      method: 'PUT',
      body: JSON.stringify(idioma),
    });
  } catch (error) {
    console.log('Endpoint não implementado ainda');
    return { success: true };
  }
}

export async function buscarPerfis() {
  try {
    return await apiRequest('/usuarios/perfis');
  } catch (error) {
    console.log('Endpoint não implementado ainda, retornando vazio');
    return [];
  }
}

export async function atualizarPerfis(perfis: any) {
  try {
    return await apiRequest('/usuarios/perfis', {
      method: 'PUT',
      body: JSON.stringify(perfis),
    });
  } catch (error) {
    console.log('Endpoint não implementado ainda');
    return { success: true };
  }
}

export async function atualizarDadosPessoais(dados: any) {
  try {
    return await apiRequest('/usuarios/dados-pessoais', {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  } catch (error) {
    console.log('Endpoint não implementado ainda');
    return { success: true };
  }
}

// Exportar ApiError para uso em componentes
export { ApiError };
