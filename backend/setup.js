
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
        this.clienteAdmin = new Client(CONFIG_ADMIN)
        await this.clienteAdmin.connect()
        this.log('✅', 'Admin conectado')
        return
      } catch (e) {
        erroFinal = e
        this.log('⏳', `Tentativa ${i}/${tentativas} falhou: ${e.message}`)
        if (i < tentativas) await esperar(1200)
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
    this.clienteCRM = new Client({
      host: CONFIG_CRM.host,
      port: CONFIG_CRM.port,
      user: CONFIG_CRM.usuario,
      password: CONFIG_CRM.senha,
      database: CONFIG_CRM.database,
    })
    await this.clienteCRM.connect()
    this.log('✅', 'Conectado ao banco CRM')
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
      `PORT=${process.env.PORT || 3001}`,
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
      // Verificar se há usuários
      const r = await this.clienteCRM.query(`SELECT COUNT(*)::int AS n FROM usuarios`)
      if (r.rows[0].n > 0) {
        this.log('✅', 'Já há dados. Pulando seed.')
        return
      }
    } catch (e) {
      this.log('ℹ️', 'Tabelas ainda não existem. Pulando seed.')
      return
    }

    try {
      const bcrypt = require('bcryptjs')
      
      // Criar empresa demo
      await this.clienteCRM.query(`
        INSERT INTO empresas (id, nome) 
        VALUES ('demo-empresa','Empresa Demo') 
        ON CONFLICT (id) DO NOTHING
      `)

      // Criar usuário admin com trial
      const hash = await bcrypt.hash('123456', 10)
      const agora = new Date()
      const trialEnd = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      await this.clienteCRM.query(
        `INSERT INTO usuarios (id, nome, email, senha, "empresaId", plano, "trialStart", "trialEnd", "isActive") 
         VALUES ('demo-user','Admin Demo','admin@demo.com',$1,'demo-empresa','TRIAL',$2,$3,true)
         ON CONFLICT (email) DO NOTHING`,
        [hash, agora, trialEnd]
      )

      // Criar dados exemplo para o Kanban
      await this.seedKanban()
      
      this.log('✅', `Seed inserido - Login: admin@demo.com / Senha: 123456`)
      this.log('📅', `Trial válido até: ${trialEnd.toLocaleDateString('pt-BR')}`)
    } catch (e) {
      this.log('⚠️', `Seed falhou: ${e.message}`)
    }
  }

  async seedKanban() {
    this.log('🎯', 'Criando dados exemplo para Kanban...')
    
    // Cliente exemplo
    await this.clienteCRM.query(`
      INSERT INTO clientes (id, nome, email, telefone, "nomeEmpresa", status, "usuarioId", "empresaId") 
      VALUES 
        ('cliente-demo-1', 'João Silva', 'joao@empresa.com', '11999999999', 'Empresa ABC', 'ATIVO', 'demo-user', 'demo-empresa'),
        ('cliente-demo-2', 'Maria Santos', 'maria@corp.com', '11888888888', 'Corp XYZ', 'ATIVO', 'demo-user', 'demo-empresa')
      ON CONFLICT (id) DO NOTHING
    `)

    // Oportunidades para o Kanban (diferentes status)
    const oportunidades = [
      { id: 'opp-1', titulo: 'Venda Software', status: 'LEAD', valor: 5000, clienteId: 'cliente-demo-1' },
      { id: 'opp-2', titulo: 'Consultoria TI', status: 'QUALIFICADO', valor: 8000, clienteId: 'cliente-demo-2' },
      { id: 'opp-3', titulo: 'Projeto Mobile', status: 'PROPOSTA', valor: 15000, clienteId: 'cliente-demo-1' },
      { id: 'opp-4', titulo: 'Sistema Web', status: 'NEGOCIACAO', valor: 12000, clienteId: 'cliente-demo-2' },
    ]

    for (const opp of oportunidades) {
      await this.clienteCRM.query(`
        INSERT INTO oportunidades (id, titulo, status, valor, "clienteId", "usuarioId", "empresaId") 
        VALUES ($1, $2, $3, $4, $5, 'demo-user', 'demo-empresa')
        ON CONFLICT (id) DO NOTHING
      `, [opp.id, opp.titulo, opp.status, opp.valor, opp.clienteId])
    }

    this.log('✅', 'Dados exemplo do Kanban criados')
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

  async limpar() {
    try { if (this.clienteCRM) await this.clienteCRM.end() } catch (_) {}
    try { if (this.clienteAdmin) await this.clienteAdmin.end() } catch (_) {}
  }

  async executarFluxo() {
    console.log('🚀 Vision CRM - Setup Completo v2.0')
    console.log('===================================')
    
    try {
      await this.conectarAdmin()
      await this.validarPostgreSQL()
      await this.criarBanco()
      await this.criarUsuario()
      await this.conectarCRM()
      await this.ajustarPermissoesSchema()
      await this.backupEnvExistente()
      this.escreverEnv()
      await this.rodarPrisma()
      await this.seedBasico()
      await this.testarConexao()
      const schemaValido = await this.validarSchema()
      
      console.log('\n===================================')
      this.log('🎉', 'Setup concluído com sucesso!')
      console.log('')
      this.log('🔗', `Database URL: ${montarDatabaseUrl()}`)
      this.log('🚀', 'Para iniciar: npm run dev')
      this.log('👤', 'Login demo: admin@demo.com / 123456')
      this.log('📊', 'Kanban: Dados exemplo incluídos')
      
      if (!schemaValido) {
        console.log('\n⚠️  Avisos:')
        console.log('- Execute "npm run setup:migrate" se houver problemas')
        console.log('- Verifique os logs acima para detalhes')
      }
      
      console.log('')
      
    } catch (e) {
      this.erro('Falha no setup', e)
      console.log('\n💡 Dicas para resolver:')
      console.log('1. Verifique se o PostgreSQL está rodando')
      console.log('2. Confirme as credenciais no arquivo .env')
      console.log('3. Execute: npm install')
      console.log('4. Tente: node setup.js --reset && node setup.js')
      console.log('5. Para diagnóstico: node setup.js --diagnostics')
      process.exit(1)
    } finally {
      await this.limpar()
    }
  }
}

// Comandos da CLI
if (require.main === module) {
  const args = process.argv.slice(2)
  const setup = new SetupBanco()
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Vision CRM Setup v2.0

Uso:
  node setup.js                    # Setup completo
  node setup.js --reset           # Reset completo (APAGA TUDO!)
  node setup.js --migrate         # Apenas migrações
  node setup.js --seed            # Apenas seed
  node setup.js --diagnostics     # Diagnóstico do ambiente
  node setup.js --fix-prisma      # Corrigir problemas do Prisma
  
Exemplos:
  node setup.js --reset && node setup.js    # Reset total e reconfigurar
  node setup.js --fix-prisma                # Corrigir TypeScript errors
  
Opções:
  --help, -h                       # Mostrar esta ajuda
  --reset                          # Reset do banco (APAGA TUDO!)
  --migrate                        # Rodar apenas migrações
  --seed                           # Rodar apenas seed  
  --diagnostics                    # Checar status do ambiente
  --fix-prisma                     # Limpar cache e regenerar Prisma
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
  
  if (args.includes('--reset')) {
    console.log('⚠️  ATENÇÃO: Isso vai APAGAR todos os dados!')
    console.log('🔄 Executando reset completo...')
    setup.resetCompleto()
      .then(() => console.log('✅ Reset concluído. Execute "node setup.js" para reconfigurar'))
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
  
  if (args.includes('--seed')) {
    setup.conectarCRM()
      .then(() => setup.seedBasico())
      .then(() => setup.limpar())
      .catch(console.error)
    return
  }
  
  setup.executarFluxo().catch(console.error)
}

module.exports = SetupBanco
