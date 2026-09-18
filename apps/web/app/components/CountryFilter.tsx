"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SUPPORTED_COUNTRIES, COUNTRY_FLAGS, type CountryCode } from "../../i18n/countries";

const COOKIE_NAME = "NEXT_COUNTRY";
const INTERNATIONAL_VALUE = "ALL";

export function CountryFilter({ current }: { current: CountryCode | null }) {
  const t = useTranslations("CountryFilter");
  const router = useRouter();

  function onChange(value: string) {
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <select
      aria-label={t("label")}
      value={current ?? INTERNATIONAL_VALUE}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-alt"
    >
      {SUPPORTED_COUNTRIES.map((code) => (
        <option key={code} value={code}>
          {COUNTRY_FLAGS[code]} {t(`countryName.${code}`)}
        </option>
      ))}
      <option value={INTERNATIONAL_VALUE}>🌍 {t("international")}</option>
    </select>
  );
}
