import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "../../../../../lib/session";
import { DirectLoanFormalizePanel } from "../../../../components/DirectLoanFormalizePanel";

export default async function InvestorFormalizeDirectLoanPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; formalized?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("DirectLoanFormalize");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("pageTitle")}</h1>
      <div className="mt-6">
        <DirectLoanFormalizePanel
          introductionId={params.id}
          currentUserId={user.id}
          returnPath={`/investor/mises-en-relation/${params.id}`}
          searchParams={searchParams}
        />
      </div>
    </main>
  );
}
