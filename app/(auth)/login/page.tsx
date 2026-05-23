import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Entrar',
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <main className="min-h-[100dvh] bg-bg">
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 py-12">
        <Link href="/" className="mb-12 inline-flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-ink text-bg">
            <span className="font-serif text-sm leading-none">P</span>
          </div>
          <span className="font-serif text-lg tracking-tight">Proposta</span>
        </Link>

        <div className="flex-1">
          <h1 className="editorial text-display-lg text-balance">Bem-vindo de volta.</h1>
          <p className="mt-2 text-ink-soft">
            Entre para acessar suas propostas e acompanhar aceites.
          </p>

          <div className="mt-8 rounded-lg border border-ink-line bg-white p-6 shadow-soft">
            <LoginForm />
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-ink-mute">
          MVP local · Sem cadastro público — use a conta demo acima.
        </p>
      </div>
    </main>
  );
}
