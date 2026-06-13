'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface ChipsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export default function ChipsInput({ value, onChange, placeholder = 'Ajouter puis Entrée…' }: ChipsInputProps) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const item = draft.trim().replace(/,+$/, '');
    if (item && !value.includes(item)) onChange([...value, item]);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1.5 transition focus-within:border-terracotta focus-within:ring-2 focus-within:ring-terracotta/25">
      {value.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-xs font-semibold text-ink"
        >
          {item}
          <button
            type="button"
            aria-label={`Retirer ${item}`}
            onClick={() => onChange(value.filter((v) => v !== item))}
            className="rounded-full text-muted transition hover:text-danger"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[90px] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-faint"
      />
    </div>
  );
}
