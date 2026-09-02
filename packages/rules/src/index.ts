/**
 * packages/rules : règles métier configurables + feature flags (§40, §61).
 * Toute fonctionnalité nouvelle est déclarée ici avant d'être appelée ailleurs,
 * pour pouvoir être désactivée sans toucher au code appelant (§04, règle 04).
 * Backing store : table Postgres `Rule` + cache mémoire (évite une requête
 * par vérification de flag sur un chemin chaud).
 */
import { rulesRepo } from "@fintech/database";

const cache = new Map<string, { value: unknown; enabled: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 30_000;

export async function isEnabled(key: string, scope?: { countryId?: string; tenantId?: string; segment?: string }): Promise<boolean> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.enabled && matchesScope(cached.value, scope);
  }

  const rule = await rulesRepo.findByKey(key);
  if (!rule) return false;

  cache.set(key, { value: rule.scope, enabled: rule.enabled, expiresAt: Date.now() + CACHE_TTL_MS });
  return rule.enabled && matchesScope(rule.scope, scope);
}

function matchesScope(ruleScope: unknown, requested?: { countryId?: string; tenantId?: string; segment?: string }): boolean {
  if (!requested) return true;
  if (typeof ruleScope !== "object" || ruleScope === null) return true;
  const scope = ruleScope as Record<string, string | undefined>;
  return Object.entries(requested).every(([k, v]) => !v || !scope[k] || scope[k] === v);
}

export async function setRule(key: string, value: object, scope: object = {}, enabled = true) {
  cache.delete(key);
  return rulesRepo.upsert(key, scope, value, enabled);
}

export async function listActiveRules() {
  return rulesRepo.listEnabled();
}
