/**
 * Mock e-mail service. Em produção, troque por Resend/Postmark/SendGrid.
 * Logs em console + persiste em uma tabela "futura" (no momento só console).
 */

type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  category?: 'proposal_sent' | 'proposal_viewed' | 'verification_code' | 'invitation' | 'system';
};

const isProd = process.env.NODE_ENV === 'production';
const RESEND_KEY = process.env.RESEND_API_KEY;

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; id?: string; provider: string }> {
  // Em produção COM key configurada, usa Resend (placeholder de integração)
  if (isProd && RESEND_KEY) {
    // TODO: integração real com Resend SDK quando key for adicionada
    return { ok: true, id: `resend-${Date.now()}`, provider: 'resend' };
  }

  // Dev/mock: loga no console com formatação amigável
  console.log('━'.repeat(60));
  console.log(`📧 E-mail (mock) [${payload.category ?? 'system'}]`);
  console.log(`To:      ${payload.to}`);
  console.log(`Subject: ${payload.subject}`);
  console.log('─'.repeat(60));
  console.log(payload.body);
  console.log('━'.repeat(60));

  return { ok: true, id: `mock-${Date.now()}`, provider: 'mock' };
}

export function generateVerificationCode(length = 6): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

export function buildVerificationEmail(name: string, code: string, proposalTitle: string) {
  return {
    subject: `Código de confirmação para aceitar a proposta`,
    body: `Olá ${name},

Você está finalizando o aceite da proposta "${proposalTitle}".

Seu código de confirmação é:

    ${code}

Este código expira em 15 minutos. Se você não solicitou este aceite, ignore este e-mail.`,
  };
}
