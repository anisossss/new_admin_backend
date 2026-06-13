'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2, Save, Send, X } from 'lucide-react';
import type { ArticleStatus, Website } from '@/lib/types';
import ChipsInput from '@/components/ChipsInput';
import Switch from '@/components/Switch';

const CATEGORIES = [
  'Actualités',
  'Politique',
  'Économie',
  'Société',
  'Sport',
  'Culture',
  'Tech',
  'International',
  'Santé',
];

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'scheduled', label: 'Programmé' },
];

interface PublishPanelProps {
  status: ArticleStatus;
  onStatusChange: (status: ArticleStatus) => void;
  scheduledFor: string;
  onScheduledForChange: (value: string) => void;
  websites: Website[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  featured: boolean;
  onFeaturedChange: (value: boolean) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  saving: boolean;
  onSave: () => void;
  onSaveDraft: () => void;
}

export default function PublishPanel({
  status,
  onStatusChange,
  scheduledFor,
  onScheduledForChange,
  websites,
  selected,
  onSelectedChange,
  featured,
  onFeaturedChange,
  category,
  onCategoryChange,
  tags,
  onTagsChange,
  saving,
  onSave,
  onSaveDraft,
}: PublishPanelProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [dropdownOpen]);

  const allSelected = websites.length > 0 && selected.length === websites.length;
  const selectedSites = websites.filter((w) => selected.includes(w._id));
  const isCustomCategory = !CATEGORIES.includes(category);

  const toggleSite = (id: string) => {
    onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const toggleAll = () => {
    onSelectedChange(allSelected ? [] : websites.map((w) => w._id));
  };

  const primaryLabel = status === 'published' ? 'Publier' : status === 'scheduled' ? 'Programmer' : 'Enregistrer';
  const PrimaryIcon = status === 'draft' ? Save : Send;

  return (
    <div className="space-y-4">
      <div>
        <label className="rail-label mb-1.5" htmlFor="publish-status">
          Statut
        </label>
        <select
          id="publish-status"
          className="field"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ArticleStatus)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {status === 'scheduled' && (
          <div className="mt-2">
            <label className="rail-label mb-1.5" htmlFor="publish-scheduled-for">
              Date et heure de publication
            </label>
            <input
              id="publish-scheduled-for"
              type="datetime-local"
              className="field font-mono text-xs"
              value={scheduledFor}
              onChange={(e) => onScheduledForChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div ref={dropdownRef} className="relative">
        <label className="rail-label mb-1.5">Sites de publication</label>
        <button
          type="button"
          className="field flex items-center justify-between text-left"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className={selected.length === 0 ? 'text-faint' : 'font-semibold'}>
            {selected.length === 0
              ? 'Choisir les sites…'
              : `${selected.length} site${selected.length > 1 ? 's' : ''} sélectionné${selected.length > 1 ? 's' : ''}`}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="card animate-pop-in absolute z-30 mt-1.5 w-full p-1.5" role="listbox">
            {websites.length === 0 ? (
              <p className="px-2.5 py-2 text-xs text-muted">
                Aucun site — lancez <code className="font-mono">npm run seed</code> dans backend/.
              </p>
            ) : (
              <>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-md border-b border-line px-2.5 py-2 text-sm font-bold hover:bg-paper">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 accent-terracotta"
                  />
                  Tout sélectionner
                </label>
                {websites.map((site) => (
                  <label
                    key={site._id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-semibold hover:bg-paper"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(site._id)}
                      onChange={() => toggleSite(site._id)}
                      className="h-4 w-4 accent-terracotta"
                    />
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: site.themeColor || '#a9adb2' }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{site.name}</span>
                    <span className="font-mono text-[10px] text-faint uppercase">{site.language}</span>
                  </label>
                ))}
              </>
            )}
          </div>
        )}

        {selectedSites.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedSites.map((site) => (
              <span
                key={site._id}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2 py-1 text-[11px] font-bold"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: site.themeColor || '#a9adb2' }}
                  aria-hidden="true"
                />
                {site.name}
                <button
                  type="button"
                  aria-label={`Retirer ${site.name}`}
                  onClick={() => toggleSite(site._id)}
                  className="text-muted transition hover:text-danger"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-paper px-3 py-2.5">
        <div>
          <p className="text-sm font-bold">À la une</p>
          <p className="text-[11px] text-muted">Met l’article en avant sur les sites.</p>
        </div>
        <Switch checked={featured} onChange={onFeaturedChange} label="À la une" />
      </div>

      <div>
        <label className="rail-label mb-1.5" htmlFor="publish-category">
          Catégorie
        </label>
        <select
          id="publish-category"
          className="field"
          value={isCustomCategory ? '__custom__' : category}
          onChange={(e) => onCategoryChange(e.target.value === '__custom__' ? '' : e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="__custom__">Personnalisée…</option>
        </select>
        {isCustomCategory && (
          <input
            className="field mt-2"
            placeholder="Nom de la catégorie"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          />
        )}
      </div>

      <div>
        <label className="rail-label mb-1.5">Étiquettes</label>
        <ChipsInput value={tags} onChange={onTagsChange} placeholder="Étiquette puis Entrée…" />
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <button type="button" className="btn btn-primary w-full" onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PrimaryIcon className="h-4 w-4" />}
          {primaryLabel}
        </button>
        <button type="button" className="btn btn-ghost w-full" onClick={onSaveDraft} disabled={saving}>
          Enregistrer comme brouillon
        </button>
      </div>
    </div>
  );
}
