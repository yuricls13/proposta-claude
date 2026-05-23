import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed iniciado...');

  // Limpar dados
  await prisma.proposalSectionView.deleteMany();
  await prisma.proposalEvent.deleteMany();
  await prisma.acceptance.deleteMany();
  await prisma.rejection.deleteMany();
  await prisma.proposalItem.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.proposalTemplate.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ─── Usuários ─────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const owner = await prisma.user.create({
    data: {
      email: 'demo@proposta.app',
      name: 'Yuri Cardoso',
      passwordHash,
    },
  });

  const member = await prisma.user.create({
    data: {
      email: 'time@proposta.app',
      name: 'Ana Beatriz Lima',
      passwordHash,
    },
  });

  console.log(`✓ Usuários: ${owner.email}, ${member.email}`);

  // ─── Workspace principal ──────────────────────────────────
  const workspace = await prisma.workspace.create({
    data: {
      slug: 'studio-demo',
      name: 'Studio Demo',
      ownerId: owner.id,
      accentColor: '#2F5D50',
      fontPair: 'editorial',
      plan: 'PRO',
      brandTone: 'Próximo, consultivo e direto. Foco em resultados.',
      members: {
        create: [
          { userId: owner.id, role: 'OWNER' },
          { userId: member.id, role: 'ADMIN' },
        ],
      },
    },
  });

  await prisma.user.update({
    where: { id: owner.id },
    data: { activeWorkspaceId: workspace.id },
  });

  await prisma.user.update({
    where: { id: member.id },
    data: { activeWorkspaceId: workspace.id },
  });

  console.log(`✓ Workspace criado: ${workspace.name}`);

  // ─── Templates ────────────────────────────────────────────
  const templates = await Promise.all([
    prisma.proposalTemplate.create({
      data: {
        workspaceId: workspace.id,
        name: 'Site Institucional',
        description: 'Template para propostas de criação de site institucional',
        category: 'desenvolvimento',
        titleTemplate: 'Site institucional para {{cliente.empresa}}',
        bodyTemplate: `Olá {{cliente.nome}},

Preparamos uma proposta dedicada para o desenvolvimento do site institucional da **{{cliente.empresa}}**, focado em performance, identidade visual marcante e conversão.

## O que está incluso
- Design exclusivo e responsivo
- 4 páginas (Home, Sobre, Serviços, Contato)
- Otimização SEO técnica
- CMS para você atualizar conteúdo
- Hospedagem nos 3 primeiros meses`,
        notesTemplate: 'Pagamento em 3 parcelas (entrada + 2x). Início em até 5 dias úteis após aprovação.',
        defaultItems: JSON.stringify([
          { description: 'Design e identidade visual da página', quantity: 1, unitPrice: 2800 },
          { description: 'Desenvolvimento front-end (4 páginas)', quantity: 1, unitPrice: 4500 },
          { description: 'Otimização SEO técnica', quantity: 1, unitPrice: 1200 },
        ]),
      },
    }),
    prisma.proposalTemplate.create({
      data: {
        workspaceId: workspace.id,
        name: 'Consultoria de Marketing',
        description: 'Pacote trimestral de consultoria de marketing digital',
        category: 'consultoria',
        titleTemplate: 'Consultoria de marketing para {{cliente.empresa}}',
        bodyTemplate: `{{cliente.nome}}, segue nossa proposta de consultoria de marketing para a {{cliente.empresa}}.

## Abordagem
- 4 reuniões mensais (1h cada)
- Planejamento estratégico trimestral
- Pauta editorial completa
- Relatório mensal de métricas`,
        defaultItems: JSON.stringify([
          { description: 'Consultoria estratégica mensal', quantity: 3, unitPrice: 1500 },
          { description: 'Planejamento editorial', quantity: 3, unitPrice: 800 },
          { description: 'Relatório mensal de métricas', quantity: 3, unitPrice: 500 },
        ]),
      },
    }),
    prisma.proposalTemplate.create({
      data: {
        workspaceId: workspace.id,
        name: 'Identidade Visual',
        description: 'Pacote completo de identidade visual + manual da marca',
        category: 'design',
        titleTemplate: 'Identidade visual para {{cliente.empresa}}',
        bodyTemplate: `{{cliente.nome}}, esta é a nossa proposta para construir a nova identidade visual da {{cliente.empresa}}.

## Entregáveis
- Pesquisa de marca e moodboard
- 3 conceitos de logotipo
- Manual da marca (PDF)
- Aplicações principais (cartão, e-mail, social)`,
        defaultItems: JSON.stringify([
          { description: 'Pesquisa de marca e moodboard', quantity: 1, unitPrice: 2500 },
          { description: 'Criação de logotipo (3 conceitos + ajustes)', quantity: 1, unitPrice: 4800 },
          { description: 'Manual da marca completo', quantity: 1, unitPrice: 3200 },
          { description: 'Aplicações principais', quantity: 1, unitPrice: 1800 },
        ]),
      },
    }),
  ]);
  console.log(`✓ ${templates.length} templates criados`);

  // ─── Propostas ────────────────────────────────────────────
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const days = (n: number) => new Date(now.getTime() + n * oneDay);

  // 1. Rascunho
  await prisma.proposal.create({
    data: {
      workspaceId: workspace.id,
      createdById: owner.id,
      slug: nanoid(8),
      title: 'Site institucional para Padaria Ouro & Trigo',
      description:
        'Desenvolvimento de site institucional com cardápio digital, integração com WhatsApp e área de notícias da padaria. Mobile-first.',
      clientName: 'Joana Pereira',
      clientCompany: 'Padaria Ouro & Trigo',
      clientEmail: 'joana@ourotrigo.com.br',
      status: 'DRAFT',
      notes: 'Pendente confirmação de prazo com a equipe de design.',
      validUntil: days(20),
      items: {
        create: [
          { description: 'Design e identidade visual da página', quantity: 1, unitPrice: 2800, order: 0 },
          { description: 'Desenvolvimento front-end (4 páginas)', quantity: 1, unitPrice: 4500, order: 1 },
          { description: 'Integração WhatsApp + Google Maps', quantity: 1, unitPrice: 800, order: 2 },
        ],
      },
      events: { create: [{ type: 'CREATED', createdAt: days(-1) }] },
    },
  });

  // 2. Enviada
  await prisma.proposal.create({
    data: {
      workspaceId: workspace.id,
      createdById: owner.id,
      slug: nanoid(8),
      title: 'Consultoria de marketing digital - Q3',
      description:
        'Pacote trimestral de consultoria de marketing digital com 4 reuniões mensais, planejamento estratégico, criação de pauta editorial e acompanhamento de métricas.',
      clientName: 'Roberto Santos',
      clientCompany: 'Santos & Filhos Comércio LTDA',
      clientEmail: 'rsantos@santosefilhos.com',
      status: 'SENT',
      sentAt: days(-2),
      notes: 'Cliente pediu para detalhar especificamente quantas peças gráficas estão inclusas no escopo mensal.',
      validUntil: days(15),
      items: {
        create: [
          { description: 'Consultoria estratégica (3 meses)', quantity: 3, unitPrice: 1500, order: 0 },
          { description: 'Planejamento editorial mensal', quantity: 3, unitPrice: 800, order: 1 },
          { description: 'Relatório mensal de métricas', quantity: 3, unitPrice: 500, order: 2 },
        ],
      },
      events: {
        create: [
          { type: 'CREATED', createdAt: days(-3) },
          { type: 'SENT', createdAt: days(-2) },
        ],
      },
    },
  });

  // 3. Visualizada
  await prisma.proposal.create({
    data: {
      workspaceId: workspace.id,
      createdById: owner.id,
      slug: nanoid(8),
      title: 'Aplicativo de delivery para restaurante Sabor & Brasa',
      description:
        'Aplicativo iOS + Android para o restaurante Sabor & Brasa, com cardápio digital, pedidos delivery e take away, integração com gateway de pagamento e painel administrativo.',
      clientName: 'Marina Costa',
      clientCompany: 'Sabor & Brasa Gastronomia',
      clientEmail: 'marina@saborbrasa.com.br',
      status: 'VIEWED',
      sentAt: days(-5),
      firstViewedAt: days(-3),
      lastViewedAt: days(-1),
      viewCount: 4,
      validUntil: days(25),
      notes: 'Marina mencionou que a equipe ainda está alinhando o orçamento de marketing antes de assinar.',
      items: {
        create: [
          { description: 'Design de produto e prototipação UX', quantity: 1, unitPrice: 8500, order: 0 },
          { description: 'Desenvolvimento mobile (iOS + Android)', quantity: 1, unitPrice: 28000, order: 1 },
          { description: 'Painel administrativo web', quantity: 1, unitPrice: 9500, order: 2 },
          { description: 'Integração com gateway de pagamento', quantity: 1, unitPrice: 3500, order: 3 },
        ],
      },
      events: {
        create: [
          { type: 'CREATED', createdAt: days(-6) },
          { type: 'SENT', createdAt: days(-5) },
          { type: 'VIEWED', createdAt: days(-3) },
          { type: 'VIEWED', createdAt: days(-2) },
          { type: 'VIEWED', createdAt: days(-1) },
        ],
      },
    },
  });

  // 4. Aceita
  const accepted = await prisma.proposal.create({
    data: {
      workspaceId: workspace.id,
      createdById: owner.id,
      slug: nanoid(8),
      title: 'Sistema interno de gestão de pedidos',
      description:
        'Sistema web interno para gerenciar pedidos da equipe comercial: cadastro de produtos, controle de estoque, emissão de pedidos e relatórios de vendas.',
      clientName: 'Carlos Mendes',
      clientCompany: 'Mendes Distribuidora',
      clientEmail: 'carlos@mendesdistr.com.br',
      status: 'ACCEPTED',
      sentAt: days(-12),
      firstViewedAt: days(-11),
      lastViewedAt: days(-8),
      viewCount: 7,
      acceptedAt: days(-8),
      validUntil: days(20),
      notes: 'Início previsto para 1º do próximo mês. Pagamento em 3 parcelas.',
      items: {
        create: [
          { description: 'Levantamento de requisitos e UX', quantity: 1, unitPrice: 4000, order: 0 },
          { description: 'Desenvolvimento full-stack (8 semanas)', quantity: 8, unitPrice: 2200, order: 1 },
          { description: 'Treinamento e onboarding da equipe', quantity: 1, unitPrice: 2500, order: 2 },
        ],
      },
      events: {
        create: [
          { type: 'CREATED', createdAt: days(-13) },
          { type: 'SENT', createdAt: days(-12) },
          { type: 'VIEWED', createdAt: days(-11) },
          { type: 'VIEWED', createdAt: days(-10) },
          { type: 'VIEWED', createdAt: days(-9) },
          { type: 'ACCEPTED', createdAt: days(-8) },
        ],
      },
    },
  });

  await prisma.acceptance.create({
    data: {
      proposalId: accepted.id,
      name: 'Carlos Antonio Mendes',
      email: 'carlos@mendesdistr.com.br',
      document: '32145678900',
      ipAddress: '189.123.45.67',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      verifiedAt: days(-8),
      acceptedAt: days(-8),
    },
  });

  // 5. Recusada
  const rejected = await prisma.proposal.create({
    data: {
      workspaceId: workspace.id,
      createdById: owner.id,
      slug: nanoid(8),
      title: 'Redesign de e-commerce e migração para Shopify',
      description:
        'Redesign completo da loja virtual atual e migração de plataforma para Shopify, incluindo importação de produtos, configuração de pagamentos e SEO técnico.',
      clientName: 'Patricia Almeida',
      clientCompany: 'Boutique Almeida',
      clientEmail: 'patricia@boutiquealmeida.com.br',
      status: 'REJECTED',
      sentAt: days(-30),
      firstViewedAt: days(-29),
      lastViewedAt: days(-25),
      viewCount: 3,
      rejectedAt: days(-25),
      validUntil: days(-15),
      notes: 'Cliente decidiu adiar o projeto para Q4.',
      items: {
        create: [
          { description: 'Redesign visual completo', quantity: 1, unitPrice: 12000, order: 0 },
          { description: 'Migração técnica para Shopify', quantity: 1, unitPrice: 8500, order: 1 },
          { description: 'SEO técnico e configuração', quantity: 1, unitPrice: 3500, order: 2 },
        ],
      },
      events: {
        create: [
          { type: 'CREATED', createdAt: days(-31) },
          { type: 'SENT', createdAt: days(-30) },
          { type: 'VIEWED', createdAt: days(-29) },
          { type: 'VIEWED', createdAt: days(-27) },
          { type: 'REJECTED', createdAt: days(-25) },
        ],
      },
    },
  });

  await prisma.rejection.create({
    data: {
      proposalId: rejected.id,
      reason:
        'Orçamento aprovado para o trimestre não comporta o investimento. Vamos retomar a conversa em Q4.',
      ipAddress: '177.45.89.12',
      rejectedAt: days(-25),
    },
  });

  console.log('✓ 5 propostas criadas (DRAFT, SENT, VIEWED, ACCEPTED, REJECTED)');
  console.log('\n✅ Seed concluído!\n');
  console.log('🔑 Credenciais:');
  console.log('   Owner:  demo@proposta.app / demo1234');
  console.log('   Member: time@proposta.app / demo1234\n');
  console.log('🏢 Workspace: Studio Demo (PRO plan)\n');
}

main()
  .catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
