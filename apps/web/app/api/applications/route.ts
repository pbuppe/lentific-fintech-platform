import { NextResponse } from "next/server";
import { submitApplication } from "@fintech/applications";

/**
 * Exemple de Route Handler : la logique métier vit entièrement dans
 * @fintech/applications ; cette route ne fait qu'assembler la requête HTTP
 * et appeler le module (§ architecture générale : "aucun serveur séparé,
 * la logique vit dans des modules internes appelés par ces routes").
 */
export async function POST(request: Request) {
  const body = await request.json();

  try {
    const application = await submitApplication({
      borrowerId: body.borrowerId,
      productId: body.productId,
      amount: Number(body.amount),
      durationMonths: Number(body.durationMonths),
      purpose: body.purpose,
      countryId: body.countryId,
      currencyId: body.currencyId,
    });
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 400 }
    );
  }
}
