/**
 * Contenu textuel des deux gabarits de contrat (marketplace multi-prêteurs
 * et bilatéral direct), un objet par langue (§ demande produit 2026-09-18 :
 * le contrat doit se générer dans la langue de l'utilisateur). Valeurs avec
 * {token} substituées via fmt() dans pdfKit.ts, pas de l'ICU (pas de besoin
 * de pluriels dans un contrat).
 */
export interface ContractStrings {
  // Bandeau modèle, en-tête commun
  bannerLabel: string;
  bannerRef: string; // {reference} {date}
  articleWord: string; // "ARTICLE" / "ARTICLE" / "ARTIKEL"...
  calloutPrefix: string; // "À CONFIRMER PAR LE CONSEIL JURIDIQUE"
  durationUnit: string; // "mois"
  signElectronic: string;
  noScoreAvailable: string;

  // --- Contrat marketplace (multi-prêteurs, Lentific intermédiaire) ---
  mp_pdfTitle: string; // {reference}
  mp_mainTitle: string;
  mp_mainSubtitle: string;
  mp_intermediaryHeading: string;
  mp_intermediaryText: string;
  mp_borrowerHeading: string;
  mp_borrowerText: string; // {name} {email} {cityPart}
  mp_borrowerCityPart: string; // {city}
  mp_lendersHeading: string;
  mp_lendersText: string;
  mp_preambleHeading: string;
  mp_preambleText1: string; // {amount} {riskPart}
  mp_preambleRiskPart: string; // {score}
  mp_preambleText2: string;
  mp_art1Title: string;
  mp_art1Items: string[];
  mp_art2Title: string;
  mp_art2Sub1: string;
  mp_art2Text1: string;
  mp_art2Sub2: string;
  mp_art2Text2: string;
  mp_art2Sub3: string;
  mp_art2Text3: string;
  mp_art3Title: string;
  mp_art3Text: string;
  mp_art4Title: string;
  mp_art4RowLabels: string[]; // 6 labels (hors TAEG)
  mp_art4TaegLabel: string;
  mp_art4TaegValue: string;
  mp_art5Title: string;
  mp_art5Text1: string;
  mp_art5Text2: string;
  mp_art6Title: string;
  mp_art6Text: string;
  mp_art7Title: string;
  mp_art7Text: string;
  mp_art7Callout: string;
  mp_art8Title: string;
  mp_art8Text: string;
  mp_art8Callout: string;
  mp_art9Title: string;
  mp_art9Text: string;
  mp_art10Title: string;
  mp_art10Text: string;
  mp_art10Items: string[];
  mp_art11Title: string;
  mp_art11Text: string;
  mp_art12Title: string;
  mp_art12Text: string;
  mp_art13Title: string;
  mp_art13Callout: string;
  mp_art14Title: string;
  mp_art14Text: string;
  mp_art15Title: string;
  mp_art15Text: string;
  mp_art16Title: string;
  mp_art16Text: string;
  mp_signBorrowerLabel: string;
  mp_signIntermediaryLabel: string;
  mp_annex1Title: string;
  mp_annex1Subtitle: string; // {amount} {duration} {rate} {monthly}
  mp_annex1Headers: string[]; // 6
  mp_annex2Title: string;
  mp_annex2RowLabels: string[]; // 8
  mp_annex2MainRiskText: string;
  mp_annex3Title: string;
  mp_annex3Text: string; // {reference}
  mp_footerNote: string; // {reference}

  // --- Contrat bilatéral direct (emprunteur <-> prêteur particulier) ---
  dl_pdfTitle: string; // {reference}
  dl_mainTitle: string;
  dl_mainSubtitle: string;
  dl_borrowerHeading: string;
  dl_borrowerText: string; // {name} {email} {cityPart}
  dl_borrowerCityPart: string;
  dl_lenderHeading: string;
  dl_lenderText: string; // {name} {email}
  dl_preambleHeading: string;
  dl_preambleText: string; // {borrowerName} {lenderName} {amount}
  dl_art1Title: string;
  dl_art1Text: string;
  dl_art2Title: string;
  dl_art2RowLabels: string[]; // 5 : montant, durée, taux, mensualité, coût total
  dl_art3Title: string;
  dl_art3Text: string;
  dl_art4Title: string;
  dl_art4Text: string;
  dl_art4Callout: string;
  dl_art5Title: string;
  dl_art5Text: string;
  dl_art6Title: string;
  dl_art6Text: string;
  dl_art7Title: string;
  dl_art7Text: string;
  dl_art7Items: string[];
  dl_art8Title: string;
  dl_art8Text: string;
  dl_art9Title: string;
  dl_art9Text: string;
  dl_art10Title: string;
  dl_art10Text: string;
  dl_signBorrowerLabel: string;
  dl_signLenderLabel: string;
  dl_annex1Title: string;
  dl_annex1Subtitle: string;
  dl_annex1Headers: string[];
  dl_footerNote: string; // {reference}
}
