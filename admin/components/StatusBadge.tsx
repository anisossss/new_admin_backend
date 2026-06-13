import type { ArticleStatus } from '@/lib/types';

const STATUS_MAP: Record<ArticleStatus, { label: string; chip: string; dot: string }> = {
  published: { label: 'Publié', chip: 'bg-success-soft text-success', dot: 'bg-success' },
  draft: { label: 'Brouillon', chip: 'bg-amber-soft text-amber-deep', dot: 'bg-amber' },
  scheduled: { label: 'Programmé', chip: 'bg-sky-soft text-sky', dot: 'bg-sky' },
};

export default function StatusBadge({ status }: { status: ArticleStatus }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}
