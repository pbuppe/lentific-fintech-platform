/**
 * Enregistrement des handlers d'événements, isolé dans son propre fichier,
 * importé dynamiquement uniquement côté Node par instrumentation.ts. Next.js
 * a besoin de cette frontière nette (un seul point d'import paresseux) pour
 * ne PAS essayer de compiler ce module (et son usage de fs/path via
 * @fintech/documents) pour le runtime Edge du middleware : un simple `if`
 * dans le même fichier ne suffit pas, webpack résout quand même les imports
 * dynamiques qu'il contient pour les deux cibles.
 */
export async function registerNodeHandlers() {
  await Promise.all([
    import("@fintech/applications"),
    import("@fintech/kyc"),
    import("@fintech/loans"),
    import("@fintech/contracts"),
    import("@fintech/signatures"),
    import("@fintech/notifications"),
    import("@fintech/funding"),
  ]);
  console.log(
    "[instrumentation] handlers workflow enregistrés (applications, kyc, loans, contracts, signatures, notifications, funding)"
  );
}
