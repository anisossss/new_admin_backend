'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent, Mark, mergeAttributes, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder, CharacterCount } from '@tiptap/extensions';
import EditorToolbar from './EditorToolbar';
import { formatNumber } from '@/lib/format';

// Le StarterKit v3 n'embarque pas de surlignage : mini-marque <mark> locale,
// activée via toggleMark('highlight') dans la barre d'outils.
const Highlight = Mark.create({
  name: 'highlight',
  parseHTML() {
    return [{ tag: 'mark' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(HTMLAttributes), 0];
  },
});

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  onReady?: (editor: Editor | null) => void;
}

export default function RichEditor({ value, onChange, onReady }: RichEditorProps) {
  const [counts, setCounts] = useState({ words: 0, characters: 0 });

  const editor = useEditor({
    immediatelyRender: false,                  // REQUIRED for Next.js SSR
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),  // v3: link & underline are IN StarterKit
      Image,
      Youtube.configure({ width: 640, height: 360 }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Écrivez votre article…' }),
      CharacterCount,
      Highlight,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Expose l'instance au parent (AiPanel a besoin de la sélection).
  useEffect(() => {
    onReady?.(editor ?? null);
    return () => onReady?.(null);
  }, [editor, onReady]);

  // Synchronise le contenu externe (chargement d'article, génération IA).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  // Compteur de mots / caractères.
  useEffect(() => {
    if (!editor) return;
    const refresh = () => {
      setCounts({
        words: editor.storage.characterCount.words(),
        characters: editor.storage.characterCount.characters(),
      });
    };
    refresh();
    editor.on('update', refresh);
    return () => {
      editor.off('update', refresh);
    };
  }, [editor]);

  return (
    <div className="card overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-end gap-4 border-t border-line bg-paper/60 px-4 py-2">
        <span className="font-mono text-[11px] text-muted">{formatNumber(counts.words)} mots</span>
        <span className="font-mono text-[11px] text-muted">{formatNumber(counts.characters)} caractères</span>
      </div>
    </div>
  );
}
