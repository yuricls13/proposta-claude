'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { formatBRL } from '@/lib/utils';

export type ItemDraft = {
  description: string;
  quantity: number;
  unitPrice: number;
};

interface ItemsEditorProps {
  items: ItemDraft[];
  onChange: (items: ItemDraft[]) => void;
  errors?: Record<string, string>;
}

export function ItemsEditor({ items, onChange, errors }: ItemsEditorProps) {
  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0),
    [items],
  );

  function update(index: number, patch: Partial<ItemDraft>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-soft">Itens da proposta</h3>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md border border-ink-line bg-white px-2.5 py-1 text-xs text-ink-soft hover:border-ink-mute hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar item
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-ink-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-bg-alt/50 text-xs uppercase tracking-wider text-ink-mute">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Descrição</th>
              <th className="w-20 px-3 py-2 text-right font-medium">Qtd</th>
              <th className="w-32 px-3 py-2 text-right font-medium">R$ unit.</th>
              <th className="w-32 px-3 py-2 text-right font-medium">Total</th>
              <th className="w-10 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-line">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-ink-mute">
                  Nenhum item ainda. Clique em &ldquo;Adicionar item&rdquo;.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index} className="hover:bg-bg-alt/30">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => update(index, { description: e.target.value })}
                      placeholder="Ex.: Design da página inicial"
                      className="w-full border-0 bg-transparent p-1 text-sm outline-none placeholder:text-ink-mute focus:ring-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        update(index, { quantity: Number(e.target.value) || 0 })
                      }
                      min={1}
                      step={1}
                      className="w-full border-0 bg-transparent p-1 text-right text-sm outline-none focus:ring-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        update(index, { unitPrice: Number(e.target.value) || 0 })
                      }
                      min={0}
                      step={0.01}
                      className="w-full border-0 bg-transparent p-1 text-right text-sm outline-none focus:ring-0"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-sm text-ink-soft">
                    {formatBRL(item.quantity * item.unitPrice)}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-ink-mute hover:text-danger"
                      aria-label="Remover item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-bg-alt/30 text-sm">
            <tr>
              <td colSpan={3} className="px-3 py-3 text-right font-medium text-ink-soft">
                Total geral
              </td>
              <td className="px-3 py-3 text-right font-mono text-base font-semibold text-ink">
                {formatBRL(total)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {errors?.items && (
        <p className="mt-2 text-xs text-danger">{errors.items}</p>
      )}

      {/* Inputs hidden para enviar via FormData */}
      {items.map((item, index) => (
        <input
          key={index}
          type="hidden"
          name="items"
          value={JSON.stringify(item)}
        />
      ))}
    </div>
  );
}
