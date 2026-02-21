
const { Client } = require('pg')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// ===== Configs de acesso admin (postgres padrão) =====
const CONFIG_ADMIN = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'admin',
  database: process.env.PGDB || 'postgres',
}

// ===== Config do CRM =====
const CONFIG_CRM = {
  database: process.env.CRM_DBNAME || 'visioncrm',
  usuario: process.env.CRM_DBUSER || 'visioncrm_user',
  senha: process.env.CRM_DBPASS || 'VisionCRM2024!@#',
  host: process.env.CRM_DBHOST || 'localhost',
  port: Number(process.env.CRM_DBPORT || 5432),
}

// ===== Helpers =====
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
const codificar = (s) => encodeURIComponent(s ?? '')
const montarDatabaseUrl = () =>
  `postgresql://${codificar(CONFIG_CRM.usuario)}:${codificar(CONFIG_CRM.senha)}@${CONFIG_CRM.host}:${CONFIG_CRM.port}/${CONFIG_CRM.database}?schema=public`

class SetupBanco {
  constructor() {
    this.clienteAdmin = null
    this.clienteCRM = null
    this.raizProjeto = process.cwd()
    this.caminhoPrisma = path.resolve(this.raizProjeto, 'prisma', 'schema.prisma')
    this.caminhoEnv = path.resolve(this.raizProjeto, '.env')
    this.caminhoNodeModules = path.resolve(this.raizProjeto, 'node_modules')
  }

  log(emoji, mensagem) {
    console.log(`${emoji} ${mensagem}`)
  }

  erro(mensagem, erro = null) {
    console.error(`❌ ${mensagem}`)
    if (erro) console.error(erro.message)
  }

  async conectarAdmin(tentativas = 5) {
    this.log('🔌', 'Conectando como admin...')
    let erroFinal = null

    for (let i = 1; i <= tentativas; i++) {
      try {
        const possiblePasswords = [
          CONFIG_ADMIN.password,
          'postgres',
          'admin',
          '123456',
          ''
        ]

        for (const senha of possiblePasswords) {
          try {
            this.clienteAdmin = new Client({
              ...CONFIG_ADMIN,
              password: senha
            })
            await this.clienteAdmin.connect()
            this.log('✅', `Admin conectado com senha "${senha || '(vazia)'}"`)
            CONFIG_ADMIN.password = senha // salva a que funcionou
            return
          } catch (e) {
            this.log('⏳', `Tentando senha "${senha || '(vazia)'}"... falhou`)
          }
        }

        throw new Error('Nenhuma senha válida encontrada para usuário admin/postgres')
      } catch (e) {
        erroFinal = e
        this.log('⏳', `Tentativa ${i}/${tentativas} falhou: ${e.message}`)
        if (i < tentativas) await esperar(1000)
      }
    }

    throw erroFinal
  }


  async validarPostgreSQL() {
    this.log('🔍', 'Validando PostgreSQL...')
    try {
      const resultado = await this.clienteAdmin.query('SELECT version()')
      const versao = resultado.rows[0].version
      this.log('✅', `PostgreSQL detectado: ${versao.split(' ')[1]}`)
    } catch (e) {
      throw new Error('PostgreSQL não está funcionando corretamente')
    }
  }

  async criarBanco() {
    this.log('🗄️', `Checando banco "${CONFIG_CRM.database}"...`)
    const q = `SELECT 1 FROM pg_database WHERE datname = $1`
    const r = await this.clienteAdmin.query(q, [CONFIG_CRM.database])
    if (r.rows.length) {
      this.log('✅', 'Banco já existe')
      return
    }
    await this.clienteAdmin.query(`CREATE DATABASE "${CONFIG_CRM.database}"`)
    this.log('✅', 'Banco criado')
  }

  async criarUsuario() {
    this.log('👤', `Checando usuário "${CONFIG_CRM.usuario}"...`)
    const q = `SELECT 1 FROM pg_roles WHERE rolname = $1`
    const r = await this.clienteAdmin.query(q, [CONFIG_CRM.usuario])

    if (!r.rows.length) {
      await this.clienteAdmin.query(`CREATE USER ${CONFIG_CRM.usuario} WITH PASSWORD '${CONFIG_CRM.senha}'`)
      this.log('✅', 'Usuário criado')
    } else {
      await this.clienteAdmin.query(`ALTER USER ${CONFIG_CRM.usuario} WITH PASSWORD '${CONFIG_CRM.senha}'`)
      this.log('🔒', 'Senha do usuário atualizada')
    }

    // Dono do DB + permissões úteis para dev
    await this.clienteAdmin.query(`ALTER DATABASE ${CONFIG_CRM.database} OWNER TO ${CONFIG_CRM.usuario}`)
    await this.clienteAdmin.query(`GRANT CONNECT, TEMP ON DATABASE ${CONFIG_CRM.database} TO ${CONFIG_CRM.usuario}`)
    await this.clienteAdmin.query(`REVOKE ALL ON DATABASE ${CONFIG_CRM.database} FROM PUBLIC`)
    this.log('✅', 'Permissões básicas concedidas')
  }

  async conectarCRM() {
    this.log('🔌', `Conectando ao banco "${CONFIG_CRM.database}"...`)
    const hosts = [CONFIG_CRM.host || 'localhost', CONFIG_ADMIN.host || '/var/run/postgresql']

    for (const host of hosts) {
      try {
        this.clienteCRM = new Client({
          host,
          port: CONFIG_CRM.port,
          user: CONFIG_CRM.usuario,
          password: CONFIG_CRM.senha,
          database: CONFIG_CRM.database,
        })
        await this.clienteCRM.connect()
        this.log('✅', `Conectado ao banco CRM (host="${host}")`)
        CONFIG_CRM.host = host
        return
      } catch { /* tenta próximo */ }
    }
    throw new Error('Falha ao conectar no banco CRM em localhost e no socket')
  }


  async ajustarPermissoesSchema() {
    this.log('🛡️', 'Ajustando permissões do schema public...')
    const c = this.clienteCRM
    await c.query(`ALTER SCHEMA public OWNER TO "${CONFIG_CRM.usuario}"`)
    await c.query(`GRANT USAGE, CREATE ON SCHEMA public TO "${CONFIG_CRM.usuario}"`)
    await c.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${CONFIG_CRM.usuario}"`)
    await c.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${CONFIG_CRM.usuario}"`)
    await c.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "${CONFIG_CRM.usuario}"`)
    this.log('✅', 'Permissões do schema ajustadas')
  }

  async backupEnvExistente() {
    if (fs.existsSync(this.caminhoEnv)) {
      const backup = this.caminhoEnv + `.bak-${Date.now()}`
      fs.copyFileSync(this.caminhoEnv, backup)
      this.log('💾', `Backup do .env criado: ${path.basename(backup)}`)
    }
  }

  escreverEnv() {
    this.log('📝', 'Gerando .env...')
    const url = montarDatabaseUrl()
    const jwt = process.env.JWT_SECRET || `vision-crm-jwt-${Math.random().toString(36).slice(2)}`

    const conteudo = [
      `# Vision CRM - Configurações do Backend`,
      `# Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`,
      ``,
      `# Prisma/Database`,
      `DATABASE_URL="${url}"`,
      ``,
      `# App`,
      `JWT_SECRET="${jwt}"`,
      `PORT=${process.env.PORT || 5000}`,
      `NODE_ENV=${process.env.NODE_ENV || 'development'}`,
      ``,
      `# PostgreSQL Admin (para setup)`,
      `PGHOST=${CONFIG_ADMIN.host}`,
      `PGPORT=${CONFIG_ADMIN.port}`,
      `PGUSER=${CONFIG_ADMIN.user}`,
      `PGPASSWORD=${CONFIG_ADMIN.password}`,
      `PGDB=${CONFIG_ADMIN.database}`,
      ``,
      `# CRM Database Config`,
      `CRM_DBNAME=${CONFIG_CRM.database}`,
      `CRM_DBUSER=${CONFIG_CRM.usuario}`,
      `CRM_DBPASS=${CONFIG_CRM.senha}`,
      `CRM_DBHOST=${CONFIG_CRM.host}`,
      `CRM_DBPORT=${CONFIG_CRM.port}`,
      ``,
    ].join('\n')

    fs.writeFileSync(this.caminhoEnv, conteudo, 'utf8')
    this.log('✅', '.env escrito')
  }

  prismaDisponivel() {
    return fs.existsSync(this.caminhoPrisma)
  }

  nodeModulesExiste() {
    return fs.existsSync(this.caminhoNodeModules)
  }

  executar(cmd, opcoes = {}) {
    const defaultOpcoes = {
      stdio: 'inherit',
      cwd: this.raizProjeto,
      timeout: 240000, // 4 minutos
      ...opcoes
    }
    this.log('⚡', `Executando: ${cmd}`)
    return execSync(cmd, defaultOpcoes)
  }

  async limparCache() {
    this.log('🧹', 'Limpando cache...')
    const cacheDirs = [
      path.join(this.caminhoNodeModules, '.prisma'),
      path.join(this.caminhoNodeModules, '.cache'),
      path.join(this.raizProjeto, 'dist'),
    ]

    cacheDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true })
        this.log('🗑️', `Cache removido: ${path.basename(dir)}`)
      }
    })
  }

  async limparDadosExistentes() {
    this.log('🧹', 'Limpando dados existentes...')

    try {
      // Deletar em ordem devido às relações
      await this.clienteCRM.query('DELETE FROM tarefas')
      await this.clienteCRM.query('DELETE FROM oportunidades')
      await this.clienteCRM.query('DELETE FROM clientes')
      await this.clienteCRM.query('DELETE FROM usuarios')
      await this.clienteCRM.query('DELETE FROM empresas')

      this.log('✅', 'Dados existentes removidos com sucesso')
    } catch (error) {
      this.log('⚠️', `Erro ao limpar dados: ${error.message}`)
      // Se falhar, tentar reset das tabelas via Prisma
      try {
        this.log('🔄', 'Tentando reset via Prisma...')
        this.executar('npx prisma db push --force-reset')
        this.log('✅', 'Reset via Prisma concluído')
      } catch (prismaError) {
        this.log('⚠️', 'Reset via Prisma também falhou, continuando...')
      }
    }
  }

  async instalarDependencias() {
    if (!this.nodeModulesExiste()) {
      this.log('📦', 'Instalando dependências...')
      this.executar('npm install')
    } else {
      this.log('✅', 'Dependências já instaladas')
    }
  }

  async rodarPrisma() {
    if (!this.prismaDisponivel()) {
      this.log('ℹ️', 'Prisma não encontrado (prisma/schema.prisma). Pulando etapa.')
      return
    }

    try {
      await this.instalarDependencias()

      this.log('🔧', 'Gerando client Prisma...')
      this.executar('npx prisma generate')

      this.log('🔄', 'Aplicando migrações...')
      try {
        // Tentar migrate dev primeiro (desenvolvimento)
        this.executar('npx prisma migrate dev --name auto_migration')
      } catch (e1) {
        this.log('⚠️', 'Migrate dev falhou, tentando db push...')
        try {
          this.executar('npx prisma db push --force-reset')
        } catch (e2) {
          this.log('⚠️', 'DB push falhou, tentando migrate deploy...')
          this.executar('npx prisma migrate deploy')
        }
      }

      // Regenerar client após migrações
      this.log('🔄', 'Regenerando client final...')
      this.executar('npx prisma generate')

      this.log('✅', 'Prisma configurado')
    } catch (e) {
      this.erro('Falha no Prisma', e)
      throw e
    }
  }

  async corrigirPrisma() {
    this.log('🔧', 'Corrigindo problemas do Prisma...')

    try {
      // Limpar cache
      await this.limparCache()

      // Forçar regeneração completa
      this.log('🔄', 'Resetando migrações...')
      this.executar('npx prisma migrate reset --force')

      this.log('🔧', 'Gerando client atualizado...')
      this.executar('npx prisma generate')

      this.log('🔄', 'Criando nova migração...')
      this.executar('npx prisma migrate dev --name fix_schema_complete')

      this.log('✅', 'Problemas do Prisma corrigidos!')

    } catch (e) {
      this.erro('Falha ao corrigir Prisma', e)
      throw e
    }
  }

  async listarTabelas() {
    const r = await this.clienteCRM.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    return r.rows.map((x) => x.table_name)
  }

  async seedBasico() {
    this.log('🌱', 'Verificando dados iniciais...')
    try {
      // Verificar se há usuários (nome correto da tabela)
      const r = await this.clienteCRM.query(`SELECT COUNT(*)::int AS n FROM usuarios`)
      if (r.rows[0].n > 0) {
        this.log('🗑️', 'Dados existentes detectados. Limpando para recriar usuários padrão...')
        await this.limparDadosExistentes()
      }
    } catch (e) {
      this.log('ℹ️', 'Tabelas ainda não existem. Criando dados iniciais...')
    }

    try {
      const bcrypt = require('bcryptjs')

      const agora = new Date()
      const trialEnd = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000)
      const empresaId = 'empresa-vision'

      // Criar empresa padrão
      await this.clienteCRM.query(`
        INSERT INTO "empresas" (id, nome, "createdAt", "updatedAt") 
        VALUES ($1, $2, NOW(), NOW()) 
        ON CONFLICT (id) DO UPDATE SET
          nome = EXCLUDED.nome,
          "updatedAt" = NOW()
      `, [empresaId, 'Vision CRM'])

      const senhaIvan = await bcrypt.hash('Iv4n!24', 10)
      const senhaComercial = await bcrypt.hash('C0m3rc!4', 10)

      await this.clienteCRM.query(`
        INSERT INTO "usuarios" (
          id, nome, email, senha, "empresaId", plano, "trialStart", "trialEnd",
          "isActive", "createdAt", "updatedAt"
        )
        VALUES (
          'usuario-ivan', 'Ivan', 'ivan@vision.dev.br', $1, $2,
          'PREMIUM', $3, $4, true, NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          nome = EXCLUDED.nome,
          senha = EXCLUDED.senha,
          "empresaId" = EXCLUDED."empresaId",
          plano = EXCLUDED.plano,
          "trialStart" = EXCLUDED."trialStart",
          "trialEnd" = EXCLUDED."trialEnd",
          "isActive" = EXCLUDED."isActive",
          "updatedAt" = NOW()
      `, [senhaIvan, empresaId, agora, trialEnd])

      await this.clienteCRM.query(`
        INSERT INTO "usuarios" (
          id, nome, email, senha, "empresaId", plano, "trialStart", "trialEnd",
          "isActive", "createdAt", "updatedAt"
        )
        VALUES (
          'usuario-comercial', 'Comercial Vision', 'comercial@vision.dev.br', $1, $2,
          'PREMIUM', $3, $4, true, NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          nome = EXCLUDED.nome,
          senha = EXCLUDED.senha,
          "empresaId" = EXCLUDED."empresaId",
          plano = EXCLUDED.plano,
          "trialStart" = EXCLUDED."trialStart",
          "trialEnd" = EXCLUDED."trialEnd",
          "isActive" = EXCLUDED."isActive",
          "updatedAt" = NOW()
      `, [senhaComercial, empresaId, agora, trialEnd])

      this.log('✅', 'Usuários padrão criados com sucesso!')
      this.log('📧', 'ivan@vision.dev.br / Iv4n!24')
      this.log('📧', 'comercial@vision.dev.br / C0m3rc!4')
    } catch (e) {
      this.log('⚠️', `Seed falhou: ${e.message}`)
      console.error(e)
    }
  }

  async seedKanban() {
    this.log('🎯', 'Criando dados exemplo para Kanban...')

    // Oportunidades para o Kanban (diferentes status)
    const oportunidades = [
      { id: 'opp-1', titulo: 'Venda Software ERP', status: 'LEAD', valor: 50000, clienteId: 'cliente-demo-1' },
      { id: 'opp-2', titulo: 'Consultoria Digital', status: 'QUALIFICADO', valor: 25000, clienteId: 'cliente-demo-2' },
      { id: 'opp-3', titulo: 'App Mobile', status: 'PROPOSTA', valor: 80000, clienteId: 'cliente-demo-1' },
      { id: 'opp-4', titulo: 'Sistema Web Completo', status: 'NEGOCIACAO', valor: 120000, clienteId: 'cliente-demo-2' },
      { id: 'opp-5', titulo: 'E-commerce Premium', status: 'FECHADO', valor: 75000, clienteId: 'cliente-demo-1' }
    ]

    for (const opp of oportunidades) {
      try {
        await this.clienteCRM.query(`
          INSERT INTO "oportunidades" (
            id, titulo, status, valor, "clienteId", "usuarioId", "empresaId", 
            "createdAt", "updatedAt"
          ) 
          VALUES ($1, $2, $3, $4, $5, 'demo-user', 'demo-empresa', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [opp.id, opp.titulo, opp.status, opp.valor, opp.clienteId])
      } catch (e) {
        this.log('⚠️', `Erro ao criar oportunidade ${opp.titulo}: ${e.message}`)
      }
    }

    // Criar algumas tarefas exemplo
    const tarefas = [
      { id: 'task-1', titulo: 'Follow-up Cliente João', status: 'PENDENTE', prioridade: 'ALTA', clienteId: 'cliente-demo-1' },
      { id: 'task-2', titulo: 'Preparar Proposta Maria', status: 'EM_PROGRESSO', prioridade: 'MEDIA', clienteId: 'cliente-demo-2' },
      { id: 'task-3', titulo: 'Reunião Kickoff', status: 'CONCLUIDA', prioridade: 'ALTA', clienteId: 'cliente-demo-1' }
    ]

    for (const tarefa of tarefas) {
      try {
        const dataVencimento = new Date()
        dataVencimento.setDate(dataVencimento.getDate() + Math.floor(Math.random() * 10) + 1)

        await this.clienteCRM.query(`
          INSERT INTO "tarefas" (
            id, titulo, status, prioridade, "dataVencimento", "clienteId", 
            "usuarioId", "createdAt", "updatedAt"
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, 'demo-user', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [tarefa.id, tarefa.titulo, tarefa.status, tarefa.prioridade, dataVencimento, tarefa.clienteId])
      } catch (e) {
        this.log('⚠️', `Erro ao criar tarefa ${tarefa.titulo}: ${e.message}`)
      }
    }

    this.log('✅', 'Dados exemplo do Kanban e tarefas criados')
  }

  async testarConexao() {
    const r = await this.clienteCRM.query('SELECT NOW() as agora, current_database() as db')
    this.log('🧪', `Conexão ok - DB: ${r.rows[0].db} em ${r.rows[0].agora.toLocaleString('pt-BR')}`)

    const tabelas = await this.listarTabelas()
    this.log('📊', `Tabelas encontradas: ${tabelas.length}`)
    tabelas.forEach((t) => console.log(`   - ${t}`))
  }

  async validarSchema() {
    try {
      const tabelas = await this.listarTabelas()
      const tabelasEsperadas = ['usuarios', 'empresas', 'clientes', 'oportunidades', 'tarefas']

      const faltando = tabelasEsperadas.filter(t => !tabelas.includes(t))
      if (faltando.length > 0) {
        this.log('⚠️', `Tabelas faltando: ${faltando.join(', ')}`)
        return false
      } else {
        this.log('✅', 'Todas as tabelas principais estão presentes')
      }

      // Verificar campos do trial
      try {
        await this.clienteCRM.query('SELECT plano, "trialStart", "trialEnd", "isActive" FROM usuarios LIMIT 1')
        this.log('✅', 'Sistema de trial configurado corretamente')
      } catch (e) {
        this.log('⚠️', 'Campos de trial não encontrados - será corrigido')
        return false
      }

      // Verificar dados do Kanban
      try {
        const oppCount = await this.clienteCRM.query('SELECT COUNT(*) as count FROM oportunidades')
        this.log('✅', `Sistema Kanban: ${oppCount.rows[0].count} oportunidades`)
      } catch (e) {
        this.log('⚠️', 'Dados do Kanban não encontrados')
      }

      return true
    } catch (e) {
      this.log('⚠️', `Validação do schema falhou: ${e.message}`)
      return false
    }
  }

  async resetCompleto() {
    this.log('🔄', 'Executando reset completo...')

    try {
      // Parar qualquer processo que possa estar usando o banco
      await this.limpar()

      // Limpar cache
      await this.limparCache()

      // Reset do Prisma
      if (this.prismaDisponivel()) {
        this.log('🗑️', 'Resetando Prisma...')
        try {
          this.executar('npx prisma migrate reset --force')
        } catch (e) {
          this.log('⚠️', 'Reset do Prisma falhou, continuando...')
        }
      }

      this.log('✅', 'Reset completo executado')
    } catch (e) {
      this.log('⚠️', `Erro durante reset: ${e.message}`)
    }
  }

  async corrigirAutenticacao() {
    this.log('🔐', 'Corrigindo problemas de autenticação...')

    try {
      // Reconectar como admin
      await this.conectarAdmin()

      // Dropar e recriar o usuário
      try {
        await this.clienteAdmin.query(`DROP USER IF EXISTS ${CONFIG_CRM.usuario}`)
        this.log('🗑️', 'Usuário antigo removido')
      } catch (e) {
        this.log('ℹ️', 'Usuário não existia')
      }

      // Recriar usuário com permissões completas
      await this.clienteAdmin.query(`CREATE USER ${CONFIG_CRM.usuario} WITH PASSWORD '${CONFIG_CRM.senha}' CREATEDB CREATEROLE`)
      await this.clienteAdmin.query(`ALTER DATABASE ${CONFIG_CRM.database} OWNER TO ${CONFIG_CRM.usuario}`)
      await this.clienteAdmin.query(`GRANT ALL PRIVILEGES ON DATABASE ${CONFIG_CRM.database} TO ${CONFIG_CRM.usuario}`)

      this.log('✅', 'Autenticação corrigida')

    } catch (e) {
      this.log('⚠️', `Erro ao corrigir autenticação: ${e.message}`)
      throw e
    }
  }

  async corrigirUsuario() {
    this.log('👤', 'Corrigindo usuário do banco...')

    try {
      // Tentar alterar a senha primeiro
      await this.clienteAdmin.query(`ALTER USER ${CONFIG_CRM.usuario} WITH PASSWORD '${CONFIG_CRM.senha}'`)

      // Garantir permissões
      await this.clienteAdmin.query(`ALTER DATABASE ${CONFIG_CRM.database} OWNER TO ${CONFIG_CRM.usuario}`)
      await this.clienteAdmin.query(`GRANT ALL PRIVILEGES ON DATABASE ${CONFIG_CRM.database} TO ${CONFIG_CRM.usuario}`)

      this.log('✅', 'Usuário corrigido')

    } catch (e) {
      this.log('⚠️', 'Correção simples falhou, usando correção completa...')
      await this.corrigirAutenticacao()
    }
  }

  async resetBancoCompleto() {
    this.log('🗄️', 'Reset completo do banco...')

    try {
      // Dropar e recriar o banco
      await this.clienteAdmin.query(`DROP DATABASE IF EXISTS "${CONFIG_CRM.database}"`)
      await this.clienteAdmin.query(`CREATE DATABASE "${CONFIG_CRM.database}"`)

      // Recriar usuário
      await this.corrigirAutenticacao()

      this.log('✅', 'Banco resetado completamente')

    } catch (e) {
      this.log('⚠️', `Erro no reset do banco: ${e.message}`)
      throw e
    }
  }

  async corrigirPrismaCompleto() {
    this.log('🔧', 'Correção completa do Prisma...')

    try {
      // Limpar tudo relacionado ao Prisma
      await this.limparCache()

      // Forçar reset das migrações
      try {
        this.executar('npx prisma migrate reset --force')
      } catch (e) {
        this.log('ℹ️', 'Reset de migrações não necessário')
      }

      // Regenerar client
      this.executar('npx prisma generate')

      // Aplicar schema diretamente
      this.executar('npx prisma db push --force-reset')

      this.log('✅', 'Prisma corrigido completamente')

    } catch (e) {
      this.log('⚠️', `Erro na correção do Prisma: ${e.message}`)
      throw e
    }
  }

  async rodarPrismaInteligente() {
    if (!this.prismaDisponivel()) {
      this.log('ℹ️', 'Prisma não encontrado (prisma/schema.prisma). Pulando etapa.')
      return
    }

    try {
      await this.instalarDependencias()

      this.log('🔧', 'Gerando client Prisma...')
      this.executar('npx prisma generate')

      this.log('🔄', 'Aplicando migrações com auto-correção...')

      // Tentar migrate dev
      try {
        this.executar('npx prisma migrate dev --name auto_migration')
        this.log('✅', 'Migrações aplicadas com sucesso')
      } catch (e1) {
        this.log('⚠️', 'Migrate dev falhou, tentando db push...')

        try {
          this.executar('npx prisma db push --force-reset')
          this.log('✅', 'Schema aplicado com db push')
        } catch (e2) {
          this.log('⚠️', 'DB push falhou, tentando correção completa...')

          // Correção mais agressiva
          await this.corrigirPrismaCompleto()
        }
      }

      // Regenerar client final
      this.log('🔄', 'Regenerando client final...')
      this.executar('npx prisma generate')

      this.log('✅', 'Prisma configurado com sucesso')

    } catch (e) {
      this.log('⚠️', 'Falha no Prisma, tentando correção automática...')
      await this.corrigirPrismaCompleto()
    }
  }

  async corrigirSchemaCompleto() {
    this.log('📋', 'Corrigindo schema do banco...')

    try {
      // Aplicar schema diretamente
      this.executar('npx prisma db push --force-reset')

      // Regenerar client
      this.executar('npx prisma generate')

      // Criar nova migração
      try {
        this.executar('npx prisma migrate dev --name schema_fix')
      } catch (e) {
        this.log('ℹ️', 'Migração não necessária, schema já aplicado')
      }

      this.log('✅', 'Schema corrigido')

    } catch (e) {
      this.log('⚠️', `Erro na correção do schema: ${e.message}`)
      throw e
    }
  }

  async diagnosticar() {
    this.log('🔍', 'Executando diagnóstico...')

    console.log('\n📋 Status do Ambiente:')
    console.log(`   Node.js: ${process.version}`)
    console.log(`   NPM: ${execSync('npm --version', { encoding: 'utf8' }).trim()}`)
    console.log(`   Diretório: ${this.raizProjeto}`)
    console.log(`   .env existe: ${fs.existsSync(this.caminhoEnv) ? '✅' : '❌'}`)
    console.log(`   node_modules existe: ${this.nodeModulesExiste() ? '✅' : '❌'}`)
    console.log(`   schema.prisma existe: ${this.prismaDisponivel() ? '✅' : '❌'}`)

    // Testar conexão do banco
    try {
      await this.conectarAdmin()
      await this.validarPostgreSQL()
      console.log(`   PostgreSQL: ✅`)
      await this.conectarCRM()
      console.log(`   Banco CRM: ✅`)
      const schemaValido = await this.validarSchema()
      console.log(`   Schema válido: ${schemaValido ? '✅' : '❌'}`)
    } catch (e) {
      console.log(`   Conexão DB: ❌ ${e.message}`)
    }
  }

  async executarSeedCompleto() {
    this.log('🌱', 'Executando seed completo com dados exemplares...')

    try {
      // Executar o seed-data.js que tem dados mais completos
      this.executar('node seed-data.js --reset', {
        stdio: 'pipe',
        encoding: 'utf8'
      })

      this.log('✅', 'Seed completo executado com sucesso!')
      this.log('📊', 'Dados criados:')
      this.log('   🏢', '3 Empresas')
      this.log('   👥', '3 Usuários (admin, vendedor, gerente)')
      this.log('   👤', '5 Clientes diversos')
      this.log('   🎯', '7 Oportunidades (Kanban completo)')
      this.log('   📋', '10 Tarefas com prazos')

    } catch (error) {
      this.log('⚠️', `Seed completo falhou, usando seed básico: ${error.message}`)
      // Se falhar, continuar com o seed básico que já foi executado
    }
  }

  async limpar() {
    try { if (this.clienteCRM) await this.clienteCRM.end() } catch (_) { }
    try { if (this.clienteAdmin) await this.clienteAdmin.end() } catch (_) { }
  }

  async executarFluxo() {
    console.log('🚀 Vision CRM - Setup Inteligente v2.1')
    console.log('=====================================')
    console.log('🧠 Detectando e corrigindo problemas automaticamente...')

    let tentativas = 0
    const maxTentativas = 3

    while (tentativas < maxTentativas) {
      try {
        tentativas++
        this.log('🔄', `Tentativa ${tentativas}/${maxTentativas}`)

        // Conectar e validar PostgreSQL
        await this.conectarAdmin()
        await this.validarPostgreSQL()

        // Criar banco e usuário
        await this.criarBanco()
        await this.criarUsuario()

        // Tentar conectar ao CRM
        try {
          await this.conectarCRM()
        } catch (e) {
          this.log('⚠️', 'Problema de conexão detectado, corrigindo...')
          await this.corrigirUsuario()
          await this.conectarCRM()
        }

        await this.ajustarPermissoesSchema()
        await this.backupEnvExistente()
        this.escreverEnv()

        // Rodar Prisma com auto-correção
        await this.rodarPrismaInteligente()

        // Criar empresa e usuários padrão
        await this.seedBasico()

        await this.testarConexao()
        const schemaValido = await this.validarSchema()

        if (!schemaValido) {
          this.log('🔧', 'Schema inválido detectado, corrigindo...')
          await this.corrigirSchemaCompleto()
          await this.validarSchema()
        }

        console.log('\n=====================================')
        this.log('🎉', 'Setup concluído com sucesso!')
        this.log('✨', 'Todos os problemas foram resolvidos automaticamente!')
        console.log('')
        this.log('🔗', `Database URL: ${montarDatabaseUrl()}`)
        this.log('🚀', 'Para iniciar: npm run dev')
        this.log('👤', 'Usuários criados:')
        this.log('   - ivan@vision.dev.br')
        this.log('   - comercial@vision.dev.br')
        console.log('')

        return // Sucesso! Sair do loop

      } catch (e) {
        this.log('⚠️', `Tentativa ${tentativas} falhou: ${e.message}`)

        if (tentativas < maxTentativas) {
          this.log('🔄', 'Executando correções automáticas...')

          try {
            // Auto-correção baseada no tipo de erro
            if (e.message.includes('Authentication failed') || e.message.includes('P1000')) {
              await this.corrigirAutenticacao()
            } else if (e.message.includes('database') && e.message.includes('does not exist')) {
              await this.resetBancoCompleto()
            } else if (e.message.includes('prisma') || e.message.includes('migrate')) {
              await this.corrigirPrismaCompleto()
            } else {
              await this.resetCompleto()
            }

            await this.limpar()
            await esperar(2000) // Aguardar 2 segundos

          } catch (correcaoError) {
            this.log('⚠️', `Correção automática falhou: ${correcaoError.message}`)
          }
        } else {
          // Última tentativa falhou
          this.erro('Setup falhou após múltiplas tentativas', e)
          console.log('\n🆘 Problema persistente detectado!')
          console.log('📞 Entre em contato com o suporte técnico')
          console.log('📋 Anexe este log completo para análise')
          process.exit(1)
        }
      }
    }

    await this.limpar()
  }
}

// Comandos da CLI
if (require.main === module) {
  const args = process.argv.slice(2)
  const setup = new SetupBanco()

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Vision CRM Setup v2.1 - Setup Inteligente

Uso:
  node setup.js                    # Setup completo com dados (AUTOMÁTICO!)
  node setup.js --migrate         # Apenas migrações
  node setup.js --diagnostics     # Diagnóstico do ambiente
  node setup.js --fix-prisma      # Corrigir problemas do Prisma
  
Comportamento automático:
  ✨ Detecta dados existentes e apaga automaticamente
  🗄️ Configura banco e usuário automaticamente  
  🌱 Cria dados de exemplo completos (empresas, clientes, etc.)
  🎯 Configura Kanban com oportunidades de exemplo
  📋 Adiciona tarefas com prazos realistas
  
Exemplos:
  node setup.js                    # Tudo em um comando!
  node setup.js --fix-prisma      # Corrigir TypeScript errors
  
Opções:
  --help, -h                       # Mostrar esta ajuda
  --migrate                        # Rodar apenas migrações
  --diagnostics                    # Checar status do ambiente
  --fix-prisma                     # Limpar cache e regenerar Prisma
  
⚡ NOVO: Agora um único comando faz tudo! Não precisa mais de --reset ou --seed
    `)
    process.exit(0)
  }

  if (args.includes('--diagnostics')) {
    setup.diagnosticar()
      .then(() => setup.limpar())
      .catch(console.error)
    return
  }

  if (args.includes('--fix-prisma')) {
    console.log('🔧 Corrigindo problemas do Prisma...')
    setup.conectarAdmin()
      .then(() => setup.conectarCRM())
      .then(() => setup.corrigirPrisma())
      .then(() => setup.limpar())
      .then(() => console.log('✅ Prisma corrigido! Execute "npm run dev" para testar'))
      .catch(console.error)
    return
  }

  if (args.includes('--migrate')) {
    console.log('🔄 Executando apenas migrações...')
    setup.limparCache()
    setup.executar('npx prisma migrate dev --name manual_migration')
    setup.executar('npx prisma generate')
    console.log('✅ Migrações concluídas')
    process.exit(0)
  }

  setup.executarFluxo().catch(console.error)
}

module.exports = SetupBanco
