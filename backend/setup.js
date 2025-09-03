// setup.js
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
  }

  async conectarAdmin(tentativas = 5) {
    console.log('🔌 Conectando como admin...')
    let erroFinal = null
    for (let i = 1; i <= tentativas; i++) {
      try {
        this.clienteAdmin = new Client(CONFIG_ADMIN)
        await this.clienteAdmin.connect()
        console.log('✅ Admin conectado')
        return
      } catch (e) {
        erroFinal = e
        console.log(`⏳ Tentativa ${i}/${tentativas} falhou: ${e.message}`)
        await esperar(1200)
      }
    }
    throw erroFinal
  }

  async criarBanco() {
    console.log(`🗄️  Checando banco "${CONFIG_CRM.database}"...`)
    const q = `SELECT 1 FROM pg_database WHERE datname = $1`
    const r = await this.clienteAdmin.query(q, [CONFIG_CRM.database])
    if (r.rows.length) {
      console.log('✅ Banco já existe')
      return
    }
    await this.clienteAdmin.query(`CREATE DATABASE "${CONFIG_CRM.database}"`)
    console.log('✅ Banco criado')
  }

  async criarUsuario() {
    console.log(`👤 Checando usuário "${CONFIG_CRM.usuario}"...`)
    const q = `SELECT 1 FROM pg_roles WHERE rolname = $1`
    const r = await this.clienteAdmin.query(q, [CONFIG_CRM.usuario])

    if (!r.rows.length) {
      await this.clienteAdmin.query(`CREATE USER "${CONFIG_CRM.usuario}" WITH PASSWORD $1`, [CONFIG_CRM.senha])
      console.log('✅ Usuário criado')
    } else {
      await this.clienteAdmin.query(`ALTER USER "${CONFIG_CRM.usuario}" WITH PASSWORD $1`, [CONFIG_CRM.senha])
      console.log('🔒 Senha do usuário atualizada')
    }

    // Dono do DB + permissões úteis para dev
    await this.clienteAdmin.query(`ALTER DATABASE "${CONFIG_CRM.database}" OWNER TO "${CONFIG_CRM.usuario}"`)
    await this.clienteAdmin.query(`GRANT CONNECT, TEMP ON DATABASE "${CONFIG_CRM.database}" TO "${CONFIG_CRM.usuario}"`)
    await this.clienteAdmin.query(`REVOKE ALL ON DATABASE "${CONFIG_CRM.database}" FROM PUBLIC`)
    console.log('✅ Permissões básicas concedidas')
  }

  async conectarCRM() {
    console.log(`🔌 Conectando ao banco "${CONFIG_CRM.database}"...`)
    this.clienteCRM = new Client({
      host: CONFIG_CRM.host,
      port: CONFIG_CRM.port,
      user: CONFIG_CRM.usuario,
      password: CONFIG_CRM.senha,
      database: CONFIG_CRM.database,
    })
    await this.clienteCRM.connect()
    console.log('✅ Conectado ao banco CRM')
  }

  async ajustarPermissoesSchema() {
    console.log('🛡️  Ajustando permissões do schema public...')
    const c = this.clienteCRM
    await c.query(`ALTER SCHEMA public OWNER TO "${CONFIG_CRM.usuario}"`)
    await c.query(`GRANT USAGE, CREATE ON SCHEMA public TO "${CONFIG_CRM.usuario}"`)
    await c.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${CONFIG_CRM.usuario}"`)
    await c.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${CONFIG_CRM.usuario}"`)
    await c.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "${CONFIG_CRM.usuario}"`)
    console.log('✅ Permissões do schema ajustadas')
  }

  escreverEnv() {
    console.log('📝 Gerando .env...')
    const caminhoEnv = path.resolve(this.raizProjeto, '.env')
    const url = montarDatabaseUrl()
    const conteudo = [
      `DATABASE_URL="${url}"`,
      `JWT_SECRET="${process.env.JWT_SECRET || 'vision-crm-super-secret-jwt-key-2024'}"`,
      `PORT=${process.env.PORT || 5000}`,
      `NODE_ENV=${process.env.NODE_ENV || 'development'}`,
      '',
      '# (Opcional) variáveis admin locais para facilitar reexecução do setup',
      `PGHOST=${CONFIG_ADMIN.host}`,
      `PGPORT=${CONFIG_ADMIN.port}`,
      `PGUSER=${CONFIG_ADMIN.user}`,
      `PGPASSWORD=${CONFIG_ADMIN.password}`,
      `PGDB=${CONFIG_ADMIN.database}`,
      `CRM_DBNAME=${CONFIG_CRM.database}`,
      `CRM_DBUSER=${CONFIG_CRM.usuario}`,
      `CRM_DBPASS=${CONFIG_CRM.senha}`,
      `CRM_DBHOST=${CONFIG_CRM.host}`,
      `CRM_DBPORT=${CONFIG_CRM.port}`,
      '',
    ].join('\n')

    if (fs.existsSync(caminhoEnv)) {
      fs.copyFileSync(caminhoEnv, caminhoEnv + `.bak-${Date.now()}`)
    }
    fs.writeFileSync(caminhoEnv, conteudo, 'utf8')
    console.log('✅ .env escrito')
  }

  prismaDisponivel() {
    return fs.existsSync(this.caminhoPrisma)
  }

  executar(cmd) {
    execSync(cmd, { stdio: 'inherit', cwd: this.raizProjeto, timeout: 120000 })
  }

  async rodarPrisma() {
    if (!this.prismaDisponivel()) {
      console.log('ℹ️  Prisma não encontrado (prisma/schema.prisma). Pulando etapa.')
      return
    }

    console.log('📦 Instalando dependências (se necessário) e gerando client...')
    try {
      if (!fs.existsSync(path.resolve(this.raizProjeto, 'node_modules'))) {
        this.executar('npm install')
      }
    } catch (_) {}

    try {
      this.executar('npx prisma generate')
    } catch (e) {
      console.log('⚠️  prisma generate falhou, tentando novamente após instalar...')
      this.executar('npm install')
      this.executar('npx prisma generate')
    }

    console.log('🔄 Aplicando schema (db push)...')
    try {
      this.executar('npx prisma db push --skip-generate')
    } catch (e) {
      console.log('⚠️  db push falhou, mostrando status e seguindo...')
      try { this.executar('npx prisma migrate status') } catch (_) {}
    }

    console.log('✅ Prisma ok')
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
    console.log('🌱 Seed básico...')
    try {
      const r = await this.clienteCRM.query(`SELECT COUNT(*)::int AS n FROM usuarios`)
      if (r.rows[0].n > 0) {
        console.log('✅ Já há dados. Pulando seed.')
        return
      }
    } catch (_) {
      console.log('ℹ️  Tabela "usuarios" não existe ainda. Pulando seed.')
      return
    }

    try {
      await this.clienteCRM.query(`INSERT INTO empresas (id, nome) VALUES ('demo-empresa','Empresa Demo') ON CONFLICT (id) DO NOTHING`)
      const bcrypt = require('bcryptjs')
      const hash = await bcrypt.hash('123456', 10)
      await this.clienteCRM.query(
        `INSERT INTO usuarios (id, nome, email, senha, "empresaId") 
         VALUES ('demo-user','Admin Demo','admin@demo.com',$1,'demo-empresa')
         ON CONFLICT (email) DO NOTHING`,
        [hash]
      )
      console.log('✅ Seed inserido (admin@demo.com / 123456)')
    } catch (e) {
      console.log('⚠️  Seed falhou:', e.message)
    }
  }

  async testarConexao() {
    const r = await this.clienteCRM.query('SELECT NOW() as agora')
    console.log(`🧪 Conexão ok em: ${r.rows[0].agora}`)
    const tabelas = await this.listarTabelas()
    console.log('📊 Tabelas:')
    tabelas.forEach((t) => console.log('   -', t))
  }

  async limpar() {
    try { if (this.clienteCRM) await this.clienteCRM.end() } catch (_) {}
    try { if (this.clienteAdmin) await this.clienteAdmin.end() } catch (_) {}
  }

  async executarFluxo() {
    console.log('🚀 Setup Vision CRM\n==============================')
    try {
      await this.conectarAdmin()
      await this.criarBanco()
      await this.criarUsuario()
      await this.conectarCRM()
      await this.ajustarPermissoesSchema()
      this.escreverEnv()
      await this.rodarPrisma()
      await this.seedBasico()
      await this.testarConexao()
      console.log('==============================\n✅ Setup concluído!')
      console.log(`URL: ${montarDatabaseUrl()}\n`)
      console.log('🎯 Para iniciar: npm run dev')
    } catch (e) {
      console.error('❌ Falha no setup:', e.message)
      process.exit(1)
    } finally {
      await this.limpar()
    }
  }
}

if (require.main === module) {
  const setup = new SetupBanco()
  setup.executarFluxo().catch(console.error)
}

module.exports = SetupBanco
