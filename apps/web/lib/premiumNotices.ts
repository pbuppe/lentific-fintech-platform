/**
 * Notifications de l'abonnement Premium (2026-11-15) : activé, renouvelé,
 * prélèvement échoué (+ e-mail sans détail), terminé. Enregistré au démarrage
 * par instrumentation-node.ts, à côté des handlers de @fintech/notifications.
 */
import { registerHandler } from "@fintech/workflow";
import { notificationsRepo, usersRepo } from "@fintech/database";
import { sendPremiumPaymentFailedEmail } from "@fintech/auth";

const LINK = "/investor/premium";

registerHandler("subscription.started", async (payload) => {
  const { userId } = payload as { userId: string };
  await notificationsRepo.create({ userId, event: "subscription.started", kind: "system", link: LINK });
});

registerHandler("subscription.renewed", async (payload) => {
  const { userId } = payload as { userId: string };
  await notificationsRepo.create({ userId, event: "subscription.renewed", kind: "system", link: LINK });
});

registerHandler("subscription.past_due", async (payload) => {
  const { userId } = payload as { userId: string };
  await notificationsRepo.create({ userId, event: "subscription.past_due", kind: "payment", link: LINK });
  const user = await usersRepo.findById(userId);
  if (user) await sendPremiumPaymentFailedEmail(user);
});

registerHandler("subscription.ended", async (payload) => {
  const { userId } = payload as { userId: string };
  await notificationsRepo.create({ userId, event: "subscription.ended", kind: "system", link: LINK });
});
