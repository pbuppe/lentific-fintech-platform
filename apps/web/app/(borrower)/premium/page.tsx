import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/session";
import { PremiumView } from "../../components/PremiumView";

export default async function BorrowerPremiumPage({ searchParams }: { searchParams: { premium?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "INVESTOR") redirect("/investor/premium");
  return <PremiumView userId={user.id} audience="borrower" notice={searchParams.premium} />;
}
