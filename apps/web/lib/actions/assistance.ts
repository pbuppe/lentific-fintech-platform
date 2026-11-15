"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAssistanceCode, cancelAssistanceCode } from "@fintech/auth";
import { getCurrentUser } from "../session";
import { ASSIST_CODE_COOKIE } from "../assistCookie";

// Le code n est stocké en base que sous forme d empreinte : pour l afficher au
// client pendant ses 10 minutes de validité, il est gardé dans un cookie
// httpOnly de courte durée (jamais dans l URL).

function helpPath(role: string) {
  return role === "INVESTOR" ? "/investor/aide" : "/aide";
}

export async function requestAssistanceCodeAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { code, expiresAt } = await createAssistanceCode(user.id, String(formData.get("problem") ?? ""));
  cookies().set(ASSIST_CODE_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  revalidatePath("/", "layout");
  redirect(helpPath(user.role));
}

export async function cancelAssistanceCodeAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await cancelAssistanceCode(user.id);
  cookies().delete(ASSIST_CODE_COOKIE);
  revalidatePath("/", "layout");
  redirect(helpPath(user.role));
}
