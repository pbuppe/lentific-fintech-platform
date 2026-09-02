import { prisma } from "../client";

export function findApplicableFee(type: string, productId?: string, countryId?: string) {
  return prisma.fee.findFirst({
    where: {
      type,
      OR: [{ productId }, { productId: null }],
      AND: [{ OR: [{ countryId }, { countryId: null }] }],
    },
    orderBy: { productId: "desc" },
  });
}
