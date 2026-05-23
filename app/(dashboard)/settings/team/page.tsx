import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireSession, canManageWorkspace } from '@/lib/auth';
import { TeamManagement } from '@/components/settings/team-management';

export const metadata = { title: 'Equipe' };

export default async function TeamSettingsPage() {
  const { workspace, role, user } = await requireSession();
  if (!canManageWorkspace(role)) redirect('/dashboard');

  const [members, invitations] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    }),
    prisma.invitation.findMany({
      where: {
        workspaceId: workspace.id,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <p className="text-sm text-ink-mute">Configurações</p>
        <h1 className="text-3xl font-semibold tracking-tight">Equipe</h1>
        <p className="mt-2 max-w-prose text-ink-soft">
          Convide membros para colaborar nas propostas do workspace. Owners e admins podem
          gerenciar membros e configurações.
        </p>
      </div>

      <TeamManagement
        members={members}
        invitations={invitations}
        currentUserId={user.id}
      />
    </div>
  );
}
