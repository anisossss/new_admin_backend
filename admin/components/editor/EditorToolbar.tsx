'use client';

import { useEffect, useReducer, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Youtube,
} from 'lucide-react';
import { errorMessage, uploadFile } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

function ToolButton({
  onClick,
  active = false,
  disabled = false,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition disabled:pointer-events-none disabled:opacity-40 ${
        active ? 'bg-terracotta-soft text-terracotta' : 'text-muted hover:bg-paper hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden="true" />;
}

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  // Re-rendu sur chaque transaction pour rafraîchir les états actifs.
  useEffect(() => {
    if (!editor) return;
    editor.on('transaction', forceRender);
    return () => {
      editor.off('transaction', forceRender);
    };
  }, [editor]);

  if (!editor) {
    return <div className="h-12 border-b border-line bg-paper/50" aria-hidden="true" />;
  }

  const block = editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
      ? 'h3'
      : 'p';

  const setBlock = (value: string) => {
    const chain = editor.chain().focus();
    if (value === 'h2') chain.setHeading({ level: 2 }).run();
    else if (value === 'h3') chain.setHeading({ level: 3 }).run();
    else chain.setParagraph().run();
  };

  const openLinkDialog = () => {
    setLinkUrl(editor.getAttributes('link').href || '');
    setLinkOpen(true);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkOpen(false);
  };

  const applyYoutube = () => {
    const url = youtubeUrl.trim();
    if (!/youtu\.?be/.test(url)) {
      toast.error('Collez une URL YouTube valide (youtube.com ou youtu.be).');
      return;
    }
    editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
    setYoutubeUrl('');
    setYoutubeOpen(false);
  };

  const handleImageChosen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast.success('Image insérée dans l’article.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-paper/50 px-2 py-2">
        <select
          value={block}
          onChange={(e) => setBlock(e.target.value)}
          aria-label="Style de bloc"
          className="mr-1 h-8 rounded-md border border-line bg-card px-2 text-xs font-bold text-ink outline-none transition focus:border-terracotta"
        >
          <option value="p">Paragraphe</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
        </select>

        <ToolButton
          label="Gras"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Italique"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Souligné"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Barré"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Surligner"
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleMark('highlight').run()}
        >
          <Highlighter className="h-4 w-4" />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Liste à puces"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Liste numérotée"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Citation"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Aligner à gauche"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Centrer"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Aligner à droite"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </ToolButton>

        <Divider />

        <ToolButton label="Lien" active={editor.isActive('link')} onClick={openLinkDialog}>
          <Link2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Insérer une image"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </ToolButton>
        <ToolButton label="Intégrer une vidéo YouTube" onClick={() => setYoutubeOpen(true)}>
          <Youtube className="h-4 w-4" />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Annuler"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Rétablir"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChosen}
        />
      </div>

      <Modal open={linkOpen} title="Insérer un lien" width="max-w-md" onClose={() => setLinkOpen(false)}>
        <label className="rail-label mb-1.5" htmlFor="toolbar-link-url">
          URL du lien
        </label>
        <input
          id="toolbar-link-url"
          className="field font-mono text-xs"
          placeholder="https://exemple.tn/page"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyLink()}
          autoFocus
        />
        <div className="mt-5 flex justify-between gap-2">
          <button
            type="button"
            className="btn btn-ghost text-danger"
            onClick={removeLink}
            disabled={!editor.isActive('link')}
          >
            Supprimer le lien
          </button>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setLinkOpen(false)}>
              Annuler
            </button>
            <button type="button" className="btn btn-primary" onClick={applyLink}>
              Appliquer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={youtubeOpen}
        title="Intégrer une vidéo YouTube"
        width="max-w-md"
        onClose={() => setYoutubeOpen(false)}
      >
        <label className="rail-label mb-1.5" htmlFor="toolbar-youtube-url">
          URL de la vidéo
        </label>
        <input
          id="toolbar-youtube-url"
          className="field font-mono text-xs"
          placeholder="https://www.youtube.com/watch?v=…"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyYoutube()}
          autoFocus
        />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setYoutubeOpen(false)}>
            Annuler
          </button>
          <button type="button" className="btn btn-primary" onClick={applyYoutube}>
            Intégrer
          </button>
        </div>
      </Modal>
    </>
  );
}
