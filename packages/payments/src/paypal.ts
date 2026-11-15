/**
 * Paiement en ligne par PayPal (API REST « Orders v2 »), sans SDK.
 *
 * Déroulé : on crée une commande chez PayPal, le client l'approuve sur la page
 * PayPal (compte PayPal ou carte bancaire), puis revient sur le site où l'on
 * « capture » la commande. C'est la capture qui prélève réellement l'argent :
 * un client qui ferme la page PayPal avant de revenir n'est jamais débité.
 *
 * Configuration (apps/web/.env) :
 *   PAYPAL_MODE=sandbox | live   (sandbox = faux argent, pour les tests)
 *   PAYPAL_CLIENT_ID=…
 *   PAYPAL_CLIENT_SECRET=…
 * Sans identifiants, le site garde le paiement simulé.
 */

export class PaypalError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

export function isPaypalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function paypalMode(): "sandbox" | "live" {
  return process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
}

function apiBase() {
  return paypalMode() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

// Devises sans centimes chez PayPal.
const ZERO_DECIMAL = new Set(["HUF", "JPY", "TWD"]);

export function formatPaypalAmount(amount: number, currency: string) {
  return ZERO_DECIMAL.has(currency) ? String(Math.round(amount)) : amount.toFixed(2);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const basic = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new PaypalError(`PayPal a refusé les identifiants (HTTP ${res.status}). Vérifiez PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET et PAYPAL_MODE.`, res.status);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.value;
}

async function call<T>(path: string, init: { method: string; body?: unknown; requestId?: string }): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // Rend l'appel « idempotent » : rejouer la même requête ne crée ni ne capture deux fois.
      ...(init.requestId ? { "PayPal-Request-Id": init.requestId } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as T & { name?: string; message?: string };
  if (!res.ok) throw new PaypalError(`PayPal ${path} : ${json.name ?? res.status} ${json.message ?? ""}`.trim(), res.status);
  return json;
}

export async function createPaypalOrder(input: {
  amount: number;
  currency: string;
  description: string;
  customId: string;
  returnUrl: string;
  cancelUrl: string;
  locale?: string;
}) {
  const order = await call<{ id: string; links: Array<{ rel: string; href: string }> }>("/v2/checkout/orders", {
    method: "POST",
    requestId: `create-${input.customId}`,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.customId,
          description: input.description.slice(0, 127),
          amount: { currency_code: input.currency, value: formatPaypalAmount(input.amount, input.currency) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Lentific",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
            ...(input.locale ? { locale: input.locale } : {}),
          },
        },
      },
    },
  });
  const approveUrl = order.links.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
  if (!approveUrl) throw new PaypalError("PayPal n'a pas renvoyé de lien de paiement.");
  return { orderId: order.id, approveUrl };
}

export async function capturePaypalOrder(orderId: string) {
  type Capture = { id: string; status: string; custom_id?: string; amount: { currency_code: string; value: string } };
  type Order = { status: string; purchase_units: Array<{ custom_id?: string; payments?: { captures?: Capture[] } }> };
  const path = `/v2/checkout/orders/${encodeURIComponent(orderId)}`;
  let res: Order;
  try {
    res = await call<Order>(`${path}/capture`, { method: "POST", requestId: `capture-${orderId}` });
  } catch (error) {
    // Déjà encaissée (retour rejoué, coupure après la capture) : on relit la commande.
    if (!(error instanceof PaypalError && error.status === 422 && error.message.includes("ORDER_ALREADY_CAPTURED"))) throw error;
    res = await call<Order>(path, { method: "GET" });
  }
  const unit = res.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return {
    status: res.status, // COMPLETED attendu
    captureStatus: capture?.status,
    captureId: capture?.id,
    customId: capture?.custom_id ?? unit?.custom_id,
    amount: capture ? Number(capture.amount.value) : null,
    currency: capture?.amount.currency_code ?? null,
  };
}

// ---------------------------------------------------------------------------
// Abonnements PayPal (API « Billing Subscriptions v1 »)
// Un « produit » et un « plan » mensuel sont créés une fois chez PayPal, puis
// chaque abonné reçoit sa propre souscription (identifiant I-…). PayPal prélève
// lui-même chaque mois ; le site relit l'état de la souscription pour suivre
// les renouvellements, échecs et résiliations.
// ---------------------------------------------------------------------------

export async function createPaypalProduct(name: string) {
  const product = await call<{ id: string }>("/v1/catalogs/products", {
    method: "POST",
    body: { name, type: "SERVICE", category: "SOFTWARE" },
  });
  return product.id;
}

export async function createPaypalMonthlyPlan(input: { productId: string; name: string; amount: number; currency: string }) {
  const plan = await call<{ id: string }>("/v1/billing/plans", {
    method: "POST",
    body: {
      product_id: input.productId,
      name: input.name,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // sans fin, jusqu'à résiliation
          pricing_scheme: { fixed_price: { value: formatPaypalAmount(input.amount, input.currency), currency_code: input.currency } },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CANCEL",
        payment_failure_threshold: 1, // suspendu dès le premier échec de prélèvement
      },
    },
  });
  return plan.id;
}

export async function getPaypalPlan(planId: string) {
  return call<{ id: string; status: string }>(`/v1/billing/plans/${encodeURIComponent(planId)}`, { method: "GET" });
}

export async function createPaypalSubscription(input: {
  planId: string;
  customId: string;
  returnUrl: string;
  cancelUrl: string;
  locale?: string;
  startTime?: Date;
}) {
  const sub = await call<{ id: string; links: Array<{ rel: string; href: string }> }>("/v1/billing/subscriptions", {
    method: "POST",
    requestId: `sub-${input.customId}`,
    body: {
      plan_id: input.planId,
      custom_id: input.customId,
      ...(input.startTime ? { start_time: input.startTime.toISOString() } : {}),
      application_context: {
        brand_name: "Lentific",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        ...(input.locale ? { locale: input.locale } : {}),
      },
    },
  });
  const approveUrl = sub.links.find((l) => l.rel === "approve")?.href;
  if (!approveUrl) throw new PaypalError("PayPal n'a pas renvoyé de lien d'abonnement.");
  return { subscriptionId: sub.id, approveUrl };
}

export type PaypalSubscriptionState = {
  id: string;
  status: string; // APPROVAL_PENDING | APPROVED | ACTIVE | SUSPENDED | CANCELLED | EXPIRED
  planId: string;
  customId?: string;
  nextBillingTime: Date | null;
  lastPayment: { amount: number; currency: string; time: Date } | null;
  failedPayments: number;
};

export async function getPaypalSubscription(subscriptionId: string): Promise<PaypalSubscriptionState> {
  const s = await call<{
    id: string;
    status: string;
    plan_id: string;
    custom_id?: string;
    billing_info?: {
      next_billing_time?: string;
      failed_payments_count?: number;
      last_payment?: { amount: { currency_code: string; value: string }; time: string };
    };
  }>(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: "GET" });
  const last = s.billing_info?.last_payment;
  return {
    id: s.id,
    status: s.status,
    planId: s.plan_id,
    customId: s.custom_id,
    nextBillingTime: s.billing_info?.next_billing_time ? new Date(s.billing_info.next_billing_time) : null,
    lastPayment: last ? { amount: Number(last.amount.value), currency: last.amount.currency_code, time: new Date(last.time) } : null,
    failedPayments: s.billing_info?.failed_payments_count ?? 0,
  };
}

/** Arrête les prélèvements futurs. Sans effet si la souscription est déjà terminée. */
export async function cancelPaypalSubscription(subscriptionId: string, reason: string) {
  try {
    await call(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, { method: "POST", body: { reason: reason.slice(0, 127) } });
  } catch (error) {
    if (error instanceof PaypalError && error.status === 422) return; // déjà résiliée ou expirée
    throw error;
  }
}
