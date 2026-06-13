import type { Website } from '@/lib/types';

interface SiteChipsProps {
  websites: (Website | string)[];
  max?: number;
}

export default function SiteChips({ websites, max = 3 }: SiteChipsProps) {
  const sites = (websites || []).filter(
    (w): w is Website => typeof w === 'object' && w !== null && 'name' in w
  );

  if (sites.length === 0) {
    return <span className="text-xs text-faint">Aucun site</span>;
  }

  const shown = sites.slice(0, max);
  const extra = sites.length - shown.length;

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {shown.map((site) => (
        <span
          key={site._id ?? site.slug}
          title={site.name}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2 py-0.5 text-[11px] font-semibold text-ink"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: site.themeColor || '#a9adb2' }}
            aria-hidden="true"
          />
          {site.name}
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-bold text-muted">
          +{extra}
        </span>
      )}
    </span>
  );
}
