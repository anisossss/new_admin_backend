'use client';

import { Loader2, Sparkles } from 'lucide-react';
import type { ArticleSeo } from '@/lib/types';
import ChipsInput from '@/components/ChipsInput';
import Switch from '@/components/Switch';
import { truncate } from '@/lib/format';

const AI_DISABLED_HINT =
  'IA indisponible — ajoutez ANTHROPIC_API_KEY dans backend/.env puis redémarrez le backend.';

export interface SeoFormState {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
  noIndex: boolean;
}

interface SeoPanelProps {
  seo: SeoFormState;
  onSeoChange: (patch: Partial<SeoFormState>) => void;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  aiConfigured: boolean;
  generating: boolean;
  onGenerate: () => void;
}

function Counter({ length, max }: { length: number; max: number }) {
  const tone = length === 0 ? 'text-faint' : length <= max ? 'text-success' : 'text-danger';
  return (
    <span className={`font-mono text-[11px] font-bold ${tone}`}>
      {length}/{max}
    </span>
  );
}

export default function SeoPanel({
  seo,
  onSeoChange,
  title,
  slug,
  excerpt,
  coverImageUrl,
  aiConfigured,
  generating,
  onGenerate,
}: SeoPanelProps) {
  const serpTitle = truncate(seo.metaTitle || title || 'Titre de l’article', 60);
  const serpDescription = truncate(
    seo.metaDescription || excerpt || 'La méta-description apparaîtra ici, sous le titre, dans les résultats Google.',
    155
  );
  const serpSlug = slug || 'slug-de-l-article';

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="btn w-full border border-terracotta/40 bg-terracotta-soft/50 text-terracotta hover:bg-terracotta-soft"
        onClick={onGenerate}
        disabled={!aiConfigured || generating}
        title={aiConfigured ? undefined : AI_DISABLED_HINT}
      >
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Générer le SEO avec l’IA
      </button>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="rail-label" htmlFor="seo-meta-title">
            Méta-titre
          </label>
          <Counter length={seo.metaTitle.length} max={60} />
        </div>
        <input
          id="seo-meta-title"
          className="field"
          placeholder="Titre affiché dans Google (≤ 60 caractères)"
          value={seo.metaTitle}
          onChange={(e) => onSeoChange({ metaTitle: e.target.value })}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="rail-label" htmlFor="seo-meta-description">
            Méta-description
          </label>
          <Counter length={seo.metaDescription.length} max={155} />
        </div>
        <textarea
          id="seo-meta-description"
          className="field min-h-20 resize-y"
          placeholder="Résumé incitatif affiché sous le titre (≤ 155 caractères)"
          value={seo.metaDescription}
          onChange={(e) => onSeoChange({ metaDescription: e.target.value })}
        />
      </div>

      <div>
        <label className="rail-label mb-1.5">Mots-clés</label>
        <ChipsInput
          value={seo.keywords}
          onChange={(keywords) => onSeoChange({ keywords })}
          placeholder="Mot-clé puis Entrée…"
        />
      </div>

      <div>
        <label className="rail-label mb-1.5" htmlFor="seo-og-image">
          Image Open Graph
        </label>
        <input
          id="seo-og-image"
          className="field font-mono text-xs"
          placeholder="https://…/image.jpg"
          value={seo.ogImage}
          onChange={(e) => onSeoChange({ ogImage: e.target.value })}
        />
        <button
          type="button"
          className="mt-1.5 text-xs font-bold text-terracotta transition hover:text-terracotta-deep disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!coverImageUrl}
          onClick={() => onSeoChange({ ogImage: coverImageUrl })}
        >
          Utiliser l’image de couverture
        </button>
      </div>

      <div>
        <label className="rail-label mb-1.5" htmlFor="seo-canonical">
          URL canonique
        </label>
        <input
          id="seo-canonical"
          className="field font-mono text-xs"
          placeholder="https://site.tn/article/slug"
          value={seo.canonicalUrl}
          onChange={(e) => onSeoChange({ canonicalUrl: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-paper px-3 py-2.5">
        <div>
          <p className="text-sm font-bold">Ne pas indexer</p>
          <p className="text-[11px] text-muted">Ajoute robots noindex sur les sites.</p>
        </div>
        <Switch checked={seo.noIndex} onChange={(noIndex) => onSeoChange({ noIndex })} label="Ne pas indexer" />
      </div>

      <div>
        <p className="rail-label mb-1.5">Aperçu Google</p>
        <div className="rounded-lg border border-line bg-card p-4">
          <p className="truncate text-[13px] text-serp-url">
            https://votre-site.tn <span className="text-serp-text">› article › {serpSlug}</span>
          </p>
          <p className="mt-0.5 truncate text-[17px] leading-snug font-medium text-serp-link">{serpTitle}</p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-serp-text">{serpDescription}</p>
        </div>
      </div>
    </div>
  );
}
