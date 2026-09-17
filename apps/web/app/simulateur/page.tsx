import { getTranslations } from "next-intl/server";
import { Simulator } from "./Simulator";

export default async function SimulateurPage() {
  const t = await getTranslations("SimulatorPage");
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-12">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("eyebrow")}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        {t("subtitle")}
      </p>
      <div className="mt-8">
        <Simulator />
      </div>
    </main>
  );
}
