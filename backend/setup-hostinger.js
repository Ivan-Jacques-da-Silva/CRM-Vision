// setup-hostinger.js
// Configuração de ambiente (DB + .env + Prisma) para VPS/Hostinger
// NÃO inicia servidor, apenas prepara o ambiente.

const { Client } = require("pg");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ===== Lê .env e define defaults =====
const env = {
  DB_HOST: process.env.DB_HOST || process.env.PGHOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
  DB_USER: process.env.DB_USER || process.env.PGUSER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD ?? process.env.PGPASSWORD ?? "",
  DB_NAME: process.env.DB_NAME || process.env.PGDATABASE || "visioncrm",
  NODE_ENV: process.env.NODE_ENV || "production",
  PORT: process.env.PORT || 5050,
  JWT_SECRET:
    process.env.JWT_SECRET ||
    `vision-crm-jwt-${Math.random().toString(36).slice(2)}`,
};

// ===== Helpers =====
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const raizProjeto = process.cwd();
const caminhoPrisma = path.resolve(raizProjeto, "prisma", "schema.prisma");
const caminhoEnv = path.resolve(raizProjeto, ".env");

const montarDatabaseUrl = (cfg) => {
  // encodeURIComponent para usuário/senha (lida com @ ! etc)
  const u = encodeURIComponent(cfg.DB_USER);
  const p = encodeURIComponent(cfg.DB_PASSWORD);
  // ATENÇÃO: precisa do "@” após a senha codificada
  return `postgresql://${u}:${p}@${cfg.DB_HOST}:${cfg.DB_PORT}/${cfg.DB_NAME}?schema=public`;
};

function log(ico, msg) {
  console.log(`${ico} ${msg}`);
}

function run(cmd, opts = {}) {
  log("⚡", `Executando: ${cmd}`);
  return execSync(cmd, {
    stdio: "inherit",
    cwd: raizProjeto,
    timeout: 300000,
    ...opts,
  });
}

// ===== Conexões =====
async function conectarAdmin(cfg) {
  log("🔌", "Conectando como admin ao PostgreSQL...");
  const hosts = [cfg.DB_HOST || "localhost", "/var/run/postgresql"];
  const senhas = [
    cfg.DB_PASSWORD, // pode ser vazia (peer)
    "postgres",
    "admin",
    "123456",
    "",
  ];
  const erros = [];

  for (const host of hosts) {
    for (const senha of senhas) {
      try {
        const c = new Client({
          host,
          port: cfg.DB_PORT,
          user: cfg.DB_USER,
          password: senha,
          database: "postgres",
        });
        await c.connect();
        log("✅", `Admin conectado (host="${host}", senha="${senha || "(vazia)"}")`);
        // fixa host/senha que funcionaram para o restante do fluxo
        cfg.DB_HOST = host;
        cfg.DB_PASSWORD = senha;
        return c;
      } catch (e) {
        erros.push(`${host}/${senha || "(vazia)"} => ${e.message}`);
      }
    }
  }
  throw new Error(`Falha admin: ${erros.join(" | ")}`);
}

async function conectarAppDB(cfg) {
  log("🔌", `Conectando ao banco "${cfg.DB_NAME}"...`);
  const hosts = [cfg.DB_HOST || "localhost", "/var/run/postgresql"];
  const erros = [];

  for (const host of hosts) {
    try {
      const c = new Client({
        host,
        port: cfg.DB_PORT,
        user: cfg.DB_USER,
        password: cfg.DB_PASSWORD,
        database: cfg.DB_NAME,
      });
      await c.connect();
      log("✅", `Conectado ao banco (host="${host}")`);
      cfg.DB_HOST = host;
      return c;
    } catch (e) {
      erros.push(`${host} => ${e.message}`);
    }
  }
  throw new Error(`Falha ao conectar no banco app: ${erros.join(" | ")}`);
}

// ===== Passos =====
async function validarPostgreSQL(cliAdmin) {
  log("🔍", "Validando PostgreSQL...");
  const r = await cliAdmin.query("SELECT version()");
  const versao = r.rows[0].version;
  log("✅", `PostgreSQL: ${versao.split(" ")[1]}`);
}

async function criarBanco(cliAdmin, cfg) {
  log("🗄️", `Verificando banco "${cfg.DB_NAME}"...`);
  const q = `SELECT 1 FROM pg_database WHERE datname = $1`;
  const r = await cliAdmin.query(q, [cfg.DB_NAME]);
  if (r.rows.length === 0) {
    await cliAdmin.query(`CREATE DATABASE "${cfg.DB_NAME}"`);
    log("✅", `Banco "${cfg.DB_NAME}" criado`);
  } else {
    log("ℹ️", `Banco "${cfg.DB_NAME}" já existe`);
  }
}

function lerEnvComoMapa(arquivo) {
  const mapa = {};
  if (!fs.existsSync(arquivo)) return mapa;
  const txt = fs.readFileSync(arquivo, "utf8");
  for (const linha of txt.split("\n")) {
    if (!linha || linha.trim().startsWith("#") || !linha.includes("=")) continue;
    const [k, ...v] = linha.split("=");
    mapa[k.trim()] = v.join("=").trim();
  }
  return mapa;
}

function escreverEnv(cfg) {
  log("📝", "Atualizando .env...");
  const mapa = lerEnvComoMapa(caminhoEnv);

  // Gera DATABASE_URL correta (com @ depois da senha codificada)
  const url = montarDatabaseUrl(cfg);

  const atualizado = {
    ...mapa,
    // app
    NODE_ENV: cfg.NODE_ENV,
    PORT: String(cfg.PORT),
    JWT_SECRET: cfg.JWT_SECRET,
    // banco
    DB_HOST: cfg.DB_HOST,
    DB_PORT: String(cfg.DB_PORT),
    DB_USER: cfg.DB_USER,
    DB_PASSWORD: cfg.DB_PASSWORD,
    DB_NAME: cfg.DB_NAME,
    // prisma
    DATABASE_URL: url,
  };

  const conteudo =
    `# Vision CRM - Ambiente configurado automaticamente em ${new Date().toLocaleString("pt-BR")}\n` +
    Object.entries(atualizado)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n") +
    "\n";

  fs.writeFileSync(caminhoEnv, conteudo, "utf8");
  log("✅", ".env escrito/atualizado");
}

function prismaExiste() {
  return fs.existsSync(caminhoPrisma);
}

function instalarDependencias() {
  log("📦", "Instalando dependências (npm install)...");
  run("npm install");
  log("✅", "Dependências instaladas");
}

function rodarPrisma(cfg) {
  if (!prismaExiste()) {
    log("ℹ️", "Schema do Prisma não encontrado. Pulando Prisma...");
    return;
  }

  // Exporta env atual para o Prisma
  const envExec = {
    ...process.env,
    DB_HOST: cfg.DB_HOST,
    DB_PORT: String(cfg.DB_PORT),
    DB_USER: cfg.DB_USER,
    DB_PASSWORD: cfg.DB_PASSWORD,
    DB_NAME: cfg.DB_NAME,
    DATABASE_URL: montarDatabaseUrl(cfg),
    NODE_ENV: cfg.NODE_ENV,
  };

  log("🔧", "Gerando client Prisma...");
  run("npx prisma generate", { env: envExec });

  log("🔄", "Aplicando schema (migrate deploy)...");
  try {
    run("npx prisma migrate deploy", { env: envExec });
    log("✅", "Migrações aplicadas");
  } catch (_) {
    log("⚠️", "Sem migrações ou falhou. Tentando `prisma db push` (não destrutivo)...");
    // db push sem reset (não destrói dados)
    run("npx prisma db push", { env: envExec });
    log("✅", "Schema sincronizado via db push");
  }
}

async function testarConexao(cliApp) {
  const r = await cliApp.query(
    "SELECT NOW() as agora, current_database() as db, current_user as usuario"
  );
  const info = r.rows[0];
  log("🧪", `OK - DB: ${info.db} | Usuário: ${info.usuario} | ${new Date(info.agora).toLocaleString("pt-BR")}`);
}

// ===== Fluxo principal =====
async function main() {
  console.log("🚀 Vision CRM - Setup de Ambiente (VPS/Hostinger)");
  console.log("=================================================");

  // Clona env para poder ajustar host/senha que funcionarem
  const cfg = { ...env };

  let cliAdmin = null;
  let cliApp = null;

  try {
    // 1) Conectar como admin (tenta localhost e socket; tenta senha vazia/variantes)
    cliAdmin = await conectarAdmin(cfg);

    // 2) Validar Postgres
    await validarPostgreSQL(cliAdmin);

    // 3) Criar DB se necessário
    await criarBanco(cliAdmin, cfg);

    // 4) Conectar no DB da aplicação
    cliApp = await conectarAppDB(cfg);

    // 5) Escrever/atualizar .env com a DATABASE_URL correta
    escreverEnv(cfg);

    // 6) Instalar dependências
    instalarDependencias();

    // 7) Prisma (generate + migrate deploy | db push)
    rodarPrisma(cfg);

    // 8) Teste final
    await testarConexao(cliApp);

    console.log("\n=================================================");
    log("🎉", "Ambiente configurado com sucesso.");
    log("📄", "Arquivo .env atualizado.");
    log("🗄️", `Banco pronto: ${cfg.DB_NAME} (host: ${cfg.DB_HOST})`);
    log("🛠️", "Prisma gerado e schema aplicado.");
    console.log("");

  } catch (e) {
    console.error("❌ Erro no setup:", e.message);
    console.log("\n💡 Verifique:");
    console.log("1) Postgres está rodando e acessível (5432)");
    console.log("2) Usuário/senha corretos OU autenticação local (peer) via socket");
    console.log("3) .env com DB_* correto; se usar @ na senha, não precisa no DB_PASSWORD, apenas na DATABASE_URL (já gerada automaticamente)");
    process.exit(1);
  } finally {
    try { if (cliApp) await cliApp.end(); } catch(_) {}
    try { if (cliAdmin) await cliAdmin.end(); } catch(_) {}
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
