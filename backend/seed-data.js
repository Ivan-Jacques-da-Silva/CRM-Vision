
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class SeedData {
  constructor() {
    this.log = (emoji, mensagem) => console.log(`${emoji} ${mensagem}`);
  }

  async limparDadosExistentes() {
    this.log('🧹', 'Limpando dados existentes...');
    
    try {
      // Deletar em ordem devido às relações
      await prisma.tarefa.deleteMany({});
      await prisma.oportunidade.deleteMany({});
      await prisma.cliente.deleteMany({});
      await prisma.usuario.deleteMany({});
      await prisma.empresa.deleteMany({});
      
      this.log('✅', 'Dados limpos com sucesso');
    } catch (error) {
      this.log('⚠️', `Erro ao limpar dados: ${error.message}`);
    }
  }

  async criarEmpresas() {
    this.log('🏢', 'Criando empresas...');
    
    const empresas = [
      {
        id: 'empresa-demo',
        nome: 'Vision CRM Demo Corp'
      },
      {
        id: 'empresa-tech',
        nome: 'TechSolutions Ltda'
      },
      {
        id: 'empresa-startup',
        nome: 'StartupLab Inovação'
      }
    ];

    for (const empresa of empresas) {
      await prisma.empresa.create({
        data: empresa
      });
    }

    this.log('✅', `${empresas.length} empresas criadas`);
    return empresas;
  }

  async criarUsuarios() {
    this.log('👥', 'Criando usuários...');
    
    const senhaHash = await bcrypt.hash('123456', 10);
    const agora = new Date();
    const trialEnd = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    const usuarios = [
      {
        id: 'user-admin',
        nome: 'Admin Vision',
        email: 'admin@demo.com',
        senha: senhaHash,
        empresaId: 'empresa-demo',
        plano: 'PREMIUM',
        trialStart: agora,
        trialEnd: trialEnd,
        isActive: true
      },
      {
        id: 'user-vendedor',
        nome: 'Carlos Vendedor',
        email: 'vendedor@demo.com',
        senha: senhaHash,
        empresaId: 'empresa-demo',
        plano: 'PREMIUM',
        trialStart: agora,
        trialEnd: trialEnd,
        isActive: true
      },
      {
        id: 'user-gerente',
        nome: 'Ana Gerente',
        email: 'gerente@demo.com',
        senha: senhaHash,
        empresaId: 'empresa-tech',
        plano: 'TRIAL',
        trialStart: agora,
        trialEnd: trialEnd,
        isActive: true
      }
    ];

    for (const usuario of usuarios) {
      await prisma.usuario.create({
        data: usuario
      });
    }

    this.log('✅', `${usuarios.length} usuários criados`);
    return usuarios;
  }

  async criarClientes() {
    this.log('👤', 'Criando clientes...');
    
    const clientes = [
      {
        id: 'cliente-001',
        nome: 'João Silva Santos',
        email: 'joao.silva@empresaabc.com.br',
        telefone: '(11) 99999-1111',
        nomeEmpresa: 'Empresa ABC Ltda',
        cargo: 'Diretor Comercial',
        endereco: 'Av. Paulista, 1000 - São Paulo/SP',
        observacoes: 'Cliente interessado em soluções de automação. Reunião agendada para próxima semana.',
        status: 'ATIVO',
        fonte: 'INDICACAO',
        tags: ['vip', 'automacao', 'grande-porte'],
        usuarioId: 'user-admin',
        empresaId: 'empresa-demo'
      },
      {
        id: 'cliente-002',
        nome: 'Maria Santos Oliveira',
        email: 'maria@startupxyz.com',
        telefone: '(11) 98888-2222',
        nomeEmpresa: 'Startup XYZ',
        cargo: 'CEO',
        endereco: 'Rua Oscar Freire, 500 - São Paulo/SP',
        observacoes: 'Startup em crescimento, busca CRM escalável.',
        status: 'ATIVO',
        fonte: 'WEBSITE',
        tags: ['startup', 'crescimento', 'tech'],
        usuarioId: 'user-vendedor',
        empresaId: 'empresa-demo'
      },
      {
        id: 'cliente-003',
        nome: 'Pedro Costa Lima',
        email: 'pedro@industrialtech.com.br',
        telefone: '(11) 97777-3333',
        nomeEmpresa: 'Industrial Tech S/A',
        cargo: 'Gerente de TI',
        endereco: 'Rod. Anhanguera, Km 25 - Osasco/SP',
        observacoes: 'Empresa industrial interessada em digitalização de processos.',
        status: 'ATIVO',
        fonte: 'FEIRA',
        tags: ['industrial', 'digitalizacao', 'medio-porte'],
        usuarioId: 'user-admin',
        empresaId: 'empresa-demo'
      },
      {
        id: 'cliente-004',
        nome: 'Carla Mendes Rocha',
        email: 'carla@ecommercepro.com',
        telefone: '(11) 96666-4444',
        nomeEmpresa: 'E-commerce Pro',
        cargo: 'Diretora de Marketing',
        endereco: 'Rua Augusta, 800 - São Paulo/SP',
        observacoes: 'Precisa integrar CRM com plataforma de e-commerce.',
        status: 'ATIVO',
        fonte: 'GOOGLE_ADS',
        tags: ['ecommerce', 'marketing', 'integracao'],
        usuarioId: 'user-vendedor',
        empresaId: 'empresa-demo'
      },
      {
        id: 'cliente-005',
        nome: 'Roberto Ferreira',
        email: 'roberto@consultoriaabc.com',
        telefone: '(11) 95555-5555',
        nomeEmpresa: 'Consultoria ABC',
        cargo: 'Sócio-Diretor',
        endereco: 'Av. Brigadeiro Faria Lima, 1500 - São Paulo/SP',
        observacoes: 'Consultoria que atende múltiplos clientes, precisa organizar leads.',
        status: 'INATIVO',
        fonte: 'LINKEDIN',
        tags: ['consultoria', 'b2b', 'organizacao'],
        usuarioId: 'user-gerente',
        empresaId: 'empresa-tech'
      }
    ];

    for (const cliente of clientes) {
      await prisma.cliente.create({
        data: cliente
      });
    }

    this.log('✅', `${clientes.length} clientes criados`);
    return clientes;
  }

  async criarOportunidades() {
    this.log('🎯', 'Criando oportunidades para Kanban...');
    
    const oportunidades = [
      {
        id: 'opp-001',
        titulo: 'Implementação CRM Completo - Empresa ABC',
        descricao: 'Projeto completo de implementação do CRM com customizações específicas para o setor industrial.',
        valor: 85000.00,
        status: 'LEAD',
        prioridade: 'ALTA',
        dataPrevisao: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
        clienteId: 'cliente-001',
        usuarioId: 'user-admin',
        empresaId: 'empresa-demo'
      },
      {
        id: 'opp-002',
        titulo: 'CRM para Startup - Plano Growth',
        descricao: 'Configuração do CRM para startup em fase de crescimento com foco em automação de vendas.',
        valor: 25000.00,
        status: 'QUALIFICADO',
        prioridade: 'MEDIA',
        dataPrevisao: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
        clienteId: 'cliente-002',
        usuarioId: 'user-vendedor',
        empresaId: 'empresa-demo'
      },
      {
        id: 'opp-003',
        titulo: 'Digitalização de Processos Industriais',
        descricao: 'Projeto de digitalização completa dos processos de vendas e relacionamento com clientes.',
        valor: 120000.00,
        status: 'PROPOSTA',
        prioridade: 'ALTA',
        dataPrevisao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        clienteId: 'cliente-003',
        usuarioId: 'user-admin',
        empresaId: 'empresa-demo'
      },
      {
        id: 'opp-004',
        titulo: 'Integração CRM + E-commerce',
        descricao: 'Integração completa entre CRM e plataforma de e-commerce existente.',
        valor: 45000.00,
        status: 'NEGOCIACAO',
        prioridade: 'ALTA',
        dataPrevisao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        clienteId: 'cliente-004',
        usuarioId: 'user-vendedor',
        empresaId: 'empresa-demo'
      },
      {
        id: 'opp-005',
        titulo: 'CRM Multi-cliente para Consultoria',
        descricao: 'Solução customizada para gestão de múltiplos clientes da consultoria.',
        valor: 35000.00,
        status: 'FECHADO',
        prioridade: 'MEDIA',
        dataPrevisao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás (já fechado)
        clienteId: 'cliente-005',
        usuarioId: 'user-gerente',
        empresaId: 'empresa-tech'
      },
      {
        id: 'opp-006',
        titulo: 'Expansão CRM - Módulo Financeiro',
        descricao: 'Adição de módulo financeiro ao CRM existente da Empresa ABC.',
        valor: 30000.00,
        status: 'LEAD',
        prioridade: 'BAIXA',
        dataPrevisao: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
        clienteId: 'cliente-001',
        usuarioId: 'user-admin',
        empresaId: 'empresa-demo'
      },
      {
        id: 'opp-007',
        titulo: 'Treinamento Avançado CRM',
        descricao: 'Programa completo de treinamento para equipe da startup.',
        valor: 8000.00,
        status: 'QUALIFICADO',
        prioridade: 'BAIXA',
        dataPrevisao: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 dias
        clienteId: 'cliente-002',
        usuarioId: 'user-vendedor',
        empresaId: 'empresa-demo'
      }
    ];

    for (const oportunidade of oportunidades) {
      await prisma.oportunidade.create({
        data: oportunidade
      });
    }

    this.log('✅', `${oportunidades.length} oportunidades criadas`);
    return oportunidades;
  }

  async criarTarefas() {
    this.log('📋', 'Criando tarefas...');
    
    const tarefas = [
      {
        id: 'task-001',
        titulo: 'Ligar para João Silva - Follow-up proposta',
        descricao: 'Acompanhar interesse na proposta de CRM e esclarecer dúvidas técnicas.',
        status: 'PENDENTE',
        prioridade: 'ALTA',
        dataVencimento: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // amanhã
        clienteId: 'cliente-001',
        oportunidadeId: 'opp-001',
        usuarioId: 'user-admin'
      },
      {
        id: 'task-002',
        titulo: 'Preparar apresentação para Startup XYZ',
        descricao: 'Criar apresentação customizada mostrando cases de sucesso com startups.',
        status: 'EM_PROGRESSO',
        prioridade: 'ALTA',
        dataVencimento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias
        clienteId: 'cliente-002',
        oportunidadeId: 'opp-002',
        usuarioId: 'user-vendedor'
      },
      {
        id: 'task-003',
        titulo: 'Enviar proposta técnica - Industrial Tech',
        descricao: 'Finalizar e enviar proposta detalhada com cronograma de implementação.',
        status: 'PENDENTE',
        prioridade: 'ALTA',
        dataVencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
        clienteId: 'cliente-003',
        oportunidadeId: 'opp-003',
        usuarioId: 'user-admin'
      },
      {
        id: 'task-004',
        titulo: 'Reunião de negociação - E-commerce Pro',
        descricao: 'Reunião para discussão de valores e prazos da integração.',
        status: 'PENDENTE',
        prioridade: 'ALTA',
        dataVencimento: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // amanhã
        clienteId: 'cliente-004',
        oportunidadeId: 'opp-004',
        usuarioId: 'user-vendedor'
      },
      {
        id: 'task-005',
        titulo: 'Documentar processo de venda fechada',
        descricao: 'Documentar lições aprendidas da venda para Consultoria ABC.',
        status: 'CONCLUIDA',
        prioridade: 'MEDIA',
        dataVencimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        clienteId: 'cliente-005',
        oportunidadeId: 'opp-005',
        usuarioId: 'user-gerente'
      },
      {
        id: 'task-006',
        titulo: 'Qualificar lead - Módulo Financeiro',
        descricao: 'Entender melhor a necessidade do módulo financeiro.',
        status: 'PENDENTE',
        prioridade: 'MEDIA',
        dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        clienteId: 'cliente-001',
        oportunidadeId: 'opp-006',
        usuarioId: 'user-admin'
      },
      {
        id: 'task-007',
        titulo: 'Enviar material de treinamento',
        descricao: 'Enviar cronograma e conteúdo programático do treinamento.',
        status: 'PENDENTE',
        prioridade: 'BAIXA',
        dataVencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
        clienteId: 'cliente-002',
        oportunidadeId: 'opp-007',
        usuarioId: 'user-vendedor'
      },
      {
        id: 'task-008',
        titulo: 'Análise de concorrência',
        descricao: 'Pesquisar soluções concorrentes para embasar argumentação.',
        status: 'EM_PROGRESSO',
        prioridade: 'MEDIA',
        dataVencimento: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 dias
        clienteId: null,
        oportunidadeId: null,
        usuarioId: 'user-admin'
      },
      {
        id: 'task-009',
        titulo: 'Atualizar material de marketing',
        descricao: 'Revisar e atualizar apresentações comerciais.',
        status: 'PENDENTE',
        prioridade: 'BAIXA',
        dataVencimento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
        clienteId: null,
        oportunidadeId: null,
        usuarioId: 'user-vendedor'
      },
      {
        id: 'task-010',
        titulo: 'Revisar métricas do trimestre',
        descricao: 'Analisar performance de vendas e identificar oportunidades.',
        status: 'PENDENTE',
        prioridade: 'ALTA',
        dataVencimento: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 dias
        clienteId: null,
        oportunidadeId: null,
        usuarioId: 'user-gerente'
      }
    ];

    for (const tarefa of tarefas) {
      await prisma.tarefa.create({
        data: tarefa
      });
    }

    this.log('✅', `${tarefas.length} tarefas criadas`);
    return tarefas;
  }

  async executarSeedCompleto() {
    console.log('🌱 Vision CRM - Seed de Dados Exemplares');
    console.log('=========================================');
    
    try {
      await this.limparDadosExistentes();
      
      const empresas = await this.criarEmpresas();
      const usuarios = await this.criarUsuarios();
      const clientes = await this.criarClientes();
      const oportunidades = await this.criarOportunidades();
      const tarefas = await this.criarTarefas();
      
      console.log('\n📊 Resumo dos dados criados:');
      console.log(`   🏢 Empresas: ${empresas.length}`);
      console.log(`   👥 Usuários: ${usuarios.length}`);
      console.log(`   👤 Clientes: ${clientes.length}`);
      console.log(`   🎯 Oportunidades: ${oportunidades.length}`);
      console.log(`   📋 Tarefas: ${tarefas.length}`);
      
      console.log('\n🔐 Credenciais de acesso:');
      console.log('   Admin: admin@demo.com / 123456');
      console.log('   Vendedor: vendedor@demo.com / 123456');
      console.log('   Gerente: gerente@demo.com / 123456');
      
      console.log('\n🎯 Kanban configurado com:');
      console.log('   📊 LEADs: 2 oportunidades');
      console.log('   ✅ QUALIFICADOs: 2 oportunidades');
      console.log('   📝 PROPOSTAs: 1 oportunidade');
      console.log('   🤝 NEGOCIAÇÃOs: 1 oportunidade');
      console.log('   🎉 FECHADOs: 1 oportunidade');
      
      console.log('\n✨ Seed concluído com sucesso!');
      console.log('🚀 Execute: npm run dev (no backend)');
      
    } catch (error) {
      console.error('❌ Erro durante o seed:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  async executarSeedApenas() {
    console.log('🌱 Vision CRM - Seed Incremental (sem limpar dados)');
    console.log('===============================================');
    
    try {
      // Verificar se já existem dados
      const usuariosExistentes = await prisma.usuario.count();
      
      if (usuariosExistentes > 0) {
        this.log('ℹ️', `Encontrados ${usuariosExistentes} usuários existentes`);
        this.log('⚠️', 'Para seed completo, use: node seed-data.js --reset');
        return;
      }
      
      await this.criarEmpresas();
      await this.criarUsuarios();
      await this.criarClientes();
      await this.criarOportunidades();
      await this.criarTarefas();
      
      this.log('✅', 'Seed incremental concluído!');
      
    } catch (error) {
      console.error('❌ Erro durante o seed incremental:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const seed = new SeedData();
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🌱 Vision CRM - Seed de Dados v1.0

Uso:
  node seed-data.js                    # Seed incremental (preserva dados)
  node seed-data.js --reset           # Limpa tudo e cria dados novos
  node seed-data.js --help            # Mostra esta ajuda

Dados criados:
  - 3 Empresas de exemplo
  - 3 Usuários (admin, vendedor, gerente)
  - 5 Clientes diversos
  - 7 Oportunidades (distribuídas no Kanban)
  - 10 Tarefas (algumas com prazos urgentes)

Credenciais:
  admin@demo.com / 123456 (PREMIUM)
  vendedor@demo.com / 123456 (PREMIUM)  
  gerente@demo.com / 123456 (TRIAL)
    `);
    process.exit(0);
  }
  
  if (args.includes('--reset')) {
    seed.executarSeedCompleto().catch(console.error);
  } else {
    seed.executarSeedApenas().catch(console.error);
  }
}

module.exports = SeedData;
