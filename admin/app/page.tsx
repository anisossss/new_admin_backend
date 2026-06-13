'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Database,
  Eye,
  FileText,
  Pencil,
  PenLine,
  Send,
  Server,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { errorMessage, getHealth, getStats } from '@/lib/api';
import type { Health, Stats } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import SiteChips from '@/components/SiteChips';
import Skeleton from '@/components/Skeleton';
import OfflinePanel from '@/components/OfflinePanel';
import { formatNumber, timeAgo } from '@/lib/format';

function StatCard({
  icon: Icon,
  tint,
  label,
  value,
  delta,
}: {
  icon: typeof FileText;
  tint: string;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-muted uppercase">{label}</p>
          <p className="mt-1.5 text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[11px] font-bold text-muted">
        <TrendingUp className="h-3 w-3 text-success" />
        {delta}
      </p>
    </div>
  );
}

function HealthRow({
  icon: Icon,
  label,
  ok,
  okText,
  badText,
  warn = false,
}: {
  icon: typeof Database;
  label: string;
  ok: boolean;
  okText: string;
  badText: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-paper px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted" />
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
          ok ? 'text-success' : warn ? 'text-amber-deep' : 'text-danger'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-success' : warn ? 'bg-amber' : 'bg-danger'}`}
          aria-hidden="true"
        />
        {ok ? okText : badText}
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, h] = await Promise.all([getStats(), getHealth().catch(() => null)]);
      setStats(s);
      setHealth(h);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = stats?.totals;
  const publishedPct = totals && totals.articles > 0 ? Math.round((totals.published / totals.articles) * 100) : 0;
  const avgViews = totals && totals.articles > 0 ? Math.round(totals.views / totals.articles) : 0;
  const maxArticles = Math.max(1, ...(stats?.perWebsite.map((w) => w.articles) ?? [1]));

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <header className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted">
          Vue d’ensemble de la rédaction et de la diffusion sur les 5 sites.
        </p>
      </header>

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <OfflinePanel message={error} onRetry={load} />
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={FileText}
              tint="bg-terracotta-soft text-terracotta"
              label="Articles"
              value={formatNumber(totals?.articles)}
              delta={`${formatNumber(totals?.websites)} sites desservis`}
            />
            <StatCard
              icon={Send}
              tint="bg-success-soft text-success"
              label="Publiés"
              value={formatNumber(totals?.published)}
              delta={`${publishedPct}% du total`}
            />
            <StatCard
              icon={PenLine}
              tint="bg-amber-soft text-amber-deep"
              label="Brouillons"
              value={formatNumber(totals?.drafts)}
              delta="en préparation"
            />
            <StatCard
              icon={Eye}
              tint="bg-sky-soft text-sky"
              label="Vues totales"
              value={formatNumber(totals?.views)}
              delta={`≈ ${formatNumber(avgViews)} / article`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="card p-5 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-terracotta" />
                <h2 className="text-sm font-extrabold tracking-tight">Répartition par site</h2>
              </div>
              {stats.perWebsite.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  Aucun site enregistré — lancez <code className="font-mono">npm run seed</code> dans{' '}
                  <code className="font-mono">backend/</code>.
                </p>
              ) : (
                <ul className="space-y-4">
                  {stats.perWebsite.map((site) => (
                    <li key={site.slug}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm font-bold">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: site.themeColor }}
                            aria-hidden="true"
                          />
                          {site.name}
                        </span>
                        <span className="font-mono text-xs text-muted">
                          {formatNumber(site.articles)} art. · {formatNumber(site.views)} vues
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-paper">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(4, Math.round((site.articles / maxArticles) * 100))}%`,
                            backgroundColor: site.themeColor,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Server className="h-4 w-4 text-terracotta" />
                <h2 className="text-sm font-extrabold tracking-tight">État du système</h2>
              </div>
              <div className="space-y-2">
                <HealthRow
                  icon={Server}
                  label="API backend"
                  ok={!!health}
                  okText="En ligne"
                  badText="Hors ligne"
                />
                <HealthRow
                  icon={Database}
                  label="MongoDB"
                  ok={!!health?.mongo}
                  okText="Connectée"
                  badText="Déconnectée"
                />
                <HealthRow
                  icon={Sparkles}
                  label="IA Claude"
                  ok={!!health?.aiConfigured}
                  okText="Clé configurée"
                  badText="Clé absente"
                  warn
                />
              </div>
              {!health?.aiConfigured && (
                <p className="mt-3 rounded-lg bg-amber-soft px-3 py-2 text-xs leading-relaxed text-amber-deep">
                  Ajoutez <code className="font-mono">ANTHROPIC_API_KEY</code> dans{' '}
                  <code className="font-mono">backend/.env</code> pour activer l’assistant IA.
                </p>
              )}
            </section>
          </div>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-sm font-extrabold tracking-tight">Articles récents</h2>
              <Link href="/articles" className="text-xs font-bold text-terracotta hover:text-terracotta-deep">
                Tout voir →
              </Link>
            </div>
            {stats.recent.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted">
                Aucun article pour l’instant —{' '}
                <Link href="/articles/new" className="font-bold text-terracotta hover:underline">
                  rédigez le premier
                </Link>
                .
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[11px] font-bold tracking-wide text-muted uppercase">
                      <th className="px-5 py-3">Titre</th>
                      <th className="px-3 py-3">Sites</th>
                      <th className="px-3 py-3">Statut</th>
                      <th className="px-3 py-3">Modifié</th>
                      <th className="px-5 py-3 text-right">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.map((article) => (
                      <tr key={article._id} className="border-t border-line transition hover:bg-paper/60">
                        <td className="max-w-[340px] px-5 py-3">
                          <Link
                            href={`/articles/${article._id}`}
                            className="block truncate font-semibold hover:text-terracotta"
                          >
                            {article.title}
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <SiteChips websites={article.websites} max={2} />
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={article.status} />
                        </td>
                        <td className="px-3 py-3 text-xs whitespace-nowrap text-muted">
                          {timeAgo(article.updatedAt)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/articles/${article._id}`}
                            className="icon-btn ml-auto"
                            title="Éditer l’article"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
