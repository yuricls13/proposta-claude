import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  if (!session || !session.workspace) redirect('/login');

  return (
    <div className="flex min-h-[100dvh] bg-bg">
      <Sidebar
        user={{
          email: session.user.email,
          name: session.user.name,
        }}
        workspace={{
          name: session.workspace.name,
          plan: session.workspace.plan,
          accentColor: session.workspace.accentColor,
          logoUrl: session.workspace.logoUrl,
        }}
        role={session.role}
      />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
