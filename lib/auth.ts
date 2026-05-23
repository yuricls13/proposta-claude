import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { cache } from 'react';

const SESSION_COOKIE = 'proposta_session';
const SESSION_DAYS = 7;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    cookies().delete(SESSION_COOKIE);
  }
}

export const getCurrentUser = cache(async () => {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session.user;
});

/**
 * Resolve usuário + workspace ativo + papel.
 * Cacheado por request via React.cache.
 */
export const getCurrentSession = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  // Busca membership ativo
  let activeWorkspaceId = user.activeWorkspaceId;
  let membership = activeWorkspaceId
    ? await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId: activeWorkspaceId, userId: user.id },
        },
        include: { workspace: true },
      })
    : null;

  // Se não tem workspace ativo válido, pega o primeiro membership
  if (!membership) {
    membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      include: { workspace: true },
      orderBy: { joinedAt: 'asc' },
    });

    if (membership && membership.workspaceId !== user.activeWorkspaceId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { activeWorkspaceId: membership.workspaceId },
      });
    }
  }

  if (!membership) return { user, workspace: null, role: null };

  return {
    user,
    workspace: membership.workspace,
    role: membership.role as 'OWNER' | 'ADMIN' | 'MEMBER',
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session || !session.workspace) {
    throw new Error('UNAUTHORIZED');
  }
  return session as {
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
    workspace: NonNullable<typeof session.workspace>;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
  };
}

export function canManageWorkspace(role: 'OWNER' | 'ADMIN' | 'MEMBER' | null) {
  return role === 'OWNER' || role === 'ADMIN';
}

export { SESSION_COOKIE };
