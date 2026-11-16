/**
 * Drapeau d'un pays (2026-11-16). Les emoji drapeaux ne s'affichent pas sous
 * Windows (on y voit seulement « FR », « DE »…) : on sert donc de vraies
 * images SVG, hébergées sur le site (public/flags, paquet flag-icons, licence
 * MIT). Pays inconnu ou « tous pays » : un globe.
 */
import { SUPPORTED_COUNTRIES } from "../../i18n/countries";

const KNOWN = new Set<string>(SUPPORTED_COUNTRIES);

export function CountryFlag({ code, size = 18, className }: { code: string; size?: number; className?: string }) {
  const height = Math.round((size * 3) / 4);
  if (!KNOWN.has(code)) {
    return (
      <svg viewBox="0 0 24 24" width={height + 2} height={height + 2} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- petite image SVG statique, pas besoin de next/image
    <img
      src={`/flags/${code.toLowerCase()}.svg`}
      alt=""
      width={size}
      height={height}
      loading="lazy"
      className={`inline-block shrink-0 rounded-[2px] object-cover ring-1 ring-black/10 ${className ?? ""}`}
      style={{ width: size, height }}
    />
  );
}
