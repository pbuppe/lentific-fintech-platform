# Lentific : Blueprint Technique V1 (implémentation de départ)

Ce dépôt est la traduction en code du **Blueprint Technique V1** (cahier des
charges §65) : monorepo pnpm + Turborepo, deux applications Next.js, un
package par domaine métier, et le schéma PostgreSQL/Prisma complet (32
entités, §43).

Palette de marque : bleu vif dominant, blanc cassé, rouge (fonctionnel ET
décoratif), voir `packages/ui/src/tokens.ts`, source unique de vérité.

## Installer en local

Prérequis : Node ≥ 20, pnpm ≥ 9, une base PostgreSQL (locale, Docker, ou
Neon en mode gratuit, voir `.env.example`).

```bash
pnpm install
cp .env.example .env      # puis renseigner DATABASE_URL au minimum
pnpm db:generate           # génère le client Prisma
pnpm db:migrate             # crée les tables
pnpm db:seed                 # données de démo (mêmes montants que le prototype visuel)
pnpm dev                      # lance apps/web (:3000) et apps/admin (:3001) en parallèle
```

Sans `DATABASE_URL` configurée, les deux apps démarrent quand même : les
pages affichent un message expliquant quoi faire plutôt que de planter, pour
que tu puisses voir l'interface avant de brancher une vraie base.

## Ce qui est réellement implémenté

- **Schéma PostgreSQL complet** (`packages/database/prisma/schema.prisma`) :
  toutes les entités du §43, relations comprises.
- **Communication inter-modules par événements** (`packages/workflow`) : les
  5 règles du §05 sont respectées : seul `packages/database` importe Prisma
  Client, les changements d'état passent par `emit()`/`registerHandler()`,
  le fournisseur de paiement n'expose qu'une interface abstraite, les
  feature flags passent par `packages/rules`, et les deux apps n'assemblent
  que des écrans.
- **Vérification d'identité et signature de contrat, en mode MANUEL** :
  décision produit prise ensemble, pas de prestataire externe pour l'instant :
  - le client dépose ses documents d'identité → un ticket de support s'ouvre
    automatiquement (`packages/notifications`) → un agent le contacte, vérifie
    la pièce et confirme depuis `apps/admin/app/kyc` ;
  - une fois l'offre acceptée, le contrat est généré automatiquement → le
    client doit l'imprimer, le signer à la main, puis l'uploader dans son
    espace (`apps/web/app/api/contracts/[contractId]/signature`) → un agent
    vérifie la pièce uploadée et confirme depuis `apps/admin/app/contracts`.
  - Pour automatiser plus tard avec un vrai prestataire (KYC ou signature
    électronique), voir les commentaires en tête de `packages/kyc/src/index.ts`
    et `packages/signatures/src/index.ts`, les événements émis ne changent pas,
    donc rien d'autre dans la plateforme n'a besoin d'être modifié.
- **Chaîne d'événements bout en bout** : soumission d'une demande → ticket de
  vérification manuelle → (une fois l'offre acceptée) prêt créé, échéancier
  généré, contrat généré → parcours de signature manuelle → notification.
  Les modules qui écoutent des événements s'enregistrent au démarrage via
  `apps/web/instrumentation.ts` (sinon ils ne seraient jamais chargés,
  puisque aucun autre module ne les importe directement, voir ce fichier
  pour le détail).
- **Moteur de risque** (`packages/risk`) avec une vraie formule (taux
  d'endettement), remplaçable sans changer l'interface.
- **Design system partagé** (`packages/ui`) consommé par les deux apps via un
  preset Tailwind commun, pour qu'elles restent visuellement identiques.

## Ce qui est volontairement laissé en stub

Ce sprint pose l'architecture et les contrats entre modules ; il ne branche
pas de vrais comptes tiers (décision prise ensemble : tout simuler en mode
démo pour l'instant). Chaque point ci-dessous a une interface claire à
implémenter, listée avec le fichier exact à modifier :

| Sujet | Fichier | À faire |
|---|---|---|
| Authentification réelle | `packages/auth/src/index.ts` | Brancher la librairie `better-auth` (adapter Prisma, MFA, providers) |
| Paiements | `packages/payments/src/index.ts` | Remplacer `mockPaymentProvider` par l'intégration Stripe Connect |
| Stockage documentaire | `packages/documents/src/index.ts` | Remplacer `localStorageAdapter` par l'adapter Cloudflare R2 |
| Automatisation événementielle | `packages/workflow/src/index.ts` | Remplacer le bus en mémoire par Inngest (même interface `emit`/`registerHandler`) |
| Design system visuel poussé | N/A | Composants shadcn/ui personnalisés (prochaine étape du blueprint, §07) |

KYC et signature électronique ne sont **pas** dans ce tableau : ce n'est plus
un stub à remplacer par défaut, c'est un vrai choix produit (vérification et
signature manuelles). Le jour où tu voudras automatiser l'un des deux avec un
vrai prestataire, la marche à suivre est documentée en tête de
`packages/kyc/src/index.ts` et `packages/signatures/src/index.ts`.

## Pour continuer avec Claude Code en local

1. Ouvre ce dossier avec Claude Code.
2. Demande-lui de faire tourner `pnpm install` puis `pnpm dev`, et de
   corriger toute erreur d'installation propre à ta machine (versions de
   Node, etc.).
3. Donne-lui les clés/comptes au fur et à mesure (Neon, Stripe...) et
   demande-lui de remplacer un stub à la fois, en suivant le tableau
   ci-dessus, chaque module a une interface stable, donc les autres
   modules n'ont pas besoin de changer.
4. Le fichier `packages/workflow/src/index.ts` explique où brancher Inngest
   quand tu voudras des reprises automatiques en production.

## Structure

```
fintech-platform/
├── apps/
│   ├── web/       # site public + espace emprunteur + espace investisseur
│   └── admin/     # back-office
├── packages/
│   ├── database/  # seul package à importer Prisma Client
│   ├── auth, users, applications, loans, investors, funding,
│   │   payments, fees, risk, kyc, documents, contracts, signatures,
│   │   notifications, audit, localization, rules, workflow
│   ├── ui/        # design system partagé (palette, composants)
│   └── config/    # variables d'environnement typées
```
