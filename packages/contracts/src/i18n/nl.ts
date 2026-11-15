import type { ContractStrings } from "./types";

export const nl: ContractStrings = {
  bannerLabel: "MODEL: automatisch gegenereerd document, te laten valideren door een jurist voorafgaand aan gebruik in de praktijk",
  bannerRef: "Dossierreferentie: {reference}, gegenereerd op {date}",
  articleWord: "ARTIKEL",
  calloutPrefix: "TER BEVESTIGING DOOR DE JURIDISCH ADVISEUR",
  durationUnit: "maanden",
  signElectronic: "(elektronische handtekening)",
  noScoreAvailable: "Niet beschikbaar",

  mp_pdfTitle: "Leningsovereenkomst - {reference}",
  mp_mainTitle: "LENINGSOVEREENKOMST VOOR KREDIETGEBASEERDE CROWDFUNDING",
  mp_mainSubtitle: "Opgesteld overeenkomstig de artikelen L.548-1 e.v. en R.548-1 e.v. van het Franse Wetboek van Monetair en Financieel Recht",
  mp_intermediaryHeading: "DE INTERMEDIAIR VOOR KREDIETGEBASEERDE CROWDFUNDING",
  mp_intermediaryText:
    "De vennootschap Lentific, [rechtsvorm aan te vullen] met een kapitaal van [bedrag] euro, [adres van de maatschappelijke zetel aan te vullen], ingeschreven in het RCS (het Franse handelsregister) van [stad] onder nummer [SIREN ter bevestiging], ingeschreven bij ORIAS als intermediair voor kredietgebaseerde crowdfunding onder nummer [ORIAS-nummer ter bevestiging], hierna „de Intermediair” of „Lentific”, handelend als lasthebber van de Kredietgevers, zonder zelf partij te zijn als kredietgever.",
  mp_borrowerHeading: "DE KREDIETNEMER",
  mp_borrowerText: "{name} ({email}){cityPart}, handelend in de uitoefening van een beroep of bedrijf, hierna „de Kredietnemer”.",
  mp_borrowerCityPart: ", woonachtig te {city}",
  mp_lendersHeading: "DE KREDIETGEVER(S)",
  mp_lendersText:
    "De natuurlijke personen of rechtspersonen van wie de identiteit, de contactgegevens en het individueel uitgeleende aandeel zijn opgenomen in Bijlage 3 (Inschrijvingsformulieren), waarbij elke Kredietgever individueel handelt en zonder hoofdelijkheid tussen hen onderling, hierna gezamenlijk „de Kredietgevers”.",
  mp_preambleHeading: "PREAMBULE",
  mp_preambleText1:
    "De Kredietnemer heeft op het platform Lentific een financieringsaanvraag ingediend voor een bedrag van {amount}, bestemd voor professioneel gebruik. Dit dossier is onderworpen aan een identiteitscontrole, een analyse van de terugbetalingscapaciteit door de risico-engine van het Platform{riskPart}, en vervolgens aan een beoordeling door een daartoe bevoegde beheerder, na afloop waarvan een aanbod is opgesteld en door de Kredietnemer is aanvaard.",
  mp_preambleRiskPart: " (behaald score: {score}/100)",
  mp_preambleText2:
    "Deze overeenkomst legt de voorwaarden van deze financiering vast, verstrekt door een of meer Kredietgevers via de P2P-marketplace van het Platform, onder de voorwaarden voor gesplitste financiering zoals beschreven in Artikel 5.",
  mp_art1Title: "DEFINITIES",
  mp_art1Items: [
    "„Platform” duidt de website en de applicatie aan die door Lentific worden geëxploiteerd.",
    "„Kredietgebaseerde crowdfunding” (crowdlending) duidt de verrichting aan waarbij een of meer Kredietgevers een rentedragende lening verstrekken aan de Kredietnemer, overeenkomstig de artikelen L.548-1 en volgende van het Franse Wetboek van Monetair en Financieel Recht.",
    "„JKP” duidt het jaarlijks kostenpercentage aan.",
    "„Aflossingsschema” duidt de aflossingstabel aan die is opgenomen in Bijlage 1.",
  ],
  mp_art2Title: "VERKLARINGEN EN GARANTIES VAN DE PARTIJEN",
  mp_art2Sub1: "2.1 Gemeenschappelijke verklaringen",
  mp_art2Text1:
    "Elke Partij verklaart volledig handelingsbekwaam te zijn om overeenkomsten aan te gaan en op de datum van ondertekening niet in staat van betalingsonmacht te verkeren.",
  mp_art2Sub2: "2.2 Verklaringen van de Kredietnemer",
  mp_art2Text2:
    "De Kredietnemer verklaart dat de in het kader van zijn aanvraag verstrekte informatie juist, oprecht en actueel is, en dat zich geen enkele gebeurtenis heeft voorgedaan die zijn terugbetalingscapaciteit zou kunnen aantasten zonder dat hij het Platform daarvan op de hoogte heeft gesteld.",
  mp_art2Sub3: "2.3 Verklaringen van de Kredietgevers",
  mp_art2Text3:
    "Elke Kredietgever verklaart kennis te hebben genomen van het beknopte informatieblad (Bijlage 2) en erkent te zijn geïnformeerd over en gewaarschuwd te zijn voor de risico's die zijn beschreven in Artikel 10.",
  mp_art3Title: "VOORWERP VAN DE OVEREENKOMST",
  mp_art3Text:
    "Deze overeenkomst legt de voorwaarden vast waaronder de Kredietgevers, via het Platform, aan de Kredietnemer een rentedragende geldlening verstrekken, alsmede de wijze van terugbetaling daarvan.",
  mp_art4Title: "FINANCIËLE KENMERKEN VAN DE LENING",
  mp_art4RowLabels: [
    "Totaal kredietbedrag",
    "Looptijd",
    "Toepasselijke vaste debetrentevoet (jaarlijks)",
    "Maandelijkse aflossing (exclusief verzekering)",
    "Totaal bedrag aan rente",
    "Totale kosten van het krediet",
  ],
  mp_art4TaegLabel: "JKP",
  mp_art4TaegValue: "door de Intermediair te berekenen vóór verspreiding",
  mp_art5Title: "TERBESCHIKKINGSTELLING VAN DE GELDEN EN GESPLITSTE FINANCIERING",
  mp_art5Text1:
    "De gelden worden op de P2P-marketplace ingezameld totdat het totaalbedrag is bereikt: elke Kredietgever financiert een aandeel, zonder dat een Kredietgever verder gehouden is dan zijn aandeel of hoofdelijk aansprakelijk is voor de overige Kredietgevers. Zodra het bedrag is ingezameld, worden de gelden per overschrijving aan de Kredietnemer uitbetaald, in voorkomend geval onder aftrek van de in Artikel 8 bedoelde kosten.",
  mp_art5Text2:
    "Indien het totaalbedrag niet binnen de op het Platform vermelde termijn wordt ingezameld, wordt de financiering geacht niet tot stand te zijn gekomen en worden de reeds gestorte bedragen aan de Kredietgevers terugbetaald.",
  mp_art6Title: "AFLOSSING EN AFLOSSINGSSCHEMA",
  mp_art6Text:
    "De lening wordt terugbetaald volgens een lineaire aflossing, overeenkomstig de tabel opgenomen in Bijlage 1. De terugbetalingen worden door de Intermediair aan elke Kredietgever herverdeeld naar rato van zijn aandeel.",
  mp_art7Title: "VERVROEGDE TERUGBETALING",
  mp_art7Text: "De Kredietnemer kan te allen tijde geheel of gedeeltelijk vervroegd de nog verschuldigde bedragen terugbetalen.",
  mp_art7Callout: "is een vergoeding voor vervroegde terugbetaling van toepassing, en volgens welk wettelijk maximum?",
  mp_art8Title: "KOSTEN VAN DE INTERMEDIAIR",
  mp_art8Text:
    "De Intermediair int kosten waarvan het principe en het tarief worden bepaald door de kostenengine (Fee Engine) die van toepassing is op het betreffende product op de datum van sluiting van deze overeenkomst.",
  mp_art8Callout: "exact tarief bij te voegen als bijlage vóór verspreiding.",
  mp_art9Title: "WANBETALING EN VERTRAGINGSRENTE",
  mp_art9Text:
    "Bij niet-betaling op de vervaldatum, en zonder dat voorafgaande ingebrekestelling vereist is, brengen de onbetaalde bedragen van rechtswege rente op tegen het verhoogde wettelijke rentetarief dat van kracht is, vanaf de datum van opeisbaarheid tot volledige betaling, onverminderd artikel 1231-6 van het Franse Burgerlijk Wetboek.",
  mp_art10Title: "WAARSCHUWING INZAKE RISICO'S",
  mp_art10Text:
    "Elke Kredietgever wordt overeenkomstig artikel L.548-6 van het Franse Wetboek van Monetair en Financieel Recht geïnformeerd over en gewaarschuwd voor de werking van kredietgebaseerde crowdfunding, en met name voor:",
  mp_art10Items: [
    "het risico van gehele of gedeeltelijke verlies van het uitgeleende kapitaal in geval van wanbetaling door de Kredietnemer;",
    "het ontbreken van een terugbetalingsgarantie door de Intermediair, die geen kredietgever, garant of verzekeraar is;",
    "het risico van illiquiditeit van de uitgeleende bedragen vóór de overeengekomen vervaldatum;",
    "de noodzaak om zijn beleggingen te spreiden.",
  ],
  mp_art11Title: "VERVROEGDE OPEISBAARHEID",
  mp_art11Text:
    "De Intermediair kan, in naam en voor rekening van de Kredietgevers, zich beroepen op de onmiddellijke opeisbaarheid van de lening, zonder voorafgaande kennisgeving of gerechtelijke formaliteit, met name in geval van niet-betaling die niet binnen 15 dagen na ingebrekestelling is geregulariseerd, van een collectieve procedure ten aanzien van de Kredietnemer, van onjuistheid van een verklaring of van frauduleus handelen.",
  mp_art12Title: "BEHEER VAN WANBETALING DOOR DE KREDIETNEMER",
  mp_art12Text:
    "In geval van wanbetaling stelt de Intermediair de Kredietgevers hiervan in kennis en richt hij een betalingsherinnering aan de Kredietnemer, gevolgd door, bij gebreke van regularisatie binnen 15 dagen, een ingebrekestelling. Bij voortdurende niet-betaling kan de Intermediair, voor rekening van de Kredietgevers die hem daartoe machtigen, elke minnelijke of gerechtelijke invordering instellen.",
  mp_art13Title: "HERROEPINGSRECHT",
  mp_art13Callout:
    "het bestaan en de duur van een herroepingsrecht zijn afhankelijk van de precieze reglementaire status van de Intermediair (nationale IFP of PSFP in de zin van Verordening (EU) 2020/1503 inzake ECSP) en van de hoedanigheid van de Kredietgever. Artikel R.548-6 verplicht tot vermelding van dit recht en de wijze van uitoefening ervan.",
  mp_art14Title: "ROL EN AANSPRAKELIJKHEID VAN DE INTERMEDIAIR",
  mp_art14Text:
    "De Intermediair handelt als lasthebber van de Kredietgevers. Hij is in geen geval kredietgever, garandeert noch het kapitaal noch de rente, en zijn aansprakelijkheid kan niet worden ingeroepen op grond van het enkele feit van wanbetaling door de Kredietnemer, onverminderd zijn verplichtingen inzake goed gedrag krachtens de artikelen L.548-1 en volgende.",
  mp_art15Title: "PERSOONSGEGEVENS",
  mp_art15Text:
    "De persoonsgegevens van de Partijen worden verwerkt door de Intermediair, als verwerkingsverantwoordelijke, overeenkomstig de AVG (RGPD) en de Franse wet nr. 78-17 van 6 januari 1978, zoals gewijzigd, uitsluitend voor de uitvoering van de overeenkomst en de naleving van de toepasselijke wettelijke verplichtingen.",
  mp_art16Title: "TOEPASSELIJK RECHT EN BEVOEGDE RECHTBANK",
  mp_art16Text:
    "Deze overeenkomst is onderworpen aan Frans recht. Elk geschil met betrekking tot de geldigheid, de uitlegging of de uitvoering ervan wordt onderworpen aan de exclusieve bevoegdheid van de territoriaal bevoegde Franse rechtbanken, onder voorbehoud van de toepasselijke regels van openbare orde.",
  mp_signBorrowerLabel: "De Kredietnemer",
  mp_signIntermediaryLabel: "Voor de Intermediair, Lentific",
  mp_annex1Title: "BIJLAGE 1 - AFLOSSINGSSCHEMA",
  mp_annex1Subtitle: "Lening van {amount} · {duration} maandelijkse termijnen · vaste rentevoet {rate} % · maandelijkse aflossing {monthly}",
  mp_annex1Headers: ["Term.", "Datum", "Kapitaal", "Rente", "Termijnbedrag", "Resterend saldo"],
  mp_annex2Title: "BIJLAGE 2 - BEKNOPT INFORMATIEBLAD",
  mp_annex2RowLabels: [
    "Kredietnemer",
    "Geleend bedrag",
    "Looptijd",
    "Vaste debetrentevoet",
    "Maandelijkse aflossing",
    "Totale kosten van het krediet",
    "Interne risicoscore",
    "Voornaamste risico voor de Kredietgever",
  ],
  mp_annex2MainRiskText: "Gedeeltelijk of volledig verlies van het uitgeleende kapitaal (Artikel 10)",
  mp_annex3Title: "BIJLAGE 3 - INSCHRIJVINGSFORMULIER (MODEL)",
  mp_annex3Text:
    "Ondergetekende, [Naam van de Kredietgever], verklaart in te schrijven op de financiering van de in deze overeenkomst aangeduide Kredietnemer voor een bedrag van [bedrag] EUR, en erkent kennis te hebben genomen van en zonder voorbehoud alle bepalingen van deze overeenkomst met referentie {reference} te hebben aanvaard, met inbegrip van de waarschuwing inzake risico's opgenomen in Artikel 10.",
  mp_footerNote:
    "Document automatisch gegenereerd door het platform Lentific op basis van dossier {reference}. De met „ter bevestiging” aangeduide vermeldingen dienen te worden aangevuld met de werkelijke registratiegegevens van de vennootschap en te worden beoordeeld door een advocaat vóór enige inproductiename. Structuur opgesteld met verwijzing naar de artikelen L.548-1 e.v. en R.548-1 e.v. (met name R.548-6) van het Franse Wetboek van Monetair en Financieel Recht.",

  dl_pdfTitle: "Directe leningsovereenkomst - {reference}",
  dl_mainTitle: "LENINGSOVEREENKOMST TUSSEN PARTICULIEREN",
  dl_mainSubtitle: "Directe lening gesloten tussen de partijen na bemiddeling via het platform Lentific",
  dl_borrowerHeading: "DE KREDIETNEMER",
  dl_borrowerText: "{name} ({email}){cityPart}, hierna „de Kredietnemer”.",
  dl_borrowerCityPart: ", woonachtig te {city}",
  dl_lenderHeading: "DE KREDIETGEVER",
  dl_lenderText: "{name} ({email}), hierna „de Kredietgever”.",
  dl_preambleHeading: "PREAMBULE",
  dl_preambleText:
    "{borrowerName} en {lenderName} zijn via het platform Lentific met elkaar in contact gebracht, tegen betaling van de door het Platform vastgestelde bemiddelingskosten. De Partijen zijn overeengekomen, buiten elke gesplitste financiering of gereglementeerde bemiddeling door het Platform om, rechtstreeks tussen hen deze leningsovereenkomst te sluiten voor een bedrag van {amount}. Lentific is voor deze overeenkomst geen kredietgever, geen kredietnemer en geen intermediair voor kredietgebaseerde crowdfunding: de rol van Lentific beperkt zich tot het in contact brengen van de Partijen en het genereren van dit document.",
  dl_art1Title: "VOORWERP VAN DE OVEREENKOMST",
  dl_art1Text:
    "Deze overeenkomst legt de voorwaarden vast waaronder de Kredietgever rechtstreeks aan de Kredietnemer een rentedragende geldlening verstrekt, alsmede de wijze van terugbetaling daarvan.",
  dl_art2Title: "FINANCIËLE KENMERKEN VAN DE LENING",
  dl_art2RowLabels: ["Leenbedrag", "Looptijd", "Jaarlijkse rentevoet", "Maandelijkse aflossing", "Totale kosten van het krediet"],
  dl_art3Title: "UITBETALING VAN DE GELDEN",
  dl_art3Text:
    "De Partijen komen onderling vrij de wijze van uitbetaling van de gelden door de Kredietgever aan de Kredietnemer overeen, waarbij het Platform op geen enkele wijze bij deze uitbetaling betrokken is.",
  dl_art4Title: "TERUGBETALING EN AFLOSSINGSSCHEMA",
  dl_art4Text:
    "De lening wordt terugbetaald volgens het indicatieve aflossingsschema opgenomen in Bijlage 1, rechtstreeks tussen de Partijen, zonder tussenkomst van het Platform.",
  dl_art4Callout:
    "een lening tussen particulieren kan, afhankelijk van de hoedanigheid van de Partijen en het betrokken bedrag, onder het Franse Consumentenwetboek (consumentenkrediet) vallen, met specifieke verplichtingen (voorafgaand aanbod, herroepingstermijn): te verifiëren vóór ondertekening.",
  dl_art5Title: "VERVROEGDE TERUGBETALING",
  dl_art5Text:
    "De Kredietnemer kan te allen tijde geheel of gedeeltelijk vervroegd de nog verschuldigde bedragen terugbetalen, tenzij uitdrukkelijk anders overeengekomen tussen de Partijen.",
  dl_art6Title: "WANBETALING",
  dl_art6Text:
    "Bij niet-betaling op de vervaldatum brengen de onbetaalde bedragen van rechtswege rente op tegen het verhoogde wettelijke rentetarief dat van kracht is, vanaf de datum van opeisbaarheid tot volledige betaling, onverminderd artikel 1231-6 van het Franse Burgerlijk Wetboek.",
  dl_art7Title: "WAARSCHUWING INZAKE RISICO'S",
  dl_art7Text: "De Kredietgever erkent te zijn geïnformeerd over en gewaarschuwd te zijn voor de risico's die inherent zijn aan een directe lening aan een particulier, en met name voor:",
  dl_art7Items: [
    "het risico van gehele of gedeeltelijke verlies van het uitgeleende kapitaal in geval van wanbetaling door de Kredietnemer;",
    "het ontbreken van enige terugbetalingsgarantie door Lentific, dat voor deze overeenkomst geen kredietgever, garant, verzekeraar of intermediair voor kredietgebaseerde crowdfunding is;",
    "het risico van illiquiditeit van de uitgeleende bedragen vóór de overeengekomen vervaldatum;",
    "het belang van het laten controleren van deze overeenkomst door een juridisch professional vóór ondertekening, aangezien dit document slechts een model is.",
  ],
  dl_art8Title: "ROL VAN LENTIFIC",
  dl_art8Text:
    "Lentific is op geen enkele wijze partij bij deze overeenkomst, garandeert noch het kapitaal noch de rente, en de rol van Lentific beperkt zich tot het in contact brengen van de Partijen. Wat zich tussen de Partijen afspeelt vanaf de ondertekening van deze overeenkomst, vindt plaats buiten het Platform om en brengt de aansprakelijkheid van Lentific niet in het geding.",
  dl_art9Title: "PERSOONSGEGEVENS",
  dl_art9Text:
    "De persoonsgegevens die in het kader van de bemiddeling zijn uitgewisseld, zijn door Lentific verwerkt overeenkomstig de AVG (RGPD); de Partijen blijven als enige verantwoordelijk voor de verwerking die zij, na de bemiddeling, maken van de gegevens van de andere Partij.",
  dl_art10Title: "TOEPASSELIJK RECHT EN BEVOEGDE RECHTBANK",
  dl_art10Text:
    "Deze overeenkomst is onderworpen aan Frans recht. Elk geschil met betrekking tot de geldigheid, de uitlegging of de uitvoering ervan wordt onderworpen aan de exclusieve bevoegdheid van de territoriaal bevoegde Franse rechtbanken, onder voorbehoud van de toepasselijke regels van openbare orde.",
  dl_signBorrowerLabel: "De Kredietnemer",
  dl_signLenderLabel: "De Kredietgever",
  dl_annex1Title: "BIJLAGE 1 - INDICATIEF AFLOSSINGSSCHEMA",
  dl_annex1Subtitle: "Lening van {amount} · {duration} maandelijkse termijnen · vaste rentevoet {rate} % · maandelijkse aflossing {monthly}",
  dl_annex1Headers: ["Term.", "Datum", "Kapitaal", "Rente", "Termijnbedrag", "Resterend saldo"],
  dl_footerNote:
    "Document automatisch gegenereerd door het platform Lentific op basis van de bemiddeling met referentie {reference}. Deze overeenkomst is een MODEL: te laten valideren door een juridisch professional vóór ondertekening, met name met betrekking tot de eventuele kwalificatie als consumentenkrediet (Artikel 4).",
};
