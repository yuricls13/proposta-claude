import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function PublicProposalNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-bg-alt text-ink-mute">
          <FileQuestion className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-display-lg text-balance">
          Proposta não disponível.
        </h1>
        <p className="mt-3 text-ink-soft">
          Este link pode estar errado, ter sido revogado ou a proposta ainda não foi
          enviada. Confira com quem te encaminhou.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
        >
          Ir para o início
        </Link>
      </div>
    </main>
  );
}
