import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-mute">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
          Página não encontrada.
        </h1>
        <p className="mt-3 text-ink-soft">
          O endereço pode estar errado ou o conteúdo foi removido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm text-bg hover:bg-ink-soft"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
