# Proposta · SaaS de Propostas Comerciais

SaaS premium para criar propostas comerciais profissionais, enviar por link público, acompanhar visualizações com analytics granular, aceitar digitalmente com verificação por código e personalizar identidade visual por workspace.

> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind + shadcn/ui · Prisma · Postgres (Neon) · Zod · bcrypt · Geist + Fraunces

---

## ✨ Features

### Core
- **Multi-tenant** com workspaces, papéis (Owner/Admin/Member) e convites por e-mail
- **Branding por workspace**: cor, tipografia (4 pares), logo customizado, tom de marca
- **Editor de propostas** com itens dinâmicos, cálculo automático e validação
- **State machine** completa: Draft → Sent → Viewed → Accepted/Rejected/Expired
- **Página pública** editorial com sticky CTA e branding herdado do workspace
- **Aceite digital** com verificação por código de 6 dígitos enviado por e-mail
- **Templates reutilizáveis** com variáveis dinâmicas (`{{cliente.nome}}`, `{{data.hoje}}` etc)
- **Analytics granular**: tempo por seção, scroll depth, sessões únicas
- **Timeline de eventos** auditável

### Personalização
- 8 paletas pré-definidas + color picker custom
- 4 combinações de fonte (Editorial · Modern · Classic · Mono)
- Preview ao vivo da página pública
- Tom de marca configurável (base para AI futuro)

---

## 🚀 Deploy em produção (Vercel + Neon)

### Pré-requisitos
- Conta na [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com)
- Node 18+

### Setup do zero

```bash
# 1. Clone
git clone https://github.com/SEU_USER/proposta-claude.git
cd proposta-claude

# 2. Instale deps
npm install

# 3. Linke ao projeto Vercel
npx vercel link

# 4. Provisione Neon Postgres pelo Vercel Marketplace
#    (ou use qualquer Postgres; aponte DATABASE_URL e DIRECT_URL)

# 5. Puxe variáveis de ambiente
npx vercel env pull .env.local

# 6. Aplique migrations
npx prisma migrate deploy

# 7. (Opcional) Popule com dados demo
npm run db:seed

# 8. Rode local
npm run dev
```

O `vercel-build` já roda `prisma migrate deploy && next build` automaticamente em todo deploy. Migrations rodam antes do build, garantindo schema sincronizado.

### Variáveis de ambiente obrigatórias

| Var | Onde |
|-----|------|
| `DATABASE_URL` | URL com pooling (pgbouncer) — para o Prisma Client |
| `DIRECT_URL` | URL direta — para `migrate` e `db push` |
| `SESSION_SECRET` | string aleatória 32+ chars |

### Opcionais

| Var | Função |
|-----|--------|
| `RESEND_API_KEY` | Se setado em prod, envia e-mails reais. Sem isso, mock em console. |

---

## 💻 Setup local com Postgres

```bash
# Postgres via Docker (uma alternativa)
docker run -d --name proposta-db \
  -e POSTGRES_PASSWORD=proposta -e POSTGRES_DB=proposta \
  -p 5432:5432 postgres:16

# Variáveis em .env.local
DATABASE_URL="postgresql://postgres:proposta@localhost:5432/proposta"
DIRECT_URL="postgresql://postgres:proposta@localhost:5432/proposta"
SESSION_SECRET="dev-secret-troque-em-prod"

npx prisma migrate dev
npm run db:seed
npm run dev
```

### Credenciais demo

| Conta | E-mail | Senha |
|-------|--------|-------|
| Owner | `demo@proposta.app` | `demo1234` |
| Member | `time@proposta.app` | `demo1234` |

---

## 📜 Scripts

| Script | Função |
|--------|--------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (com prisma generate) |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript em strict |
| `npm run db:migrate` | Aplica migrations em dev |
| `npm run db:seed` | Popula com dados demo |
| `npm run db:studio` | Prisma Studio (GUI) |
| `npm run db:reset` | Reseta banco + roda seed |
| `npm run vercel-build` | Build comando que a Vercel executa |

---

## 🗂️ Estrutura

```
app/
├── (auth)/login/                 # Tela de login
├── (dashboard)/                  # Área autenticada
│   ├── dashboard/                # KPIs + últimas propostas
│   ├── propostas/                # CRUD + detalhe + analytics
│   ├── templates/                # Templates reutilizáveis
│   └── settings/
│       ├── workspace/            # Branding (cor, fonte, logo)
│       └── team/                 # Convites e membros
├── (public)/p/[slug]/            # Página pública branded
│   ├── aceitar/                  # Aceite com código por e-mail
│   └── recusar/                  # Recusa com motivo
├── actions/                      # Server Actions (auth, proposals, templates, workspace, acceptance)
└── api/track/                    # Endpoint de tracking de seções

components/
├── auth/                         # Form de login
├── dashboard/                    # KPI, sidebar, tabela, timeline, analytics
├── proposal-editor/              # Form proposta + items editor
├── public-proposal/              # View pública, forms, tracker, result
├── settings/                     # Workspace form, team management
├── templates/                    # Template form
└── ui/                           # Primitivos shadcn (button, input, dialog, alert-dialog, etc)

lib/
├── auth.ts                       # Hash, sessão, workspace switching
├── branding.ts                   # CSS vars + derivação de tons + presets
├── email-service.ts              # Mock + Resend (opcional)
├── event-service.ts              # Audit trail
├── prisma.ts                     # Client singleton
├── proposal-service.ts           # Tracking + expiração automática
├── status-machine.ts             # Transições válidas
├── types.ts                      # Status/EventType
├── utils.ts                      # BRL, datas, classes
├── validations.ts                # Schemas Zod
└── variables.ts                  # Variáveis dinâmicas em templates

prisma/
├── schema.prisma                 # Schema Postgres
├── migrations/                   # Migrations versionadas
└── seed.ts                       # Dados demo (workspace + 2 users + 3 templates + 5 propostas)
```

---

## 🎨 Design

- **Tipografia:** Geist Sans (corpo) + Fraunces (display editorial)
- **Paleta default:** warm neutral (`#FBF9F6` bg / `#1B1A17` ink / `#2F5D50` accent)
- **Princípios:** shadcn customizado, anti-overuse de cards, ease-spring transitions, skeleton shimmer no loading, sticky CTA branded na pública
- **Acessibilidade:** Radix por baixo dos primitivos (focus trap, keyboard nav), aria labels, contrast WCAG AA

---

## 🛣️ Roadmap pós-MVP-premium

- AI Assistant no editor (RAG dos closed-won)
- Integrações WhatsApp + Pix + ICP-Brasil
- Comentários do cliente na proposta pública
- Webhooks + API pública
- Real-time collab (Liveblocks/Yjs)
- White-label / domínio custom por workspace
- Stripe integration (cobrança automática pós-aceite)

---

## 📄 Licença

MIT
