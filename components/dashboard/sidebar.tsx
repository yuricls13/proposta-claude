'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/propostas', label: 'Propostas', icon: FileText },
  { href: '/templates', label: 'Templates', icon: Sparkles },
];

const settingsNav = [
  { href: '/settings/workspace', label: 'Workspace', icon: Settings },
  { href: '/settings/team', label: 'Equipe', icon: Users },
];

interface SidebarProps {
  user: { email: string; name: string | null };
  workspace: {
    name: string;
    plan: string;
    accentColor: string;
    logoUrl: string | null;
  };
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export function Sidebar({ user, workspace, role }: SidebarProps) {
  const pathname = usePathname();
  const canManage = role === 'OWNER' || role === 'ADMIN';

  const initials = workspace.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-ink-line/60 bg-white">
      {/* Workspace switcher (header) */}
      <div className="border-b border-ink-line/60 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-bg-alt"
        >
          {workspace.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={workspace.logoUrl}
              alt={workspace.name}
              className="h-8 w-8 rounded-md object-cover"
            />
          ) : (
            <div
              className="grid h-8 w-8 place-items-center rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: workspace.accentColor }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{workspace.name}</p>
            <p className="text-xs text-ink-mute">Plano {workspace.plan}</p>
          </div>
        </button>
      </div>

      {/* Nova proposta CTA */}
      <div className="p-3">
        <Link
          href="/propostas/nova"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Nova proposta
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pb-3">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-bg-alt text-ink font-medium'
                  : 'text-ink-soft hover:bg-bg-alt/60 hover:text-ink',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}

        {canManage && (
          <>
            <div className="px-3 pb-1 pt-5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-mute">
              Configurações
            </div>
            {settingsNav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-bg-alt text-ink font-medium'
                      : 'text-ink-soft hover:bg-bg-alt/60 hover:text-ink',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-ink-line/60 p-3">
        <div className="mb-2 px-2 py-1">
          <p className="truncate text-sm font-medium text-ink">{user.name || 'Usuário'}</p>
          <p className="truncate text-xs text-ink-mute">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-bg-alt hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
