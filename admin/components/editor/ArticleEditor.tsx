'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Editor } from '@tiptap/react';
import { ArrowLeft, FileQuestion, Image as ImageIcon, RotateCcw, Search, Send } from 'lucide-react';
import {
  aiSeo,
  ApiError,
  createArticle,
  errorMessage,
  getArticle,
  getHealth,
  getWebsites,
  updateArticle,
} from '@/lib/api';
import type {
  Article,
  ArticlePayload,
  ArticleStatus,
  GenerateResult,
  Language,
  Website,
} from '@/lib/types';
import { isoToLocalInput, slugify, stripHtml } from '@/lib/format';
import { useToast } from '@/components/Toast';
import Skeleton from '@/components/Skeleton';
import OfflinePanel from '@/components/OfflinePanel';
import RichEditor from './RichEditor';
import AiPanel from './AiPanel';
import RailSection from './RailSection';
import PublishPanel from './PublishPanel';
import CoverImagePicker from './CoverImagePicker';
import SeoPanel, { type SeoFormState } from './SeoPanel';

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: { url: string; alt: string };
  category: string;
  tags: string[];
  websites: string[];
  status: ArticleStatus;
  scheduledFor: string;
  featured: boolean;
  seo: SeoFormState;
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: { url: '', alt: '' },
  category: 'Actualités',
  tags: [],
  websites: [],
  status: 'draft',
  scheduledFor: '',
  featured: false,
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    ogImage: '',
    canonicalUrl: '',
    noIndex: false,
  },
};

function EditorSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Skeleton className="h-44" />
        <Skeleton className="h-24" />
        <Skeleton className="h-[480px]" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-80" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function ArticleEditor({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !articleId;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiLanguage, setAiLanguage] = useState<Language>('fr');
  const [editor, setEditor] = useState<Editor | null>(null);

  const slugTouched = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const patch = useCallback((p: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
  }, []);

  const patchSeo = useCallback((p: Partial<SeoFormState>) => {
    setForm((f) => ({ ...f, seo: { ...f.seo, ...p } }));
    setDirty(true);
  }, []);

  const handleContentChange = useCallback((html: string) => {
    setForm((f) => ({ ...f, content: html }));
    setDirty(true);
  }, []);

  const applyArticle = useCallback((article: Article) => {
    setForm({
      title: article.title || '',
      slug: article.slug || '',
      excerpt: article.excerpt || '',
      content: article.content || '',
      coverImage: { url: article.coverImage?.url || '', alt: article.coverImage?.alt || '' },
      category: article.category || 'Actualités',
      tags: article.tags || [],
      websites: (article.websites || []).map((w) => (typeof w === 'string' ? w : w._id)),
      status: article.status || 'draft',
      scheduledFor: isoToLocalInput(article.scheduledFor),
      featured: !!article.featured,
      seo: {
        metaTitle: article.seo?.metaTitle || '',
        metaDescription: article.seo?.metaDescription || '',
        keywords: article.seo?.keywords || [],
        ogImage: article.seo?.ogImage || '',
        canonicalUrl: article.seo?.canonicalUrl || '',
        noIndex: !!article.seo?.noIndex,
      },
    });
    slugTouched.current = true;
    setDirty(false);
  }, []);

  const loadArticle = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    setLoadError(null);
    setNotFound(false);
    try {
      const article = await getArticle(articleId);
      applyArticle(article);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [articleId, applyArticle]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  useEffect(() => {
    getWebsites()
      .then(setWebsites)
      .catch(() => setWebsites([]));
    getHealth()
      .then((h) => setAiConfigured(!!h.aiConfigured))
      .catch(() => setAiConfigured(false));
  }, []);

  // Garde « modifications non enregistrées ».
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Auto-grow du titre.
  useEffect(() => {
    const el = titleRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [form.title, loading]);

  const handleTitleChange = (value: string) => {
    patch(slugTouched.current ? { title: value } : { title: value, slug: slugify(value) });
  };

  const handleSlugChange = (value: string) => {
    slugTouched.current = true;
    patch({ slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') });
  };

  const regenerateSlug = () => {
    slugTouched.current = false;
    patch({ slug: slugify(form.title) });
  };

  const hasExistingContent =
    form.title.trim() !== '' || form.excerpt.trim() !== '' || stripHtml(form.content) !== '';

  const handleGenerated = useCallback(
    (result: GenerateResult) => {
      slugTouched.current = false;
      setForm((f) => ({
        ...f,
        title: result.title || f.title,
        slug: slugify(result.title || f.title),
        excerpt: result.excerpt || f.excerpt,
        content: result.contentHtml || f.content,
        category: result.category || f.category,
        tags: Array.isArray(result.tags) && result.tags.length > 0 ? result.tags : f.tags,
      }));
      setDirty(true);
      toast.success('Article généré — relisez avant de publier.');
    },
    [toast]
  );

  const handleTitlePick = useCallback((title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched.current ? f.slug : slugify(title),
    }));
    setDirty(true);
  }, []);

  const generateSeo = async () => {
    if (!form.title.trim() && stripHtml(form.content) === '') {
      toast.error('Ajoutez un titre ou du contenu avant de générer le SEO.');
      return;
    }
    setSeoGenerating(true);
    try {
      const result = await aiSeo({ title: form.title, content: form.content, language: aiLanguage });
      setForm((f) => ({
        ...f,
        slug: f.slug || result.slug || f.slug,
        seo: {
          ...f.seo,
          metaTitle: result.metaTitle || f.seo.metaTitle,
          metaDescription: result.metaDescription || f.seo.metaDescription,
          keywords: Array.isArray(result.keywords) && result.keywords.length > 0 ? result.keywords : f.seo.keywords,
        },
      }));
      setDirty(true);
      toast.success('Champs SEO générés.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSeoGenerating(false);
    }
  };

  const save = async (statusOverride?: ArticleStatus) => {
    const status = statusOverride ?? form.status;
    if (!form.title.trim()) {
      toast.error('Le titre est requis avant d’enregistrer.');
      return;
    }
    if (status === 'scheduled' && !form.scheduledFor) {
      toast.error('Choisissez une date de programmation.');
      return;
    }
    if (statusOverride) setForm((f) => ({ ...f, status }));
    setSaving(true);
    try {
      const payload: ArticlePayload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        category: form.category.trim() || 'Actualités',
        tags: form.tags,
        websites: form.websites,
        status,
        featured: form.featured,
        scheduledFor:
          status === 'scheduled' && form.scheduledFor ? new Date(form.scheduledFor).toISOString() : null,
        seo: form.seo,
      };
      if (articleId) {
        const updated = await updateArticle(articleId, payload);
        applyArticle(updated);
        toast.success(status === 'published' ? 'Article publié.' : 'Article enregistré.');
      } else {
        await createArticle(payload);
        setDirty(false);
        toast.success(status === 'published' ? 'Article créé et publié.' : 'Article créé.');
        router.push('/articles');
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-[1280px] p-6 lg:p-8">
        <div className="card mx-auto flex max-w-xl flex-col items-center px-8 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper text-muted">
            <FileQuestion className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-lg font-extrabold tracking-tight">Article introuvable</h1>
          <p className="mt-2 text-sm text-muted">
            Cet article n’existe plus ou l’identifiant est invalide.
          </p>
          <Link href="/articles" className="btn btn-primary mt-6">
            <ArrowLeft className="h-4 w-4" />
            Retour aux articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] p-6 lg:p-8">
      <header className="mb-6 flex items-center gap-4">
        <Link href="/articles" className="icon-btn border border-line bg-card" title="Retour aux articles">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            {isNew ? 'Nouvel article' : 'Modifier l’article'}
          </h1>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <span
              className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-amber' : 'bg-success'}`}
              aria-hidden="true"
            />
            {dirty ? 'Modifications non enregistrées' : 'Tout est enregistré'}
          </p>
        </div>
      </header>

      {loading ? (
        <EditorSkeleton />
      ) : loadError ? (
        <OfflinePanel message={loadError} onRetry={loadArticle} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <div className="card p-5">
              <textarea
                ref={titleRef}
                rows={1}
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titre de l’article…"
                aria-label="Titre de l’article"
                className="w-full resize-none bg-transparent text-3xl leading-tight font-extrabold tracking-tight outline-none placeholder:text-faint"
              />
              <div className="mt-3 flex items-center gap-2">
                <span className="font-mono text-xs text-faint">/article/</span>
                <input
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="slug-genere-automatiquement"
                  aria-label="Slug de l’article"
                  className="flex-1 rounded-md border border-line bg-paper/70 px-2.5 py-1.5 font-mono text-xs outline-none transition focus:border-terracotta"
                />
                <button
                  type="button"
                  className="icon-btn border border-line bg-card"
                  title="Régénérer le slug depuis le titre"
                  onClick={regenerateSlug}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="rail-label" htmlFor="editor-excerpt">
                    Extrait
                  </label>
                  <span className="font-mono text-[11px] text-faint">{form.excerpt.length} car.</span>
                </div>
                <textarea
                  id="editor-excerpt"
                  rows={3}
                  className="field resize-y"
                  placeholder="Résumé court affiché dans les listes d’articles et le SEO…"
                  value={form.excerpt}
                  onChange={(e) => patch({ excerpt: e.target.value })}
                />
              </div>
            </div>

            <AiPanel
              editor={editor}
              aiConfigured={aiConfigured}
              language={aiLanguage}
              onLanguageChange={setAiLanguage}
              title={form.title}
              hasExistingContent={hasExistingContent}
              onGenerated={handleGenerated}
              onTitlePick={handleTitlePick}
            />

            <RichEditor value={form.content} onChange={handleContentChange} onReady={setEditor} />
          </div>

          <aside className="rail-scroll space-y-4 self-start xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto xl:pr-1 xl:pb-6">
            <RailSection title="Publication" icon={Send}>
              <PublishPanel
                status={form.status}
                onStatusChange={(status) => patch({ status })}
                scheduledFor={form.scheduledFor}
                onScheduledForChange={(scheduledFor) => patch({ scheduledFor })}
                websites={websites}
                selected={form.websites}
                onSelectedChange={(ids) => patch({ websites: ids })}
                featured={form.featured}
                onFeaturedChange={(featured) => patch({ featured })}
                category={form.category}
                onCategoryChange={(category) => patch({ category })}
                tags={form.tags}
                onTagsChange={(tags) => patch({ tags })}
                saving={saving}
                onSave={() => save()}
                onSaveDraft={() => save('draft')}
              />
            </RailSection>

            <RailSection title="Image de couverture" icon={ImageIcon}>
              <CoverImagePicker
                value={form.coverImage}
                onChange={(coverImage) => patch({ coverImage })}
              />
            </RailSection>

            <RailSection title="Référencement (SEO)" icon={Search}>
              <SeoPanel
                seo={form.seo}
                onSeoChange={patchSeo}
                title={form.title}
                slug={form.slug}
                excerpt={form.excerpt}
                coverImageUrl={form.coverImage.url}
                aiConfigured={aiConfigured}
                generating={seoGenerating}
                onGenerate={generateSeo}
              />
            </RailSection>
          </aside>
        </div>
      )}
    </div>
  );
}
