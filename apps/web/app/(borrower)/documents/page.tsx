import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { fulfillDocumentRequest, listMyDocumentRequests, getFileUrl } from "@fintech/documents";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

async function fulfillAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("BorrowerDocuments");
  const requestId = formData.get("requestId") as string;
  const file = formData.get("file") as File;
  if (!file || file.size === 0) redirect(`/documents?error=${encodeURIComponent(t("errorSelectFile"))}`);

  const content = Buffer.from(await file.arrayBuffer());
  await fulfillDocumentRequest({ requestId, ownerId: user.id, fileName: file.name, content });
  revalidatePath("/documents");
}

export default async function DocumentsPage({ searchParams }: { searchParams: { error?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("BorrowerDocuments");
  const requests = await listMyDocumentRequests(user.id);
  const pending = requests.filter((r) => r.status === "PENDING");
  const fulfilled = requests.filter((r) => r.status === "FULFILLED");

  const documentUrls = new Map<string, string>();
  for (const r of fulfilled) {
    if (r.document) documentUrls.set(r.id, await getFileUrl(r.document.storageKey));
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (borrower)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t("subtitle")}
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{searchParams.error}</p>
      )}

      <h2 className="mt-8 font-display text-lg text-ink">{t("pendingHeading")}</h2>
      {pending.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{t("pendingEmpty")}</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {pending.map((r) => (
            <Card key={r.id} accented>
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-ink">{r.label}</p>
                <StatusPill tone="pending">{t("statusPending")}</StatusPill>
              </div>
              {r.instructions && <p className="mt-1 text-xs text-ink-soft">{r.instructions}</p>}
              <p className="mt-1 text-xs text-ink-faint">{t("requestedBy", { name: r.requestedBy.name ?? r.requestedBy.email })}</p>
              <form action={fulfillAction} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="requestId" value={r.id} />
                <input type="file" name="file" required className="text-xs" />
                <button className="rounded-lg bg-yellow px-3 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
                  {t("submit")}
                </button>
              </form>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-8 font-display text-lg text-ink">{t("fulfilledHeading")}</h2>
      {fulfilled.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{t("fulfilledEmpty")}</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {fulfilled.map((r) => (
            <Card key={r.id}>
              <p className="text-sm text-ink">
                {r.label}{" "}
                <a href={documentUrls.get(r.id)} target="_blank" rel="noreferrer" className="text-brand-ink underline">
                  {t("viewFile")}
                </a>
              </p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
