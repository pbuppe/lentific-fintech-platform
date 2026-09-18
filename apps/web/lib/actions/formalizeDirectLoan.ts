"use server";

import { redirect } from "next/navigation";
import { formalizeDirectLoan as formalize } from "@fintech/introductions";
import { getCurrentUser } from "../session";

export async function formalizeDirectLoanAction(returnPath: string, formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const introductionRequestId = formData.get("introductionRequestId") as string;
  const amount = Number(formData.get("amount"));
  const durationMonths = Number(formData.get("durationMonths"));
  const rate = Number(formData.get("rate"));

  try {
    await formalize({ introductionRequestId, requestingUserId: user!.id, amount, durationMonths, rate });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Formalisation impossible.";
    redirect(`${returnPath}?error=${encodeURIComponent(message)}`);
  }

  redirect(`${returnPath}?formalized=1`);
}
