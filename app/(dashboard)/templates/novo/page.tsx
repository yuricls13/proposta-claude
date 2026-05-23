import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TemplateForm } from '@/components/templates/template-form';

export const metadata = { title: 'Novo template' };

export default function NewTemplatePage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link
          href="/templates"
          className="inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Templates
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Novo template</h1>
      </div>
      <TemplateForm />
    </div>
  );
}
