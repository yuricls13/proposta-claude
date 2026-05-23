'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { AlertCircle, Check, Palette, Save, Type } from 'lucide-react';
import {
  updateWorkspaceAction,
  type WorkspaceFormState,
} from '@/app/actions/workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ACCENT_PRESETS,
  FONT_PAIRS,
  type FontPair,
  brandingStyle,
  fontClasses,
} from '@/lib/branding';
import { cn, formatBRL } from '@/lib/utils';

interface WorkspaceFormProps {
  initial: {
    name: string;
    accentColor: string;
    fontPair: string;
    brandTone: string;
    logoUrl: string;
  };
}

export function WorkspaceForm({ initial }: WorkspaceFormProps) {
  const [state, formAction] = useFormState<WorkspaceFormState | undefined, FormData>(
    updateWorkspaceAction,
    undefined,
  );
  const [name, setName] = useState(initial.name);
  const [accent, setAccent] = useState(initial.accentColor);
  const [fontPair, setFontPair] = useState<FontPair>(
    (initial.fontPair as FontPair) || 'editorial',
  );
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [brandTone, setBrandTone] = useState(initial.brandTone);

  const previewClasses = fontClasses(fontPair);

  return (
    <form action={formAction} className="space-y-10">
      {state?.ok && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <Check className="h-4 w-4" />
          <AlertDescription>Alterações salvas com sucesso.</AlertDescription>
        </Alert>
      )}
      {state?.error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Identidade */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Identidade</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do workspace</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logoUrl">URL do logo (opcional)</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              placeholder="https://..."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Cor accent */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-ink-mute" />
          <h2 className="text-lg font-semibold tracking-tight">Cor de marca</h2>
        </div>
        <p className="text-sm text-ink-soft">
          Esta cor é aplicada nos botões e detalhes da página pública das suas propostas.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setAccent(preset.value)}
              className={cn(
                'group relative h-10 w-10 rounded-full ring-offset-2 ring-offset-bg transition-all',
                accent === preset.value && 'ring-2 ring-ink',
              )}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
              aria-label={`Selecionar cor ${preset.name}`}
            >
              {accent === preset.value && (
                <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
              )}
            </button>
          ))}
          <div className="flex items-center gap-2 rounded-md border border-ink-line bg-white px-3 py-2">
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-6 w-8 cursor-pointer rounded border-0"
            />
            <Input
              name="accentColor"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-7 w-24 border-0 shadow-none px-1 font-mono text-xs"
              maxLength={7}
            />
          </div>
        </div>
      </section>

      {/* Tipografia */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-ink-mute" />
          <h2 className="text-lg font-semibold tracking-tight">Tipografia</h2>
        </div>

        <input type="hidden" name="fontPair" value={fontPair} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(FONT_PAIRS) as FontPair[]).map((pair) => {
            const cfg = FONT_PAIRS[pair];
            const active = fontPair === pair;
            return (
              <button
                key={pair}
                type="button"
                onClick={() => setFontPair(pair)}
                className={cn(
                  'rounded-lg border p-4 text-left transition-all',
                  active
                    ? 'border-ink bg-bg-alt/40 shadow-soft'
                    : 'border-ink-line bg-white hover:border-ink-mute',
                )}
              >
                <p className={cn('text-2xl', cfg.displayClass)}>Aa</p>
                <p className="mt-2 text-sm font-medium text-ink">{cfg.label}</p>
                <p className="text-xs text-ink-mute">{cfg.hint}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tom de marca */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Tom de marca</h2>
        <p className="text-sm text-ink-soft">
          Diretrizes que serão usadas pelos templates e (em breve) pelo assistente IA.
        </p>
        <Textarea
          id="brandTone"
          name="brandTone"
          rows={3}
          value={brandTone}
          onChange={(e) => setBrandTone(e.target.value)}
          placeholder="Ex.: Próximo, consultivo e direto. Foco em resultados. Sem jargão técnico desnecessário."
        />
      </section>

      {/* Preview da página pública */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Preview da página pública</h2>
        <div
          className="overflow-hidden rounded-xl border border-ink-line"
          style={brandingStyle(accent)}
        >
          <div className="border-b border-ink-line bg-bg-alt/40 px-6 py-3 text-xs text-ink-mute">
            <span className="font-mono">proposta.app/p/abc12345</span>
          </div>
          <div className="bg-white p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-mute">
              Proposta comercial · {new Date().toLocaleDateString('pt-BR')}
            </p>
            <h3 className={cn('mt-3 text-3xl text-ink', previewClasses.displayClass)}>
              Aqui vai o título da sua proposta
            </h3>
            <p className="mt-3 text-sm text-ink-soft">
              Para Cliente Exemplo · Empresa Exemplo
            </p>

            <div className="my-6 h-px bg-ink-line" />

            <p className={cn('text-sm leading-relaxed text-ink-soft', previewClasses.bodyClass)}>
              Olá Cliente. Esta é uma prévia de como a página pública da sua proposta vai
              aparecer com a marca selecionada. Cores, tipografia e tom serão aplicados
              automaticamente em todas as propostas que você enviar.
            </p>

            <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border bg-bg-alt/30 p-4">
              <span className="text-sm text-ink-soft">Total da proposta</span>
              <span className="font-mono text-lg font-semibold">{formatBRL(12500)}</span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-ink-line bg-white px-4 py-2 text-sm text-ink-soft"
                disabled
              >
                Recusar
              </button>
              <button
                type="button"
                className="rounded-md px-5 py-2 text-sm font-medium shadow-soft"
                style={{
                  backgroundColor: 'var(--brand-accent)',
                  color: 'var(--brand-fg)',
                }}
                disabled
              >
                Aceitar proposta
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end border-t border-ink-line pt-6">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save />
      {pending ? 'Salvando...' : 'Salvar alterações'}
    </Button>
  );
}
