import { redirect } from 'next/navigation';
import { requireSession, canManageWorkspace } from '@/lib/auth';
import { WorkspaceForm } from '@/components/settings/workspace-form';

export const metadata = { title: 'Workspace' };

export default async function WorkspaceSettingsPage() {
  const { workspace, role } = await requireSession();
  if (!canManageWorkspace(role)) redirect('/dashboard');

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <p className="text-sm text-ink-mute">Configurações</p>
        <h1 className="text-3xl font-semibold tracking-tight">Workspace & Marca</h1>
        <p className="mt-2 max-w-prose text-ink-soft">
          Personalize a aparência das suas propostas públicas. As mudanças aplicam-se
          automaticamente em todas as propostas existentes e futuras.
        </p>
      </div>

      <WorkspaceForm
        initial={{
          name: workspace.name,
          accentColor: workspace.accentColor,
          fontPair: workspace.fontPair,
          brandTone: workspace.brandTone ?? '',
          logoUrl: workspace.logoUrl ?? '',
        }}
      />
    </div>
  );
}
