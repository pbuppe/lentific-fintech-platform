import type { StatsRange } from "@fintech/database";

const RANGES: { value: StatsRange; labelKey: string }[] = [
  { value: "24h", labelKey: "range24h" },
  { value: "7d", labelKey: "range7d" },
  { value: "30d", labelKey: "range30d" },
  { value: "1y", labelKey: "range1y" },
];

export function TimeRangeFilter({ current, t }: { current: StatsRange; t: (key: string) => string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {RANGES.map((r) => (
        <a
          key={r.value}
          href={`/statistiques?range=${r.value}`}
          className={
            r.value === current
              ? "rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
              : "rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-alt"
          }
        >
          {t(r.labelKey)}
        </a>
      ))}
    </div>
  );
}
