'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { deleteArticle, duplicateArticle, errorMessage, getArticles, getWebsites } from '@/lib/api';
import type { Article, Website } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import SiteChips from '@/components/SiteChips';
import Skeleton from '@/components/Skeleton';
import OfflinePanel from '@/components/OfflinePanel';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { formatDateTime, formatNumber } from '@/lib/format';

const PAGE_SIZE = 10;

function EmptyState({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {/* Illustration en CSS pur : pile de feuilles */}
      <div className="relative h-24 w-24" aria-hidden="true">
        <div className="absolute inset-2 -rotate-6 rounded-lg border-2 border-line bg-paper" />
        <div className="absolute inset-2 rotate-3 rounded-lg border-2 border-line bg-card" />
        <div className="absolute inset-2 rounded-lg border-2 border-terracotta/40 bg-card p-3">
          <div className="h-1.5 w-3/4 rounded-full bg-terracotta/50" />
          <div className="mt-2 h-1 w-full rounded-full bg-line" />
          <div className="mt-1.5 h-1 w-5/6 rounded-full bg-line" />
          <div className="mt-1.5 h-1 w-2/3 rounded-full bg-line" />
        </div>
      </div>
      <h2 className="mt-5 text-base font-extrabold tracking-tight">
        {filtered ? 'Aucun article ne correspond' : 'Aucun article pour l’instant'}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted">
        {filtered
          ? 'Essayez d’élargir la recherche ou de réinitialiser les filtres.'
          : 'Rédigez votre premier article et publiez-le sur les 5 sites en un clic.'}
      </p>
      {filtered ? (
        <button type="button" className="btn btn-ghost mt-5" onClick={onClear}>
          Réinitialiser les filtres
        </button>
      ) : (
        <Link href="/articles/new" className="btn btn-primary mt-5">
          <Plus className="h-4 w-4" />
          Nouvel article
        </Link>
      )}
    </div>
  );
}

export default function ArticlesPage() {
  const toast = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getWebsites()
      .then(setWebsites)
      .catch(() => setWebsites([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getArticles({
        search: debouncedSearch || undefined,
        status: status || undefined,
        website: website || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setArticles(data.articles);
      setTotal(data.total);
      setPages(Math.max(1, data.pages));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, website, page]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = debouncedSearch !== '' || status !== '' || website !== '';

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setWebsite('');
    setPage(1);
  };

  const handleDuplicate = async (article: Article) => {
    try {
      await duplicateArticle(article._id);
      toast.success(`« ${article.title} » dupliqué en brouillon.`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteArticle(toDelete._id);
      toast.success('Article supprimé.');
      setToDelete(null);
      if (articles.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Articles</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? 'Chargement…' : `${formatNumber(total)} article${total > 1 ? 's' : ''} au total`}
          </p>
        </div>
        <Link href="/articles/new" className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nouvel article
        </Link>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            className="field pl-9"
            placeholder="Rechercher un titre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un article"
          />
        </div>
        <select
          className="field w-auto"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
          <option value="scheduled">Programmé</option>
        </select>
        <select
          className="field w-auto"
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value);
            setPage(1);
          }}
          aria-label="Filtrer par site"
        >
          <option value="">Tous les sites</option>
          {websites.map((site) => (
            <option key={site._id} value={site._id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <OfflinePanel message={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="card">
          <EmptyState filtered={filtered} onClear={clearFilters} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-paper/60 text-[11px] font-bold tracking-wide text-muted uppercase">
                  <th className="px-4 py-3">Article</th>
                  <th className="px-3 py-3">Catégorie</th>
                  <th className="px-3 py-3">Sites</th>
                  <th className="px-3 py-3">Statut</th>
                  <th className="px-3 py-3">Vues</th>
                  <th className="px-3 py-3">Modifié</th>
                  <th className="px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article._id} className="border-t border-line transition hover:bg-paper/50">
                    <td className="max-w-[320px] px-4 py-3">
                      <div className="flex items-center gap-3">
                        {article.coverImage?.url ? (
                          <Image
                            src={article.coverImage.url}
                            alt=""
                            width={64}
                            height={44}
                            className="h-11 w-16 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md bg-paper text-faint">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/articles/${article._id}`}
                            className="block truncate font-semibold hover:text-terracotta"
                          >
                            {article.title}
                          </Link>
                          <p className="truncate font-mono text-[11px] text-faint">/{article.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full bg-paper px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-muted">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <SiteChips websites={article.websites} max={2} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-muted">{formatNumber(article.views)}</td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap text-muted">
                      {formatDateTime(article.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <Link href={`/articles/${article._id}`} className="icon-btn" title="Éditer">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Dupliquer"
                          onClick={() => handleDuplicate(article)}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="icon-btn hover:bg-danger-soft hover:text-danger"
                          title="Supprimer"
                          onClick={() => setToDelete(article)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <p className="text-xs text-muted">
              Page <span className="font-bold">{page}</span> sur {pages} · {formatNumber(total)} article
              {total > 1 ? 's' : ''}
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                className="btn btn-ghost px-2.5 py-1.5"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="btn btn-ghost px-2.5 py-1.5"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                aria-label="Page suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer l’article ?"
        message={
          toDelete
            ? `« ${toDelete.title} » sera définitivement supprimé de tous les sites. Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
