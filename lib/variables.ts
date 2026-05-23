/**
 * Substitui variáveis tipo {{cliente.nome}} por valores reais no momento de
 * criar/preencher proposta a partir de template.
 */

export type VariableContext = {
  cliente?: {
    nome?: string;
    empresa?: string;
    email?: string;
  };
  vendedor?: {
    nome?: string;
    email?: string;
  };
  workspace?: {
    nome?: string;
  };
  data?: {
    hoje?: string;
    validade?: string;
  };
};

export const AVAILABLE_VARIABLES = [
  { token: '{{cliente.nome}}', label: 'Nome do cliente', sample: 'Ana Beatriz' },
  { token: '{{cliente.empresa}}', label: 'Empresa do cliente', sample: 'Estúdio Norte' },
  { token: '{{cliente.email}}', label: 'E-mail do cliente', sample: 'ana@estudionorte.com' },
  { token: '{{vendedor.nome}}', label: 'Seu nome', sample: 'Yuri Cardoso' },
  { token: '{{vendedor.email}}', label: 'Seu e-mail', sample: 'yuri@studio.app' },
  { token: '{{workspace.nome}}', label: 'Nome do workspace', sample: 'Studio Demo' },
  { token: '{{data.hoje}}', label: 'Data de hoje', sample: '23/05/2026' },
  { token: '{{data.validade}}', label: 'Data de validade', sample: '15/06/2026' },
] as const;

export function applyVariables(text: string, context: VariableContext): string {
  if (!text) return text;

  return text
    .replace(/\{\{cliente\.nome\}\}/g, context.cliente?.nome || '{{cliente.nome}}')
    .replace(/\{\{cliente\.empresa\}\}/g, context.cliente?.empresa || '{{cliente.empresa}}')
    .replace(/\{\{cliente\.email\}\}/g, context.cliente?.email || '{{cliente.email}}')
    .replace(/\{\{vendedor\.nome\}\}/g, context.vendedor?.nome || '')
    .replace(/\{\{vendedor\.email\}\}/g, context.vendedor?.email || '')
    .replace(/\{\{workspace\.nome\}\}/g, context.workspace?.nome || '')
    .replace(/\{\{data\.hoje\}\}/g, context.data?.hoje || new Date().toLocaleDateString('pt-BR'))
    .replace(/\{\{data\.validade\}\}/g, context.data?.validade || '');
}

export function extractVariables(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\{\{[a-z]+\.[a-z]+\}\}/gi);
  return matches ? Array.from(new Set(matches)) : [];
}

export function hasUnfilledVariables(text: string): boolean {
  return /\{\{[a-z]+\.[a-z]+\}\}/i.test(text);
}
