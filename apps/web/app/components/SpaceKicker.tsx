import { getTranslations } from "next-intl/server";

/** Petit intitulé au-dessus des titres : « Espace client » / « Espace investisseur » (traduit). */
export async function SpaceKicker({ audience }: { audience: "borrower" | "investor" }) {
  const t = await getTranslations("Premium");
  return <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t(`${audience}.kicker`)}</p>;
}
