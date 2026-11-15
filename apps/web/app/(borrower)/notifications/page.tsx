import { redirect } from "next/navigation";
import { NotificationsView } from "../../components/InboxViews";
import { getCurrentUser } from "../../../lib/session";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <NotificationsView user={user} />;
}
