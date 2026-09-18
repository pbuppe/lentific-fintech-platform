import { COUNTRY_FLAGS, type CountryCode } from "../../i18n/countries";

export function CountryBadge({ countryCode, currencyCode }: { countryCode: string; currencyCode: string }) {
  const flag = COUNTRY_FLAGS[countryCode as CountryCode] ?? "🌍";
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-alt px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
      <span>{flag}</span>
      <span>{countryCode}</span>
      <span className="text-ink-faint">·</span>
      <span>{currencyCode}</span>
    </span>
  );
}
