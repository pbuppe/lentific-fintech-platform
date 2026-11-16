import { CountryFlag } from "./CountryFlag";

export function CountryBadge({ countryCode, currencyCode }: { countryCode: string; currencyCode: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-alt px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
      <CountryFlag code={countryCode} size={15} />
      <span>{countryCode}</span>
      <span className="text-ink-faint">·</span>
      <span>{currencyCode}</span>
    </span>
  );
}
