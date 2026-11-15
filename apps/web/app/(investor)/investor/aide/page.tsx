import { redirect } from "next/navigation";
import { HelpView } from "../../../components/AssistanceViews";
import { getCurrentUser } from "../../../../lib/session";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <HelpView userId={user.id} />;
}
