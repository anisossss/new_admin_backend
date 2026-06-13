'use client';

import { RefreshCw, ServerCrash } from 'lucide-react';

interface OfflinePanelProps {
  message?: string;
  retrying?: boolean;
  onRetry: () => void;
}

export default function OfflinePanel({ message, retrying = false, onRetry }: OfflinePanelProps) {
  return (
    <div className="card mx-auto flex max-w-xl flex-col items-center px-8 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta-soft text-terracotta">
        <ServerCrash className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-lg font-extrabold tracking-tight">Connexion au backend impossible</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {message || 'Le serveur ne répond pas. Vérifiez qu’il est bien démarré avant de réessayer.'}
      </p>
      <p className="mt-3 rounded-lg bg-paper px-3 py-2 font-mono text-xs text-muted">
        cd backend &amp;&amp; npm run dev
      </p>
      <button type="button" className="btn btn-primary mt-6" onClick={onRetry} disabled={retrying}>
        <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
        Réessayer
      </button>
    </div>
  );
}
