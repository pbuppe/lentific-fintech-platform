import type { ContractStrings } from "./types";

export const en: ContractStrings = {
  bannerLabel: "TEMPLATE: automatically generated document, to be approved by legal counsel before actual use",
  bannerRef: "Case reference: {reference}, generated on {date}",
  articleWord: "ARTICLE",
  calloutPrefix: "TO BE CONFIRMED BY LEGAL COUNSEL",
  durationUnit: "months",
  signElectronic: "(electronic signature)",
  noScoreAvailable: "Not available",

  mp_pdfTitle: "Loan Agreement - {reference}",
  mp_mainTitle: "CROWDLENDING LOAN AGREEMENT",
  mp_mainSubtitle: "Established pursuant to articles L.548-1 et seq. and R.548-1 et seq. of the French Monetary and Financial Code",
  mp_intermediaryHeading: "THE CROWDFUNDING INTERMEDIARY",
  mp_intermediaryText:
    "The company Lentific, [corporate form to be completed] with share capital of [amount] euros, [registered office address to be completed], registered with the Trade and Companies Register (RCS) of [city] under number [SIREN to be confirmed], registered with ORIAS as a crowdfunding intermediary under number [ORIAS number to be confirmed], hereinafter “the Intermediary” or “Lentific”, acting as agent for the Lenders, without itself being a lending party.",
  mp_borrowerHeading: "THE BORROWER",
  mp_borrowerText: "{name} ({email}){cityPart}, acting in a professional capacity, hereinafter “the Borrower”.",
  mp_borrowerCityPart: ", residing at {city}",
  mp_lendersHeading: "THE LENDER(S)",
  mp_lendersText:
    "The individuals or legal entities whose identity, contact details, and individually lent share are set out in Annex 3 (Subscription Forms), each Lender acting individually and without joint and several liability among themselves, hereinafter collectively “the Lenders”.",
  mp_preambleHeading: "PREAMBLE",
  mp_preambleText1:
    "The Borrower submitted a funding request on the Lentific platform for an amount of {amount} intended for professional use. This application was subject to identity verification, an analysis of repayment capacity by the Platform's risk engine{riskPart}, and a review by an authorized manager, at the conclusion of which an offer was drawn up and accepted by the Borrower.",
  mp_preambleRiskPart: " (score obtained: {score}/100)",
  mp_preambleText2:
    "This agreement formalizes the terms of this financing, provided by one or more Lenders on the Platform's P2P marketplace, under the fractional funding terms described in Article 5.",
  mp_art1Title: "DEFINITIONS",
  mp_art1Items: [
    "“the Platform” means the website and application operated by Lentific.",
    "“Loan-based crowdfunding (crowdlending)” means the transaction whereby one or more Lenders grant an interest-bearing loan to the Borrower, in accordance with articles L.548-1 et seq. of the French Monetary and Financial Code.",
    "“APR” means the annual percentage rate of charge.",
    "“Repayment Schedule” means the amortization table set out in Annex 1.",
  ],
  mp_art2Title: "REPRESENTATIONS AND WARRANTIES OF THE PARTIES",
  mp_art2Sub1: "2.1 Joint Representations",
  mp_art2Text1:
    "Each Party represents that it has full legal capacity to contract and is not in a state of suspension of payments as of the date of signature.",
  mp_art2Sub2: "2.2 Representations of the Borrower",
  mp_art2Text2:
    "The Borrower represents that the information provided in connection with its application is accurate, truthful, and up to date, and that no event likely to affect its repayment capacity has occurred without the Platform having been informed thereof.",
  mp_art2Sub3: "2.3 Representations of the Lenders",
  mp_art2Text3:
    "Each Lender represents that it has reviewed the key information summary (Annex 2) and acknowledges having been informed of and warned about the risks described in Article 10.",
  mp_art3Title: "PURPOSE OF THE AGREEMENT",
  mp_art3Text:
    "This agreement sets out the terms under which the Lenders grant the Borrower, through the Platform, an interest-bearing loan of money, as well as the terms of its repayment.",
  mp_art4Title: "FINANCIAL TERMS OF THE LOAN",
  mp_art4RowLabels: [
    "Total credit amount",
    "Duration",
    "Applicable fixed borrowing rate (annual)",
    "Monthly installment (excluding insurance)",
    "Total amount of interest",
    "Total cost of credit",
  ],
  mp_art4TaegLabel: "APR",
  mp_art4TaegValue: "to be calculated by the Intermediary prior to distribution",
  mp_art5Title: "DISBURSEMENT OF FUNDS AND FRACTIONAL FUNDING",
  mp_art5Text1:
    "Funds are raised on the P2P marketplace until the total amount is reached: each Lender funds a share, with no Lender bound beyond its share nor jointly and severally liable with the other Lenders. Once the amount has been raised, the funds are transferred to the Borrower by wire transfer, less, where applicable, the fees referred to in Article 8.",
  mp_art5Text2:
    "If the total amount is not raised within the period displayed on the Platform, the financing shall be deemed unsuccessful and the sums already paid shall be returned to the Lenders.",
  mp_art6Title: "AMORTIZATION AND REPAYMENT SCHEDULE",
  mp_art6Text:
    "The loan is repayable on a constant amortization basis, in accordance with the table set out in Annex 1. Repayments are redistributed by the Intermediary to each Lender in proportion to its share.",
  mp_art7Title: "EARLY REPAYMENT",
  mp_art7Text: "The Borrower may at any time repay, in whole or in part, the sums remaining due, before their due date.",
  mp_art7Callout: "is an early repayment indemnity applicable, and if so, subject to what regulatory cap?",
  mp_art8Title: "INTERMEDIARY FEES",
  mp_art8Text:
    "The Intermediary receives fees whose principle and schedule are those defined by the fee engine applicable to the relevant product as of the date this agreement is entered into.",
  mp_art8Callout: "precise fee schedule to be attached as an annex prior to distribution.",
  mp_art9Title: "PAYMENT DEFAULT AND LATE INTEREST",
  mp_art9Text:
    "In the event of non-payment when due, and without any prior formal notice being required, unpaid sums shall automatically bear interest at the statutory rate then in effect, increased, from the due date until payment in full, without prejudice to article 1231-6 of the French Civil Code.",
  mp_art10Title: "RISK WARNING",
  mp_art10Text:
    "Each Lender is warned and cautioned, in accordance with article L.548-6 of the French Monetary and Financial Code, about how crowdfunding operates, and in particular:",
  mp_art10Items: [
    "the risk of total or partial loss of the capital lent in the event of default by the Borrower;",
    "the absence of any guarantee of repayment by the Intermediary, which is neither a lender, nor a guarantor, nor an insurer;",
    "the risk of illiquidity of the sums lent prior to the agreed maturity date;",
    "the need to diversify one's investments.",
  ],
  mp_art11Title: "ACCELERATION",
  mp_art11Text:
    "The Intermediary, in the name and on behalf of the Lenders, may invoke the immediate acceleration of the loan, without prior notice or judicial formality, notably in the event of non-payment not remedied within 15 days following formal notice, of insolvency proceedings against the Borrower, of the inaccuracy of any representation, or of fraudulent conduct.",
  mp_art12Title: "HANDLING OF BORROWER DEFAULT",
  mp_art12Text:
    "In the event of a missed payment, the Intermediary shall notify the Lenders and send the Borrower a reminder, then, failing remedy within 15 days, a formal notice. Failing payment, the Intermediary may pursue any amicable or judicial recovery action on behalf of the Lenders who authorize it to do so.",
  mp_art13Title: "RIGHT OF WITHDRAWAL",
  mp_art13Callout:
    "the existence and duration of a right of withdrawal depend on the Intermediary's precise regulatory status (national IFP or PSFP within the meaning of Regulation (EU) 2020/1503 (ECSP)) and on the classification of the Lender. Article R.548-6 requires this right and its terms to be stated.",
  mp_art14Title: "ROLE AND LIABILITY OF THE INTERMEDIARY",
  mp_art14Text:
    "The Intermediary acts as agent for the Lenders. It is under no circumstances a lending party, guarantees neither the capital nor the interest, and its liability shall not be engaged merely by reason of the Borrower's default, subject to its duty of good conduct under articles L.548-1 et seq.",
  mp_art15Title: "PERSONAL DATA",
  mp_art15Text:
    "The Parties' personal data is processed by the Intermediary, as data controller, in accordance with the GDPR and French Act No. 78-17 of 6 January 1978, as amended, solely for the purposes of performing the agreement and complying with applicable legal obligations.",
  mp_art16Title: "GOVERNING LAW AND JURISDICTION",
  mp_art16Text:
    "This agreement is governed by French law. Any dispute relating to its validity, interpretation, or performance shall be submitted to the exclusive jurisdiction of the competent French courts, subject to applicable mandatory public policy rules.",
  mp_signBorrowerLabel: "The Borrower",
  mp_signIntermediaryLabel: "For the Intermediary, Lentific",
  mp_annex1Title: "ANNEX 1 - REPAYMENT SCHEDULE",
  mp_annex1Subtitle: "Loan of {amount} · {duration} monthly installments · fixed rate {rate}% · installment {monthly}",
  mp_annex1Headers: ["No.", "Date", "Principal", "Interest", "Installment", "Remaining balance"],
  mp_annex2Title: "ANNEX 2 - KEY INFORMATION SUMMARY",
  mp_annex2RowLabels: [
    "Borrower",
    "Amount borrowed",
    "Duration",
    "Fixed borrowing rate",
    "Installment",
    "Total cost of credit",
    "Internal risk score",
    "Main risk for the Lender",
  ],
  mp_annex2MainRiskText: "Partial or total loss of the capital lent (Article 10)",
  mp_annex3Title: "ANNEX 3 - SUBSCRIPTION FORM (TEMPLATE)",
  mp_annex3Text:
    "I, the undersigned, [Lender's Name], declare that I am subscribing to the financing of the Borrower designated herein for an amount of [amount] EUR, and acknowledge having read and accepted without reservation the entirety of the provisions of this agreement, referenced {reference}, in particular the risk warning set out in Article 10.",
  mp_footerNote:
    "Document automatically generated by the Lentific platform from case file {reference}. Statements marked “to be confirmed” must be completed with the company's actual registration data and settled by a lawyer before any use in production. Structure established by reference to articles L.548-1 et seq. and R.548-1 et seq. (in particular R.548-6) of the French Monetary and Financial Code.",

  dl_pdfTitle: "Direct Loan Agreement - {reference}",
  dl_mainTitle: "PEER-TO-PEER LOAN AGREEMENT",
  dl_mainSubtitle: "Direct loan entered into between the parties following an introduction via the Lentific platform",
  dl_borrowerHeading: "THE BORROWER",
  dl_borrowerText: "{name} ({email}){cityPart}, hereinafter “the Borrower”.",
  dl_borrowerCityPart: ", residing at {city}",
  dl_lenderHeading: "THE LENDER",
  dl_lenderText: "{name} ({email}), hereinafter “the Lender”.",
  dl_preambleHeading: "PREAMBLE",
  dl_preambleText:
    "{borrowerName} and {lenderName} were introduced to one another via the Lentific platform, upon payment of the introduction fees provided for by the Platform. The Parties have agreed, outside of any fractional funding or regulated intermediation by the Platform, to enter directly into this loan agreement between themselves in the amount of {amount}. Lentific is neither a lender, nor a borrower, nor a crowdfunding intermediary under this agreement: its role is limited to having introduced the Parties to one another and to generating this document.",
  dl_art1Title: "PURPOSE OF THE AGREEMENT",
  dl_art1Text:
    "This agreement sets out the terms under which the Lender grants the Borrower an interest-bearing loan of money, directly, as well as the terms of its repayment.",
  dl_art2Title: "FINANCIAL TERMS OF THE LOAN",
  dl_art2RowLabels: ["Loan amount", "Duration", "Annual interest rate", "Installment", "Total cost of credit"],
  dl_art3Title: "DISBURSEMENT OF FUNDS",
  dl_art3Text:
    "The Parties freely agree between themselves on the terms for disbursing the funds from the Lender to the Borrower, the Platform not being involved in any capacity in this disbursement.",
  dl_art4Title: "REPAYMENT AND SCHEDULE",
  dl_art4Text:
    "The loan is repayable according to the indicative schedule set out in Annex 1, directly between the Parties, without going through the Platform.",
  dl_art4Callout:
    "a loan between private individuals may fall within the scope of the French Consumer Code (consumer credit) depending on the status of the Parties and the amount involved, with specific obligations (preliminary offer, withdrawal period): to be verified before signature.",
  dl_art5Title: "EARLY REPAYMENT",
  dl_art5Text:
    "The Borrower may at any time repay, in whole or in part, the sums remaining due, before their due date, unless otherwise expressly agreed between the Parties.",
  dl_art6Title: "PAYMENT DEFAULT",
  dl_art6Text:
    "In the event of non-payment when due, unpaid sums shall automatically bear interest at the statutory rate then in effect, increased, from the due date until payment in full, without prejudice to article 1231-6 of the French Civil Code.",
  dl_art7Title: "RISK WARNING",
  dl_art7Text: "The Lender acknowledges having been informed of and warned about the risks inherent in a direct loan to a private individual, and in particular:",
  dl_art7Items: [
    "the risk of total or partial loss of the capital lent in the event of default by the Borrower;",
    "the absence of any guarantee of repayment by Lentific, which is neither a lender, nor a guarantor, nor an insurer, nor a crowdfunding intermediary under this agreement;",
    "the risk of illiquidity of the sums lent prior to the agreed maturity date;",
    "the value of having this agreement reviewed by a legal professional before signature, as this document is only a template.",
  ],
  dl_art8Title: "ROLE OF LENTIFIC",
  dl_art8Text:
    "Lentific is not a party in any capacity to this agreement, guarantees neither the capital nor the interest, and its role is limited to having introduced the Parties to one another. Whatever occurs between the Parties from the signature of this agreement onward takes place outside the Platform and does not engage Lentific's liability.",
  dl_art9Title: "PERSONAL DATA",
  dl_art9Text:
    "The personal data exchanged in connection with the introduction was processed by Lentific in accordance with the GDPR; the Parties remain solely responsible for their own processing of the other Party's data once introduced.",
  dl_art10Title: "GOVERNING LAW AND JURISDICTION",
  dl_art10Text:
    "This agreement is governed by French law. Any dispute relating to its validity, interpretation, or performance shall be submitted to the exclusive jurisdiction of the competent French courts, subject to applicable mandatory public policy rules.",
  dl_signBorrowerLabel: "The Borrower",
  dl_signLenderLabel: "The Lender",
  dl_annex1Title: "ANNEX 1 - INDICATIVE REPAYMENT SCHEDULE",
  dl_annex1Subtitle: "Loan of {amount} · {duration} monthly installments · fixed rate {rate}% · installment {monthly}",
  dl_annex1Headers: ["No.", "Date", "Principal", "Interest", "Installment", "Remaining balance"],
  dl_footerNote:
    "Document automatically generated by the Lentific platform from the introduction referenced {reference}. This agreement is a TEMPLATE: to be approved by a legal professional before signature, in particular regarding its possible classification as consumer credit (Article 4).",
};
