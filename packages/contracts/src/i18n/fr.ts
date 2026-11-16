import type { ContractStrings } from "./types";

export const fr: ContractStrings = {
  bannerLabel: "MODÈLE : document généré automatiquement, à faire valider par un juriste avant usage réel",
  bannerRef: "Référence du dossier : {reference}, généré le {date}",
  articleWord: "ARTICLE",
  calloutPrefix: "À CONFIRMER PAR LE CONSEIL JURIDIQUE",
  durationUnit: "mois",
  signElectronic: "(signature électronique)",
  noScoreAvailable: "Non disponible",

  mp_pdfTitle: "Contrat de prêt - {reference}",
  mp_mainTitle: "CONTRAT DE PRÊT DE FINANCEMENT PARTICIPATIF",
  mp_mainSubtitle: "Établi en application des articles L.548-1 et s. et R.548-1 et s. du Code monétaire et financier",
  mp_intermediaryHeading: "L'INTERMÉDIAIRE EN FINANCEMENT PARTICIPATIF",
  mp_intermediaryText: "La société {company}, société de droit d'Angleterre et du pays de Galles (private limited company) immatriculée au Registre des sociétés (Companies House) sous le numéro {companyNumber}, dont le siège social est situé {address}, exploitant la plateforme Lentific{oriasPart}, ci-après « l'Intermédiaire » ou « Lentific », agissant en qualité de mandataire des Prêteurs, sans être elle-même partie prêteuse.",
  mp_oriasPart: ", immatriculée auprès de l'ORIAS sous le numéro {orias}",
  mp_statusCallout: "statut réglementaire de l'Intermédiaire pour le financement participatif par prêt rémunéré (agrément de prestataire de services de financement participatif au sens du règlement (UE) 2020/1503, ou autre statut applicable) et numéro d'immatriculation correspondant.",
  mp_borrowerHeading: "L'EMPRUNTEUR",
  mp_borrowerText: "{name} ({email}){cityPart}, agissant à titre professionnel, ci-après « l'Emprunteur ».",
  mp_borrowerCityPart: ", domicilié(e) à {city}",
  mp_lendersHeading: "LE OU LES PRÊTEURS",
  mp_lendersText:
    "Les personnes physiques ou morales dont l'identité, les coordonnées et la quote-part individuellement prêtée figurent en Annexe 3 (Bulletins de souscription), chaque Prêteur agissant individuellement et sans solidarité entre eux, ci-après collectivement les « Prêteurs ».",
  mp_preambleHeading: "PRÉAMBULE",
  mp_preambleText1:
    "L'Emprunteur a soumis sur la plateforme Lentific une demande de financement d'un montant de {amount} destinée à un usage professionnel. Ce dossier a fait l'objet d'une vérification d'identité, d'une analyse de la capacité de remboursement par le moteur de risque de la Plateforme{riskPart}, puis d'une revue par un gestionnaire habilité, à l'issue de laquelle une offre a été établie et acceptée par l'Emprunteur.",
  mp_preambleRiskPart: " (score obtenu : {score}/100)",
  mp_preambleText2:
    "Le présent contrat formalise les conditions de ce financement, assuré par un ou plusieurs Prêteurs sur la marketplace P2P de la Plateforme, dans les conditions de financement fractionné décrites à l'Article 5.",
  mp_art1Title: "DÉFINITIONS",
  mp_art1Items: [
    "« Plateforme » désigne le site et l'application exploités par Lentific.",
    "« Financement participatif par prêt » (crowdlending) désigne l'opération par laquelle un ou plusieurs Prêteurs consentent un prêt rémunéré à l'Emprunteur, conformément aux articles L.548-1 et suivants du Code monétaire et financier.",
    "« TAEG » désigne le taux annuel effectif global.",
    "« Échéancier » désigne le tableau d'amortissement figurant en Annexe 1.",
  ],
  mp_art2Title: "DÉCLARATIONS ET GARANTIES DES PARTIES",
  mp_art2Sub1: "2.1 Déclarations communes",
  mp_art2Text1:
    "Chaque Partie déclare avoir la pleine capacité juridique de contracter et ne pas être en état de cessation des paiements à la date de signature.",
  mp_art2Sub2: "2.2 Déclarations de l'Emprunteur",
  mp_art2Text2:
    "L'Emprunteur déclare que les informations transmises dans le cadre de sa demande sont exactes, sincères et à jour, et qu'aucun événement susceptible d'affecter sa capacité de remboursement n'est survenu sans en avoir informé la Plateforme.",
  mp_art2Sub3: "2.3 Déclarations des Prêteurs",
  mp_art2Text3:
    "Chaque Prêteur déclare avoir pris connaissance de la fiche d'information synthétique (Annexe 2) et reconnaît avoir été informé et mis en garde sur les risques décrits à l'Article 10.",
  mp_art3Title: "OBJET DU CONTRAT",
  mp_art3Text:
    "Le présent contrat fixe les conditions selon lesquelles les Prêteurs consentent à l'Emprunteur, par l'intermédiaire de la Plateforme, un prêt d'argent rémunéré, ainsi que les modalités de son remboursement.",
  mp_art4Title: "CARACTÉRISTIQUES FINANCIÈRES DU PRÊT",
  mp_art4RowLabels: [
    "Montant total du crédit",
    "Durée",
    "Taux débiteur fixe applicable (annuel)",
    "Mensualité (hors assurance)",
    "Montant total des intérêts",
    "Coût total du crédit",
  ],
  mp_art4TaegLabel: "TAEG",
  mp_art4TaegValue: "à calculer par l'Intermédiaire avant diffusion",
  mp_art5Title: "MISE À DISPOSITION DES FONDS ET FINANCEMENT FRACTIONNÉ",
  mp_art5Text1:
    "Les fonds sont collectés sur la marketplace P2P jusqu'à atteinte du montant total : chaque Prêteur finance une quote-part, sans qu'aucun Prêteur ne soit tenu au-delà de sa quote-part ni solidaire des autres Prêteurs. Une fois le montant collecté, les fonds sont versés à l'Emprunteur par virement, déduction faite le cas échéant des frais visés à l'Article 8.",
  mp_art5Text2:
    "Si le montant total n'est pas collecté dans le délai affiché sur la Plateforme, le financement est réputé non abouti et les sommes déjà versées sont restituées aux Prêteurs.",
  mp_art6Title: "AMORTISSEMENT ET ÉCHÉANCIER",
  mp_art6Text:
    "Le prêt est remboursable selon un amortissement constant, conformément au tableau figurant en Annexe 1. Les remboursements sont redistribués par l'Intermédiaire à chaque Prêteur au prorata de sa quote-part.",
  mp_art7Title: "REMBOURSEMENT ANTICIPÉ",
  mp_art7Text: "L'Emprunteur peut à tout moment rembourser par anticipation, en totalité ou en partie, les sommes restant dues.",
  mp_art7Callout: "une indemnité de remboursement anticipé est-elle applicable, et selon quel plafond réglementaire ?",
  mp_art8Title: "FRAIS DE L'INTERMÉDIAIRE",
  mp_art8Text:
    "L'Intermédiaire perçoit des frais dont le principe et le barème sont ceux définis par le moteur de frais (Fee Engine) applicable au produit concerné à la date de conclusion du présent contrat.",
  mp_art8Callout: "barème précis à joindre en annexe avant diffusion.",
  mp_art9Title: "DÉFAUT DE PAIEMENT ET INTÉRÊTS DE RETARD",
  mp_art9Text:
    "À défaut de paiement à son échéance, et sans mise en demeure préalable nécessaire, les sommes impayées porteront de plein droit intérêt au taux légal en vigueur majoré, à compter de la date d'exigibilité jusqu'à complet paiement, sans préjudice de l'article 1231-6 du Code civil.",
  mp_art10Title: "AVERTISSEMENT SUR LES RISQUES",
  mp_art10Text:
    "Chaque Prêteur est averti et mis en garde, conformément à l'article L.548-6 du Code monétaire et financier, sur le mode de fonctionnement du financement participatif, et notamment :",
  mp_art10Items: [
    "le risque de perte totale ou partielle du capital prêté en cas de défaillance de l'Emprunteur ;",
    "l'absence de garantie de remboursement par l'Intermédiaire, qui n'est ni prêteur, ni garant, ni assureur ;",
    "le risque d'illiquidité des sommes prêtées avant l'échéance convenue ;",
    "la nécessité de diversifier ses investissements.",
  ],
  mp_art11Title: "EXIGIBILITÉ ANTICIPÉE",
  mp_art11Text:
    "L'Intermédiaire, au nom et pour le compte des Prêteurs, pourra se prévaloir de l'exigibilité immédiate du prêt, sans préavis ni formalité judiciaire préalable, notamment en cas de non-paiement non régularisé sous 15 jours suivant mise en demeure, de procédure collective visant l'Emprunteur, d'inexactitude d'une déclaration ou de manœuvre frauduleuse.",
  mp_art12Title: "GESTION DE LA DÉFAILLANCE DE L'EMPRUNTEUR",
  mp_art12Text:
    "En cas d'impayé, l'Intermédiaire notifie les Prêteurs et adresse à l'Emprunteur une relance puis, à défaut de régularisation sous 15 jours, une mise en demeure. À défaut de paiement, l'Intermédiaire pourra engager tout recouvrement amiable ou judiciaire pour le compte des Prêteurs qui l'y autorisent.",
  mp_art13Title: "DROIT DE RÉTRACTATION",
  mp_art13Callout:
    "l'existence et la durée d'un droit de rétractation dépendent du statut réglementaire précis de l'Intermédiaire (IFP national ou PSFP au sens du règlement ECSP 2020/1503) et de la qualification du Prêteur. L'article R.548-6 impose de mentionner ce droit et ses modalités.",
  mp_art14Title: "RÔLE ET RESPONSABILITÉ DE L'INTERMÉDIAIRE",
  mp_art14Text:
    "L'Intermédiaire agit en qualité de mandataire des Prêteurs. Il n'est en aucun cas partie prêteuse, ne garantit ni le capital ni les intérêts, et sa responsabilité ne saurait être engagée du seul fait de la défaillance de l'Emprunteur, sous réserve de ses obligations de bonne conduite au titre des articles L.548-1 et suivants.",
  mp_art15Title: "DONNÉES À CARACTÈRE PERSONNEL",
  mp_art15Text:
    "Les données personnelles des Parties sont traitées par l'Intermédiaire, responsable de traitement, conformément au RGPD et à la loi n° 78-17 du 6 janvier 1978 modifiée, aux seules fins d'exécution du contrat et du respect des obligations légales applicables.",
  mp_art16Title: "DROIT APPLICABLE ET JURIDICTION COMPÉTENTE",
  mp_art16Text:
    "Le présent contrat est soumis au droit français. Tout litige relatif à sa validité, son interprétation ou son exécution sera soumis à la compétence exclusive des tribunaux français territorialement compétents, sous réserve des règles d'ordre public applicables.",
  mp_signBorrowerLabel: "L'Emprunteur",
  mp_signIntermediaryLabel: "Pour l'Intermédiaire, {company}",
  mp_annex1Title: "ANNEXE 1 - ÉCHÉANCIER DE REMBOURSEMENT",
  mp_annex1Subtitle: "Prêt de {amount} · {duration} mensualités · taux fixe {rate} % · mensualité {monthly}",
  mp_annex1Headers: ["Éch.", "Date", "Capital", "Intérêts", "Mensualité", "Restant dû"],
  mp_annex2Title: "ANNEXE 2 - FICHE D'INFORMATION SYNTHÉTIQUE",
  mp_annex2RowLabels: [
    "Emprunteur",
    "Montant emprunté",
    "Durée",
    "Taux débiteur fixe",
    "Mensualité",
    "Coût total du crédit",
    "Score de risque interne",
    "Risque principal pour le Prêteur",
  ],
  mp_annex2MainRiskText: "Perte partielle ou totale du capital prêté (Article 10)",
  mp_annex3Title: "ANNEXE 3 - BULLETIN DE SOUSCRIPTION (MODÈLE)",
  mp_annex3Text:
    "Je soussigné(e) [Nom du Prêteur], déclare souscrire au financement de l'Emprunteur désigné aux présentes pour un montant de [montant] EUR, et reconnais avoir pris connaissance et accepté sans réserve l'intégralité des stipulations du présent contrat référencé {reference}, notamment l'avertissement sur les risques figurant à l'Article 10.",
  mp_footerNote: "Document généré automatiquement par la plateforme Lentific à partir du dossier {reference}. Les mentions signalées « à confirmer » doivent être arbitrées par un avocat avant toute mise en production. Structure établie par référence aux articles L.548-1 et s. et R.548-1 et s. (notamment R.548-6) du Code monétaire et financier.",

  dl_pdfTitle: "Contrat de prêt direct - {reference}",
  dl_mainTitle: "CONTRAT DE PRÊT ENTRE PARTICULIERS",
  dl_mainSubtitle: "Prêt direct conclu entre les parties suite à une mise en relation via la plateforme Lentific",
  dl_borrowerHeading: "L'EMPRUNTEUR",
  dl_borrowerText: "{name} ({email}){cityPart}, ci-après « l'Emprunteur ».",
  dl_borrowerCityPart: ", domicilié(e) à {city}",
  dl_lenderHeading: "LE PRÊTEUR",
  dl_lenderText: "{name} ({email}), ci-après « le Prêteur ».",
  dl_preambleHeading: "PRÉAMBULE",
  dl_preambleText:
    "{borrowerName} et {lenderName} ont été mis en relation via la plateforme Lentific, moyennant le paiement des frais de mise en relation prévus par la Plateforme. Les Parties ont convenu, en dehors de tout financement fractionné ou intermédiation réglementée par la Plateforme, de conclure directement entre elles le présent contrat de prêt d'un montant de {amount}. Lentific n'est ni prêteur, ni emprunteur, ni intermédiaire en financement participatif au titre du présent contrat : son rôle se limite à avoir mis les Parties en relation et à la génération du présent document.",
  dl_art1Title: "OBJET DU CONTRAT",
  dl_art1Text:
    "Le présent contrat fixe les conditions selon lesquelles le Prêteur consent à l'Emprunteur un prêt d'argent rémunéré, directement, ainsi que les modalités de son remboursement.",
  dl_art2Title: "CARACTÉRISTIQUES FINANCIÈRES DU PRÊT",
  dl_art2RowLabels: ["Montant du prêt", "Durée", "Taux d'intérêt annuel", "Mensualité", "Coût total du crédit"],
  dl_art3Title: "VERSEMENT DES FONDS",
  dl_art3Text:
    "Les Parties conviennent librement entre elles des modalités de versement des fonds par le Prêteur à l'Emprunteur, la Plateforme n'intervenant à aucun titre dans ce versement.",
  dl_art4Title: "REMBOURSEMENT ET ÉCHÉANCIER",
  dl_art4Text:
    "Le prêt est remboursable selon l'échéancier indicatif figurant en Annexe 1, directement entre les Parties, sans passer par la Plateforme.",
  dl_art4Callout:
    "un prêt entre particuliers peut relever du Code de la consommation (crédit à la consommation) selon la qualité des Parties et le montant en jeu, avec des obligations spécifiques (offre préalable, délai de rétractation) : à vérifier avant signature.",
  dl_art5Title: "REMBOURSEMENT ANTICIPÉ",
  dl_art5Text:
    "L'Emprunteur peut à tout moment rembourser par anticipation, en totalité ou en partie, les sommes restant dues, sauf stipulation contraire expressément convenue entre les Parties.",
  dl_art6Title: "DÉFAUT DE PAIEMENT",
  dl_art6Text:
    "À défaut de paiement à son échéance, les sommes impayées porteront de plein droit intérêt au taux légal en vigueur majoré, à compter de la date d'exigibilité jusqu'à complet paiement, sans préjudice de l'article 1231-6 du Code civil.",
  dl_art7Title: "AVERTISSEMENT SUR LES RISQUES",
  dl_art7Text: "Le Prêteur reconnaît avoir été informé et mis en garde sur les risques inhérents à un prêt direct à un particulier, et notamment :",
  dl_art7Items: [
    "le risque de perte totale ou partielle du capital prêté en cas de défaillance de l'Emprunteur ;",
    "l'absence de toute garantie de remboursement par Lentific, qui n'est ni prêteur, ni garant, ni assureur, ni intermédiaire en financement participatif au titre du présent contrat ;",
    "le risque d'illiquidité des sommes prêtées avant l'échéance convenue ;",
    "l'intérêt de faire vérifier le présent contrat par un professionnel du droit avant signature, ce document n'étant qu'un modèle.",
  ],
  dl_art8Title: "RÔLE DE LENTIFIC",
  dl_art8Text:
    "Lentific n'est partie à aucun titre au présent contrat, ne garantit ni le capital ni les intérêts, et son rôle se limite à avoir mis les Parties en relation. Ce qui se passe entre les Parties à compter de la signature du présent contrat a lieu hors de la Plateforme et n'engage pas la responsabilité de Lentific.",
  dl_art9Title: "DONNÉES À CARACTÈRE PERSONNEL",
  dl_art9Text:
    "Les données personnelles échangées dans le cadre de la mise en relation ont été traitées par Lentific conformément au RGPD ; les Parties restent seules responsables du traitement qu'elles font des données de l'autre Partie une fois mises en relation.",
  dl_art10Title: "DROIT APPLICABLE ET JURIDICTION COMPÉTENTE",
  dl_art10Text:
    "Le présent contrat est soumis au droit français. Tout litige relatif à sa validité, son interprétation ou son exécution sera soumis à la compétence exclusive des tribunaux français territorialement compétents, sous réserve des règles d'ordre public applicables.",
  dl_signBorrowerLabel: "L'Emprunteur",
  dl_signLenderLabel: "Le Prêteur",
  dl_annex1Title: "ANNEXE 1 - ÉCHÉANCIER INDICATIF DE REMBOURSEMENT",
  dl_annex1Subtitle: "Prêt de {amount} · {duration} mensualités · taux fixe {rate} % · mensualité {monthly}",
  dl_annex1Headers: ["Éch.", "Date", "Capital", "Intérêts", "Mensualité", "Restant dû"],
  dl_footerNote:
    "Document généré automatiquement par la plateforme Lentific à partir de la mise en relation référencée {reference}. Ce contrat est un MODÈLE : à faire valider par un professionnel du droit avant signature, notamment sur la qualification éventuelle en crédit à la consommation (Article 4).",

  // --- Mandat de recherche de financement (courtage, honoraires au cas par cas) ---
  bm_pdfTitle: "Mandat de recherche de financement - {reference}",
  bm_mainTitle: "MANDAT DE RECHERCHE DE FINANCEMENT",
  bm_mainSubtitle: "Mandat et convention d'honoraires : honoraires dus uniquement en cas d'obtention du financement",
  bm_brokerHeading: "LE MANDATAIRE",
  bm_brokerText: "La société {company}, société de droit d'Angleterre et du pays de Galles (private limited company) immatriculée au Registre des sociétés (Companies House) sous le numéro {companyNumber}, dont le siège social est situé {address}, exploitant la plateforme Lentific{oriasPart}, ci-après « le Mandataire » ou « Lentific ».",
  bm_oriasPart: ", immatriculée auprès de l'ORIAS en qualité d'intermédiaire en opérations de banque et en services de paiement sous le numéro {orias}",
  bm_statusCallout: "statut d'intermédiaire en opérations de banque du Mandataire (immatriculation ORIAS ou équivalent dans le pays du Mandant), numéro d'immatriculation et assurance de responsabilité civile professionnelle à mentionner ici.",
  bm_clientHeading: "LE MANDANT",
  bm_clientText: "{name} ({email}), ci-après « le Mandant ».",
  bm_art1Title: "OBJET DU MANDAT",
  bm_art1Text: "Le Mandant confie au Mandataire, qui l'accepte, la mission de rechercher, comparer et lui présenter un ou plusieurs financements correspondant à sa demande référencée {reference} : {amount} sur {duration} mois. Le Mandataire monte le dossier, le présente aux établissements prêteurs et aux investisseurs de la plateforme Lentific, et accompagne le Mandant jusqu'au versement des fonds.",
  bm_art2Title: "OBLIGATIONS DU MANDATAIRE",
  bm_art2Text: "Le Mandataire agit avec loyauté et diligence dans l'intérêt du Mandant. Il l'informe de l'avancement du dossier, lui présente les offres obtenues avec leurs caractéristiques et attire son attention sur les conséquences d'un engagement de crédit. Il est tenu d'une obligation de moyens et ne garantit pas l'obtention d'un financement.",
  bm_art3Title: "OBLIGATIONS DU MANDANT",
  bm_art3Text: "Le Mandant fournit des informations exactes, complètes et à jour, ainsi que les justificatifs demandés. Il reste entièrement libre d'accepter ou de refuser toute offre de financement qui lui est présentée.",
  bm_art4Title: "HONORAIRES",
  bm_art4Text: "En rémunération de sa mission, le Mandataire percevra des honoraires d'un montant de {fee}. Ces honoraires ne sont dus qu'en cas d'obtention effective d'un financement et ne deviennent exigibles qu'après le versement des fonds. Aucun versement, de quelque nature que ce soit, ne peut être exigé du Mandant avant l'obtention d'un ou plusieurs prêts. Si aucun financement n'est obtenu, aucun honoraire n'est dû.",
  bm_art5Title: "DURÉE ET RÉSILIATION",
  bm_art5Text: "Le présent mandat prend effet à sa signature et prend fin au versement des fonds. Chacune des parties peut y mettre fin à tout moment, par écrit, sans frais ni indemnité, tant qu'aucune offre de financement n'a été acceptée par le Mandant.",
  bm_art6Title: "DROIT DE RÉTRACTATION",
  bm_art6Text: "Le présent mandat étant conclu à distance, le Mandant dispose d'un délai de quatorze jours calendaires à compter de sa signature pour se rétracter, sans avoir à motiver sa décision ni à supporter de frais, en écrivant à {email}.",
  bm_art7Title: "DONNÉES PERSONNELLES",
  bm_art7Text: "Les données du Mandant sont traitées par le Mandataire pour l'exécution du présent mandat et ne sont transmises qu'aux prêteurs et investisseurs sollicités pour son financement, conformément à la politique de confidentialité publiée sur lentific.com.",
  bm_art8Title: "RÉCLAMATIONS ET DROIT APPLICABLE",
  bm_art8Text: "Toute réclamation peut être adressée à {email}. Le présent mandat est soumis au droit français, sans préjudice des dispositions impératives plus protectrices de la loi du pays de résidence habituelle du Mandant.",
  bm_signClientLabel: "Le Mandant",
  bm_signBrokerLabel: "Pour le Mandataire, {company}",
  bm_signHint: "Date, signature et mention manuscrite « Bon pour mandat »",
  bm_footerNote: "Document généré automatiquement par la plateforme Lentific pour la demande {reference}. Ce mandat est un MODÈLE : les mentions signalées « à confirmer » doivent être arbitrées par un juriste avant usage réel.",
  bm_requestLabel: "Mandat de recherche de financement signé ({reference})",
  bm_requestInstructions: "Téléchargez votre mandat dans la rubrique « Documents à signer » ci-dessous, datez-le, signez-le avec la mention « Bon pour mandat », puis renvoyez-le ici (photo ou scan).",
};
