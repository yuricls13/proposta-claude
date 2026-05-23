import { z } from 'zod';

export const proposalItemSchema = z.object({
  description: z.string().trim().min(1, 'Descrição obrigatória'),
  quantity: z.coerce
    .number()
    .positive('Quantidade deve ser maior que zero')
    .max(99999, 'Quantidade muito grande'),
  unitPrice: z.coerce
    .number()
    .min(0, 'Preço inválido')
    .max(999999999, 'Preço muito alto'),
});

export type ProposalItemInput = z.infer<typeof proposalItemSchema>;

export const proposalSchema = z.object({
  title: z.string().trim().min(3, 'Título precisa de pelo menos 3 caracteres').max(160),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  clientName: z.string().trim().min(1, 'Nome do cliente obrigatório').max(120),
  clientEmail: z
    .string()
    .trim()
    .email('E-mail inválido')
    .max(160)
    .optional()
    .or(z.literal('')),
  clientCompany: z.string().trim().max(160).optional().or(z.literal('')),
  validUntil: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d === null || !isNaN(d.getTime()), {
      message: 'Data inválida',
    }),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  items: z
    .array(proposalItemSchema)
    .min(1, 'Adicione pelo menos um item')
    .max(50, 'Máximo de 50 itens por proposta'),
});

export type ProposalInput = z.infer<typeof proposalSchema>;

export const acceptanceSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo').max(120),
  email: z.string().trim().email('E-mail inválido').max(160),
  document: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v.replace(/\D/g, '') : ''))
    .refine((v) => !v || v.length === 11 || v.length === 14, {
      message: 'CPF (11) ou CNPJ (14) inválido',
    }),
  confirmed: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .refine((v) => v === 'on' || v === 'true' || v === true, {
      message: 'Você precisa confirmar para aceitar',
    }),
});

export type AcceptanceInput = z.infer<typeof acceptanceSchema>;

export const rejectionSchema = z.object({
  reason: z.string().trim().max(1000).optional().or(z.literal('')),
});

export type RejectionInput = z.infer<typeof rejectionSchema>;
