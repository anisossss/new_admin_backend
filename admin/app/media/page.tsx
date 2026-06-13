'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Image from 'next/image';
import { Check, Copy, Loader2, Trash2, Upload } from 'lucide-react';
import { deleteMedia, errorMessage, getMedia, uploadFile } from '@/lib/api';
import type { MediaItem } from '@/lib/types';
import Skeleton from '@/components/Skeleton';
import OfflinePanel from '@/components/OfflinePanel';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { formatBytes, formatDate } from '@/lib/format';

export default function MediaPage() {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getMedia());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadFiles = async (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) {
      toast.error('Seuls les fichiers image sont acceptés.');
      return;
    }
    setUploading(true);
    try {
      const results = await Promise.allSettled(images.map((file) => uploadFile(file)));
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.length - ok;
      if (ok > 0) toast.success(`${ok} image${ok > 1 ? 's' : ''} téléversée${ok > 1 ? 's' : ''}.`);
      if (failed > 0) toast.error(`${failed} téléversement${failed > 1 ? 's ont' : ' a'} échoué.`);
      load();
    } finally {
      setUploading(false);
    }
  };

  const onFilesChosen = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedUrl(item.url);
      toast.success('URL copiée dans le presse-papiers.');
      setTimeout(() => setCopiedUrl((current) => (current === item.url ? null : current)), 2000);
    } catch {
      toast.error('Impossible de copier l’URL.');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteMedia(toDelete.filename);
      toast.success('Média supprimé.');
      setToDelete(null);
      setItems((current) => current.filter((i) => i.filename !== toDelete.filename));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Médiathèque</h1>
        <p className="mt-1 text-sm text-muted">
          Toutes les images téléversées vers le backend, prêtes à illustrer vos articles.
        </p>
      </header>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        disabled={uploading}
        className={`mb-6 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragActive
            ? 'border-terracotta bg-terracotta-soft/50'
            : 'border-line bg-card hover:border-terracotta/50 hover:bg-terracotta-soft/20'
        }`}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
        ) : (
          <Upload className="h-6 w-6 text-terracotta" />
        )}
        <span className="text-sm font-bold">
          {uploading ? 'Téléversement en cours…' : 'Glissez des images ici'}
        </span>
        <span className="text-[11px] text-muted">ou cliquez pour parcourir · plusieurs fichiers · 8 Mo max</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFilesChosen}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : error ? (
        <OfflinePanel message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <div className="relative h-20 w-20" aria-hidden="true">
            <div className="absolute inset-1 -rotate-6 rounded-lg border-2 border-line bg-paper" />
            <div className="absolute inset-1 rounded-lg border-2 border-terracotta/40 bg-card p-2.5">
              <div className="h-8 rounded-md bg-terracotta-soft" />
              <div className="mt-1.5 h-1 w-2/3 rounded-full bg-line" />
            </div>
          </div>
          <h2 className="mt-5 text-base font-extrabold tracking-tight">Aucun média pour l’instant</h2>
          <p className="mt-1.5 text-sm text-muted">Importez vos premières images avec la zone ci-dessus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article key={item.filename} className="card group overflow-hidden">
              <div className="relative aspect-[4/3] bg-paper">
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="truncate font-mono text-[11px] font-semibold" title={item.filename}>
                  {item.filename}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {formatBytes(item.size)} · {formatDate(item.createdAt)}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    className="btn btn-ghost flex-1 px-2 py-1.5 text-[11px]"
                    onClick={() => copyUrl(item)}
                    title="Copier l’URL"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-success" />
                        Copiée
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copier l’URL
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="icon-btn border border-line hover:bg-danger-soft hover:text-danger"
                    title="Supprimer"
                    onClick={() => setToDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer ce média ?"
        message={
          toDelete
            ? `« ${toDelete.filename} » sera définitivement supprimé. Les articles qui l’utilisent afficheront une image cassée.`
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
