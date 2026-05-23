'use client';

import { useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-mute">
          Algo deu errado
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
          Aconteceu um erro inesperado.
        </h1>
        <p className="mt-3 text-ink-soft">
          Tente novamente. Se persistir, recarregue a página ou volte mais tarde.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm text-bg hover:bg-ink-soft"
        >
          <RefreshCcw className="h-4 w-4" />
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
