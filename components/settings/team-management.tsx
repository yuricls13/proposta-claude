'use client';

import { useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Crown, Mail, Shield, Trash2, UserPlus, X } from 'lucide-react';
import {
  inviteMemberAction,
  removeMemberAction,
  revokeInvitationAction,
  type WorkspaceFormState,
} from '@/app/actions/workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

type Member = {
  id: string;
  role: string;
  joinedAt: Date | string;
  user: { id: string; email: string; name: string | null };
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date | string;
  createdAt: Date | string;
};

interface TeamManagementProps {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
}

const roleBadge: Record<string, { label: string; icon: typeof Crown; className: string }> = {
  OWNER: { label: 'Owner', icon: Crown, className: 'text-amber-700 bg-amber-50 border-amber-200' },
  ADMIN: { label: 'Admin', icon: Shield, className: 'text-accent-hover bg-accent-soft border-accent/30' },
  MEMBER: { label: 'Membro', icon: Mail, className: 'text-ink-mute bg-bg-alt border-ink-line' },
};

export function TeamManagement({
  members,
  invitations,
  currentUserId,
}: TeamManagementProps) {
  const [state, formAction] = useFormState<WorkspaceFormState | undefined, FormData>(
    inviteMemberAction,
    undefined,
  );

  return (
    <div className="space-y-10">
      {/* Convite form */}
      <section className="rounded-lg border border-ink-line bg-white p-6">
        <h2 className="text-base font-semibold tracking-tight">Convidar membro</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Envie um convite por e-mail. Quem aceitar entra com o papel selecionado.
        </p>

        {state?.ok && (
          <Alert className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-900">
            <Check className="h-4 w-4" />
            <AlertDescription>Convite gerado. O e-mail será enviado em breve.</AlertDescription>
          </Alert>
        )}
        {state?.error && (
          <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50 text-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="mt-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px] space-y-1.5">
            <Label htmlFor="email">E-mail do convidado</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="email@empresa.com"
            />
          </div>
          <div className="w-40 space-y-1.5">
            <Label htmlFor="role">Papel</Label>
            <select
              id="role"
              name="role"
              defaultValue="MEMBER"
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
            >
              <option value="MEMBER">Membro</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <SubmitButton />
        </form>
      </section>

      {/* Membros ativos */}
      <section>
        <h2 className="mb-4 text-base font-semibold tracking-tight">
          Membros ({members.length})
        </h2>
        <div className="overflow-hidden rounded-lg border border-ink-line bg-white divide-y divide-ink-line">
          {members.map((m) => {
            const badge = roleBadge[m.role] ?? roleBadge.MEMBER;
            const Icon = badge.icon;
            const isSelf = m.user.id === currentUserId;
            return (
              <div key={m.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-bg-alt text-sm font-medium text-ink-soft">
                    {(m.user.name || m.user.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {m.user.name || m.user.email}{' '}
                      {isSelf && <span className="text-ink-mute">(você)</span>}
                    </p>
                    <p className="truncate text-xs text-ink-mute">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${badge.className}`}
                  >
                    <Icon className="h-3 w-3" />
                    {badge.label}
                  </span>
                  {m.role !== 'OWNER' && !isSelf && (
                    <RemoveMemberButton memberId={m.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Convites pendentes */}
      {invitations.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold tracking-tight">
            Convites pendentes ({invitations.length})
          </h2>
          <div className="overflow-hidden rounded-lg border border-ink-line bg-white divide-y divide-ink-line">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{inv.email}</p>
                  <p className="text-xs text-ink-mute">
                    Convite expira em {formatDateBR(inv.expiresAt)} · papel{' '}
                    {inv.role.toLowerCase()}
                  </p>
                </div>
                <RevokeInvitationButton invitationId={inv.id} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <UserPlus />
      {pending ? 'Enviando...' : 'Convidar'}
    </Button>
  );
}

function RemoveMemberButton({ memberId }: { memberId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm('Remover este membro do workspace?')) {
          startTransition(() => removeMemberAction(memberId));
        }
      }}
      className="text-ink-mute hover:text-destructive transition-colors disabled:opacity-50"
      aria-label="Remover membro"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function RevokeInvitationButton({ invitationId }: { invitationId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => revokeInvitationAction(invitationId))}
      className="inline-flex items-center gap-1 text-xs text-ink-mute hover:text-destructive transition-colors disabled:opacity-50"
    >
      <X className="h-3.5 w-3.5" />
      Revogar
    </button>
  );
}
