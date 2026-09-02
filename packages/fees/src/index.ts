/**
 * packages/fees : Fee Engine (§27) : calcul des frais fixes ou proportionnels
 * par produit/pays/utilisateur.
 */
import { feesRepo } from "@fintech/database";

export async function computeFee(
  type: string,
  amount: number,
  context: { productId?: string; countryId?: string }
): Promise<number> {
  const fee = await feesRepo.findApplicableFee(type, context.productId, context.countryId);
  if (!fee) return 0;
  return fee.isFixed ? Number(fee.value) : Math.round(amount * (Number(fee.value) / 100) * 100) / 100;
}
