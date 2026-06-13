'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  Newspaper,
  Plus,
  Sparkles,
} from 'lucide-react';
import { getHealth } from '@/lib/api';
import type { Health } from '@/lib/types';

const NAV = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/articles', label: 'Articles', icon: Newspaper },
  { href: '/websites', label: 'Sites', icon: Globe },
  { href: '/media', label: 'Médias', icon: ImageIcon },
];

function HealthDot({ state, label }: { state: 'ok' | 'warn' | 'down' | 'unknown'; label: string }) {
  const dot =
    state === 'ok'
      ? 'bg-success'
      : state === 'warn'
        ? 'bg-amber'
        : state === 'down'
          ? 'bg-danger'
          : 'bg-white/30 animate-pulse';
  return (
    <span className="flex items-center gap-2 text-[11px] font-semibold text-white/55">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<Health | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const h = await getHealth();
        if (active) setHealth(h);
      } catch {
        if (active) setHealth(null);
      }
    };
    check();
    const timer = setInterval(check, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const apiState = health === undefined ? 'unknown' : health ? 'ok' : 'down';
  const aiState = health === undefined ? 'unknown' : health?.aiConfigured ? 'ok' : 'warn';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-shell text-white">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terracotta shadow-[0_6px_16px_-6px_rgba(217,98,43,0.7)]">
          <Newspaper className="h-5 w-5 text-white" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-extrabold tracking-tight">Newsroom Hub</p>
          <p className="truncate text-[11px] font-semibold tracking-wide text-white/45 uppercase">
            Tunisia News
          </p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Link
          href="/articles/new"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-terracotta px-3 py-2.5 text-sm font-bold text-white transition hover:bg-terracotta-deep"
        >
          <Plus className="h-4 w-4" />
          Nouvel article
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Navigation principale">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {active && (
                <span
                  className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-terracotta"
                  aria-hidden="true"
                />
              )}
              <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-terracotta' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 px-5 py-4">
        <HealthDot
          state={apiState}
          label={
            apiState === 'unknown'
              ? 'Vérification de l’API…'
              : apiState === 'ok'
                ? health?.mongo
                  ? 'API & MongoDB en ligne'
                  : 'API en ligne · Mongo hors ligne'
                : 'API hors ligne'
          }
        />
        <span className="flex items-center gap-2 text-[11px] font-semibold text-white/55">
          <Sparkles
            className={`h-3 w-3 ${aiState === 'ok' ? 'text-success' : aiState === 'warn' ? 'text-amber' : 'text-white/30'}`}
            aria-hidden="true"
          />
          {aiState === 'unknown' ? 'IA Claude…' : aiState === 'ok' ? 'IA Claude prête' : 'IA non configurée'}
        </span>
        <p className="pt-1 font-mono text-[10px] text-white/30">Console éditoriale · v1.0</p>
      </div>
    </aside>
  );
}
