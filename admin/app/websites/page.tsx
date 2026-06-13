'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, Pencil, Terminal } from 'lucide-react';
import { errorMessage, getStats, getWebsites, updateWebsite } from '@/lib/api';
import type { Stats, Website } from '@/lib/types';
import Skeleton from '@/components/Skeleton';
import OfflinePanel from '@/components/OfflinePanel';
import Switch from '@/components/Switch';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { formatNumber } from '@/lib/format';

const LANGUAGE_LABELS: Record<string, string> = { fr: 'FR', en: 'EN', ar: 'AR' };

export default function WebsitesPage() {
  const toast = useToast();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Website | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', url: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sites, s] = await Promise.all([getWebsites(), getStats().catch(() => null)]);
      setWebsites(sites);
      setStats(s);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statsFor = (slug: string) => stats?.perWebsite.find((w) => w.slug === slug);

  const toggleActive = async (site: Website) => {
    setTogglingId(site._id);
    const next = !site.active;
    setWebsites((current) => current.map((w) => (w._id === site._id ? { ...w, active: next } : w)));
    try {
      await updateWebsite(site._id, { active: next });
      toast.success(next ? `${site.name} activé.` : `${site.name} désactivé.`);
    } catch (err) {
      setWebsites((current) => current.map((w) => (w._id === site._id ? { ...w, active: !next } : w)));
      toast.error(errorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const openEdit = (site: Website) => {
    setEditing(site);
    setEditForm({ name: site.name, description: site.description || '', url: site.url || '' });
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editForm.name.trim()) {
      toast.error('Le nom du site est requis.');
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await updateWebsite(editing._id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        url: editForm.url.trim(),
      });
      setWebsites((current) => current.map((w) => (w._id === editing._id ? { ...w, ...updated } : w)));
      toast.success('Site mis à jour.');
      setEditing(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Sites</h1>
        <p className="mt-1 text-sm text-muted">
          Les 5 journaux de la plateforme — chaque article peut être publié sur n’importe quelle combinaison.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : error ? (
        <OfflinePanel message={error} onRetry={load} />
      ) : websites.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta-soft text-terracotta">
            <Terminal className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-base font-extrabold tracking-tight">Aucun site enregistré</h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            Les 5 sites sont créés par le script de seed du backend. Lancez la commande ci-dessous puis
            rechargez la page.
          </p>
          <p className="mt-4 rounded-lg bg-paper px-3 py-2 font-mono text-xs text-muted">
            cd backend &amp;&amp; npm run seed
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {websites.map((site) => {
              const siteStats = statsFor(site.slug);
              return (
                <article key={site._id} className="card overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: site.themeColor }} aria-hidden="true" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold text-white"
                          style={{ backgroundColor: site.themeColor }}
                          aria-hidden="true"
                        >
                          {site.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-extrabold tracking-tight">{site.name}</h2>
                          <p className="truncate font-mono text-[11px] text-faint">{site.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {togglingId === site._id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />}
                        <Switch
                          checked={site.active}
                          onChange={() => toggleActive(site)}
                          disabled={togglingId === site._id}
                          label={`Activer ${site.name}`}
                        />
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted">
                      {site.description || 'Aucune description.'}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      <span className="rounded-full border border-line bg-paper px-2 py-0.5">
                        {LANGUAGE_LABELS[site.language] || site.language.toUpperCase()}
                      </span>
                      <span className="rounded-full border border-line bg-paper px-2 py-0.5">
                        {formatNumber(siteStats?.articles)} article{(siteStats?.articles ?? 0) > 1 ? 's' : ''}
                      </span>
                      <span className="rounded-full border border-line bg-paper px-2 py-0.5">
                        {formatNumber(siteStats?.views)} vues
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          site.active ? 'bg-success-soft text-success' : 'bg-paper text-faint'
                        }`}
                      >
                        {site.active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                      <button type="button" className="btn btn-ghost flex-1 py-1.5 text-xs" onClick={() => openEdit(site)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Modifier
                      </button>
                      {site.url && (
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost flex-1 py-1.5 text-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Ouvrir
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            La création et la suppression des sites se font côté backend (
            <code className="font-mono">npm run seed</code>).
          </p>
        </>
      )}

      <Modal
        open={editing !== null}
        title={editing ? `Modifier ${editing.name}` : 'Modifier le site'}
        width="max-w-md"
        onClose={() => !savingEdit && setEditing(null)}
      >
        <div className="space-y-4">
          <div>
            <label className="rail-label mb-1.5" htmlFor="site-name">
              Nom
            </label>
            <input
              id="site-name"
              className="field"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              disabled={savingEdit}
            />
          </div>
          <div>
            <label className="rail-label mb-1.5" htmlFor="site-url">
              URL
            </label>
            <input
              id="site-url"
              className="field font-mono text-xs"
              placeholder="http://localhost:3001"
              value={editForm.url}
              onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
              disabled={savingEdit}
            />
          </div>
          <div>
            <label className="rail-label mb-1.5" htmlFor="site-description">
              Description
            </label>
            <textarea
              id="site-description"
              className="field min-h-20 resize-y"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              disabled={savingEdit}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)} disabled={savingEdit}>
              Annuler
            </button>
            <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={savingEdit}>
              {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
