import { redirect } from "next/navigation";
import { MessagesView } from "../../components/InboxViews";
import { getCurrentUser } from "../../../lib/session";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <MessagesView user={user} />;
}
