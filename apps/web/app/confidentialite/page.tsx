import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { legalIdentity } from "../../lib/legal";
import { CookieSettingsLink } from "../components/CookieConsent";
import { SiteFooter } from "../components/BrokerSections";
import { PRIVACY, UPDATED_AT, type Block } from "./content";

/**
 * Politique de confidentialité et cookies (demande produit 2026-11-16), dans
 * la langue du visiteur. Identité du responsable : lib/legal.ts.
 */
async function text() {
  const locale = await getLocale();
  return { locale, p: PRIVACY[locale] ?? PRIVACY.fr };
}

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await text();
  return { title: `Lentific · ${p.meta}` };
}

export default async function PrivacyPage() {
  const { locale, p } = await text();
  const id = legalIdentity();
  const email = id.email;
  const controller = [id.company, id.companyNumber && p.reg.replace("{n}", id.companyNumber), id.address].filter(Boolean).join(", ");
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(`${UPDATED_AT}T12:00:00Z`));

  const fill = (s: string) => {
    const parts = s.replace("{controller}", controller).split("{email}");
    return parts.flatMap((part, i) =>
      i === 0 ? [part] : [<a key={i} href={`mailto:${email}`} className="font-semibold text-brand underline">{email}</a>, part],
    );
  };

  const render = (b: Block, i: number) => {
    if (typeof b === "string") return <p key={i} className="mt-3 leading-relaxed text-ink-soft">{fill(b)}</p>;
    if ("ul" in b)
      return (
        <ul key={i} className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-ink-soft">
          {b.ul.map((li, j) => <li key={j}>{fill(li)}</li>)}
        </ul>
      );
    return (
      <div key={i} className="mt-4 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-surface text-xs text-ink-faint">
            <tr>{b.table.head.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {b.table.rows.map((r) => (
              <tr key={r[0]} className="border-t border-line align-top">
                <td className="px-3 py-2 font-mono text-xs text-ink">{r[0]}</td>
                {r.slice(1).map((c, j) => <td key={j} className="px-3 py-2 text-ink-soft">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <main className="mx-auto max-w-3xl px-6 py-14 sm:px-12">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{p.kicker}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{p.title}</h1>
        <p className="mt-2 text-sm text-ink-faint">{p.updated.replace("{date}", date)}</p>
        <p className="mt-6 leading-relaxed text-ink-soft">{p.intro}</p>
        {p.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="font-display text-xl font-semibold text-ink">{s.h}</h2>
            {s.body.map(render)}
            {s.body.some((b) => typeof b === "object" && "table" in b) && (
              <div className="mt-4 inline-block rounded-lg border border-ink/20 bg-yellow px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-ink">
                <CookieSettingsLink label={p.cookieButton} />
              </div>
            )}
          </section>
        ))}
        <p className="mt-12"><a href="/" className="text-sm font-semibold text-brand underline">← {p.back}</a></p>
      </main>
      <SiteFooter />
    </>
  );
}
