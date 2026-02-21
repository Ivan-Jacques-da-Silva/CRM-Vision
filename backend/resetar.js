const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const senhaPadrao = 'vision@a1b2c3';

  console.log('🧹 Resetando banco e recriando dados base (Vision)...');

  await prisma.atividadeOportunidade.deleteMany({});
  await prisma.tarefa.deleteMany({});
  await prisma.oportunidade.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.pipelineKanban.deleteMany({});
  await prisma.empresa.deleteMany({});

  console.log('✅ Dados antigos removidos.');

  const empresa = await prisma.empresa.create({
    data: {
      nome: 'Vision',
    },
  });

  const senhaHash = await bcrypt.hash(senhaPadrao, 10);
  const agora = new Date();
  const trialEnd = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);

  const baseUsuario = {
    senha: senhaHash,
    empresaId: empresa.id,
    plano: 'TRIAL',
    trialStart: agora,
    trialEnd,
    isActive: true,
  };

  await prisma.usuario.create({
    data: {
      nome: 'Ivan',
      email: 'ivan@vision.dev.br',
      ...baseUsuario,
    },
  });

  await prisma.usuario.create({
    data: {
      nome: 'David',
      email: 'david@vision.dev.br',
      ...baseUsuario,
    },
  });

  console.log('✅ Empresa Vision criada com usuários:');
  console.log('   - ivan@vision.dev.br');
  console.log('   - david@vision.dev.br');
  console.log('🔐 Senha padrão: vision@a1b2c3');
  console.log('🎯 Reset concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
