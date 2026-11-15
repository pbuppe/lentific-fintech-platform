import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../../lib/session";
import { PremiumView } from "../../../components/PremiumView";

export default async function InvestorPremiumPage({ searchParams }: { searchParams: { premium?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <PremiumView userId={user.id} audience="investor" notice={searchParams.premium} />;
}
