'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { errorMessage, uploadFile } from '@/lib/api';
import type { CoverImage } from '@/lib/types';
import { useToast } from '@/components/Toast';

interface CoverImagePickerProps {
  value: { url: string; alt: string };
  onChange: (value: { url: string; alt: string }) => void;
}

export default function CoverImagePicker({ value, onChange }: CoverImagePickerProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Choisissez un fichier image (PNG, JPG, WebP…).');
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      onChange({ url, alt: value.alt });
      toast.success('Image de couverture téléversée.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const onFileChosen = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) upload(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-3">
      {value.url ? (
        <div>
          <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-paper">
            <Image src={value.url} alt={value.alt || 'Image de couverture'} fill className="object-cover" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-shell/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="btn btn-ghost flex-1 py-1.5 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Remplacer
            </button>
            <button
              type="button"
              className="btn btn-ghost flex-1 py-1.5 text-xs text-danger"
              onClick={() => onChange({ url: '', alt: '' })}
              disabled={uploading}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Retirer
            </button>
          </div>
        </div>
      ) : (
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
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragActive
              ? 'border-terracotta bg-terracotta-soft/50'
              : 'border-line bg-paper/60 hover:border-terracotta/50 hover:bg-terracotta-soft/30'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
          ) : (
            <ImagePlus className="h-6 w-6 text-terracotta" />
          )}
          <span className="text-sm font-bold">
            {uploading ? 'Téléversement…' : 'Glissez une image ici'}
          </span>
          <span className="text-[11px] text-muted">ou cliquez pour parcourir · 8 Mo max</span>
        </button>
      )}

      <div>
        <label className="rail-label mb-1.5" htmlFor="cover-alt">
          Texte alternatif
        </label>
        <input
          id="cover-alt"
          className="field"
          placeholder="Description de l’image pour l’accessibilité"
          value={value.alt}
          onChange={(e) => onChange({ url: value.url, alt: e.target.value })}
        />
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChosen} />
    </div>
  );
}
