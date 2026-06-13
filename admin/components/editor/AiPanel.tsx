'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { ChevronDown, Heading1, Loader2, RefreshCcw, Sparkles, Wand2 } from 'lucide-react';
import { aiGenerate, aiReformulate, aiTitles, errorMessage } from '@/lib/api';
import type { AiLength, AiMode, AiTone, GenerateResult, Language } from '@/lib/types';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

const AI_DISABLED_HINT =
  'IA indisponible — ajoutez ANTHROPIC_API_KEY dans backend/.env puis redémarrez le backend.';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
];

const TONES: { value: AiTone; label: string }[] = [
  { value: 'neutre', label: 'Neutre' },
  { value: 'formel', label: 'Formel' },
  { value: 'dynamique', label: 'Dynamique' },
  { value: 'analytique', label: 'Analytique' },
];

const LENGTHS: { value: AiLength; label: string }[] = [
  { value: 'court', label: 'Court (≈ 300 mots)' },
  { value: 'moyen', label: 'Moyen (≈ 600 mots)' },
  { value: 'long', label: 'Long (1000+ mots)' },
];

const MODES: { value: AiMode; label: string }[] = [
  { value: 'ameliorer', label: 'Améliorer' },
  { value: 'raccourcir', label: 'Raccourcir' },
  { value: 'developper', label: 'Développer' },
  { value: 'simplifier', label: 'Simplifier' },
  { value: 'professionnel', label: 'Ton professionnel' },
];

function AiDots() {
  return (
    <span className="ai-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

interface AiPanelProps {
  editor: Editor | null;
  aiConfigured: boolean;
  language: Language;
  onLanguageChange: (language: Language) => void;
  title: string;
  hasExistingContent: boolean;
  onGenerated: (result: GenerateResult) => void;
  onTitlePick: (title: string) => void;
}

export default function AiPanel({
  editor,
  aiConfigured,
  language,
  onLanguageChange,
  title,
  hasExistingContent,
  onGenerated,
  onTitlePick,
}: AiPanelProps) {
  const toast = useToast();
  const [open, setOpen] = useState(true);

  // Génération d'article
  const [genOpen, setGenOpen] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [topic, setTopic] = useState('');
  const [genLanguage, setGenLanguage] = useState<Language>(language);
  const [tone, setTone] = useState<AiTone>('neutre');
  const [length, setLength] = useState<AiLength>('moyen');
  const [instructions, setInstructions] = useState('');

  // Reformulation
  const [mode, setMode] = useState<AiMode>('ameliorer');
  const [reformulating, setReformulating] = useState(false);

  // Suggestions de titres
  const [titles, setTitles] = useState<string[]>([]);
  const [titlesLoading, setTitlesLoading] = useState(false);

  const disabledTitle = aiConfigured ? undefined : AI_DISABLED_HINT;

  const openGenerateDialog = () => {
    setGenLanguage(language);
    if (!topic && title.trim()) setTopic(title.trim());
    setGenOpen(true);
  };

  const runGenerate = async () => {
    setConfirmOverwrite(false);
    setGenLoading(true);
    try {
      const result = await aiGenerate({
        topic: topic.trim(),
        language: genLanguage,
        tone,
        length,
        instructions: instructions.trim() || undefined,
      });
      onLanguageChange(genLanguage);
      onGenerated(result);
      setGenOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setGenLoading(false);
    }
  };

  const submitGenerate = () => {
    if (!topic.trim()) {
      toast.error('Décrivez d’abord le sujet de l’article.');
      return;
    }
    if (hasExistingContent) {
      setConfirmOverwrite(true);
      return;
    }
    runGenerate();
  };

  const reformulate = async () => {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    const selectedText = empty ? '' : editor.state.doc.textBetween(from, to, '\n');
    const isSelection = selectedText.trim().length > 0;
    const text = isSelection ? selectedText : editor.getHTML();
    if (!isSelection && editor.state.doc.textContent.trim().length === 0) {
      toast.error('Il n’y a encore rien à reformuler.');
      return;
    }
    setReformulating(true);
    try {
      const result = await aiReformulate({ text, mode, language });
      if (isSelection) {
        editor.chain().focus().insertContentAt({ from, to }, result.text).run();
      } else {
        editor.commands.setContent(result.text, { emitUpdate: true });
      }
      toast.success(isSelection ? 'Sélection reformulée.' : 'Article entier reformulé.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setReformulating(false);
    }
  };

  const suggestTitles = async () => {
    const content = editor ? editor.state.doc.textContent.slice(0, 4000).trim() : '';
    if (!title.trim() && !content) {
      toast.error('Ajoutez un titre ou du contenu avant de demander des suggestions.');
      return;
    }
    setTitlesLoading(true);
    try {
      const result = await aiTitles({
        topic: title.trim() || undefined,
        content: content || undefined,
        language,
      });
      setTitles(result.titles || []);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setTitlesLoading(false);
    }
  };

  return (
    <section className="card overflow-hidden border-terracotta/25">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-soft text-terracotta">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-extrabold tracking-tight">Assistant IA</span>
          <span className="block text-[11px] font-semibold text-muted">
            Génération, reformulation et titres avec Claude
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform ${open ? '' : '-rotate-90'}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-line px-4 py-4">
          {!aiConfigured && (
            <p className="rounded-lg bg-amber-soft px-3 py-2 text-xs leading-relaxed font-semibold text-amber-deep">
              {AI_DISABLED_HINT}
            </p>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor="ai-language" className="rail-label">
              Langue de travail
            </label>
            <select
              id="ai-language"
              className="field w-auto py-1.5 text-xs font-bold"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-lg border border-line bg-paper/60 p-3">
              <p className="text-xs font-extrabold">Générer un article</p>
              <p className="mt-0.5 mb-2.5 text-[11px] leading-snug text-muted">
                Sujet → article complet : titre, extrait, contenu, catégorie et étiquettes.
              </p>
              <button
                type="button"
                className="btn btn-primary w-full py-1.5 text-xs"
                disabled={!aiConfigured}
                title={disabledTitle}
                onClick={openGenerateDialog}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Générer
              </button>
            </div>

            <div className="rounded-lg border border-line bg-paper/60 p-3">
              <p className="text-xs font-extrabold">Reformuler</p>
              <p className="mt-0.5 mb-2.5 text-[11px] leading-snug text-muted">
                S’applique à la sélection, sinon à tout l’article.
              </p>
              <div className="flex gap-1.5">
                <select
                  className="field flex-1 py-1.5 text-xs font-bold"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as AiMode)}
                  aria-label="Mode de reformulation"
                  disabled={!aiConfigured}
                  title={disabledTitle}
                >
                  {MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-ghost px-2.5 py-1.5 text-xs"
                  disabled={!aiConfigured || reformulating || !editor}
                  title={disabledTitle ?? 'Appliquer la reformulation'}
                  onClick={reformulate}
                >
                  {reformulating ? <AiDots /> : <RefreshCcw className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-paper/60 p-3">
              <p className="text-xs font-extrabold">Suggérer des titres</p>
              <p className="mt-0.5 mb-2.5 text-[11px] leading-snug text-muted">
                5 angles différents à partir du contenu actuel.
              </p>
              <button
                type="button"
                className="btn btn-ghost w-full py-1.5 text-xs"
                disabled={!aiConfigured || titlesLoading}
                title={disabledTitle}
                onClick={suggestTitles}
              >
                {titlesLoading ? (
                  <>
                    Recherche <AiDots />
                  </>
                ) : (
                  <>
                    <Heading1 className="h-3.5 w-3.5" />
                    Suggérer
                  </>
                )}
              </button>
            </div>
          </div>

          {titles.length > 0 && (
            <div>
              <p className="rail-label mb-1.5">Titres proposés — cliquez pour appliquer</p>
              <ul className="space-y-1">
                {titles.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => {
                        onTitlePick(suggestion);
                        toast.success('Titre appliqué.');
                      }}
                      className="w-full rounded-lg border border-line bg-card px-3 py-2 text-left text-sm font-semibold transition hover:border-terracotta hover:bg-terracotta-soft/40"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Modal
        open={genOpen}
        title="Générer un article avec l’IA"
        width="max-w-xl"
        onClose={() => !genLoading && setGenOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="rail-label mb-1.5" htmlFor="ai-topic">
              Sujet de l’article
            </label>
            <textarea
              id="ai-topic"
              className="field min-h-20 resize-y"
              placeholder="Ex. : Les exportations tunisiennes d’huile d’olive atteignent un niveau record…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={genLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="rail-label mb-1.5" htmlFor="ai-gen-language">
                Langue
              </label>
              <select
                id="ai-gen-language"
                className="field"
                value={genLanguage}
                onChange={(e) => setGenLanguage(e.target.value as Language)}
                disabled={genLoading}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="rail-label mb-1.5" htmlFor="ai-tone">
                Ton
              </label>
              <select
                id="ai-tone"
                className="field"
                value={tone}
                onChange={(e) => setTone(e.target.value as AiTone)}
                disabled={genLoading}
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="rail-label mb-1.5" htmlFor="ai-length">
                Longueur
              </label>
              <select
                id="ai-length"
                className="field"
                value={length}
                onChange={(e) => setLength(e.target.value as AiLength)}
                disabled={genLoading}
              >
                {LENGTHS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="rail-label mb-1.5" htmlFor="ai-instructions">
              Instructions complémentaires <span className="font-normal lowercase">(optionnel)</span>
            </label>
            <textarea
              id="ai-instructions"
              className="field min-h-16 resize-y"
              placeholder="Angle, sources à mentionner, public visé…"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={genLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setGenOpen(false)}
              disabled={genLoading}
            >
              Annuler
            </button>
            <button type="button" className="btn btn-primary" onClick={submitGenerate} disabled={genLoading}>
              {genLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération en cours <AiDots />
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Générer l’article
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOverwrite}
        title="Écraser le contenu actuel ?"
        message="La génération remplacera le titre, l’extrait, le contenu, la catégorie et les étiquettes déjà saisis. Cette action ne peut pas être annulée."
        confirmLabel="Écraser et générer"
        onConfirm={runGenerate}
        onClose={() => setConfirmOverwrite(false)}
      />
    </section>
  );
}
