import type { ContractStrings } from "./types";

export const de: ContractStrings = {
  bannerLabel: "MUSTER: automatisch generiertes Dokument, vor der tatsächlichen Verwendung von einem Rechtsberater zu bestätigen",
  bannerRef: "Aktenzeichen: {reference}, erstellt am {date}",
  articleWord: "ARTIKEL",
  calloutPrefix: "VOM RECHTSBERATER ZU BESTÄTIGEN",
  durationUnit: "Monate",
  signElectronic: "(elektronische Unterschrift)",
  noScoreAvailable: "Nicht verfügbar",

  mp_pdfTitle: "Darlehensvertrag - {reference}",
  mp_mainTitle: "DARLEHENSVERTRAG ÜBER KREDITBASIERTE SCHWARMFINANZIERUNG",
  mp_mainSubtitle: "Erstellt in Anwendung der Artikel L.548-1 ff. und R.548-1 ff. des französischen Währungs- und Finanzgesetzbuchs (Code monétaire et financier)",
  mp_intermediaryHeading: "DER VERMITTLER FÜR KREDITBASIERTE SCHWARMFINANZIERUNG",
  mp_intermediaryText:
    "Die Gesellschaft Lentific, [Gesellschaftsform zu vervollständigen] mit einem Kapital von [Betrag] Euro, [Sitz der Gesellschaft zu vervollständigen], eingetragen im Handelsregister (RCS) von [Stadt] unter der Nummer [SIREN zu bestätigen], bei der ORIAS als Vermittler für kreditbasierte Schwarmfinanzierung unter der Nummer [ORIAS-Nummer zu bestätigen] registriert, im Folgenden „der Vermittler“ oder „Lentific“ genannt, handelnd als Bevollmächtigter der Darlehensgeber, ohne selbst Darlehensgeberin zu sein.",
  mp_borrowerHeading: "DER DARLEHENSNEHMER",
  mp_borrowerText: "{name} ({email}){cityPart}, handelnd zu gewerblichen Zwecken, im Folgenden „der Darlehensnehmer“ genannt.",
  mp_borrowerCityPart: ", wohnhaft in {city}",
  mp_lendersHeading: "DER ODER DIE DARLEHENSGEBER",
  mp_lendersText:
    "Die natürlichen oder juristischen Personen, deren Identität, Kontaktdaten und individuell verliehener Anteil in Anlage 3 (Zeichnungsscheine) aufgeführt sind, wobei jeder Darlehensgeber individuell und ohne gesamtschuldnerische Haftung untereinander handelt, im Folgenden gemeinsam „die Darlehensgeber“ genannt.",
  mp_preambleHeading: "PRÄAMBEL",
  mp_preambleText1:
    "Der Darlehensnehmer hat auf der Plattform Lentific einen Finanzierungsantrag über einen Betrag von {amount} zu gewerblichen Zwecken gestellt. Dieser Antrag wurde einer Identitätsprüfung sowie einer Analyse der Rückzahlungsfähigkeit durch die Risikoengine der Plattform{riskPart} unterzogen und anschließend von einem befugten Sachbearbeiter geprüft; im Anschluss daran wurde ein Angebot erstellt und vom Darlehensnehmer angenommen.",
  mp_preambleRiskPart: " (erzielter Score: {score}/100)",
  mp_preambleText2:
    "Der vorliegende Vertrag legt die Bedingungen dieser Finanzierung fest, die durch einen oder mehrere Darlehensgeber auf dem P2P-Marktplatz der Plattform unter den in Artikel 5 beschriebenen Bedingungen der gestückelten Finanzierung gewährleistet wird.",
  mp_art1Title: "DEFINITIONEN",
  mp_art1Items: [
    "„Plattform“ bezeichnet die von Lentific betriebene Website und Anwendung.",
    "„Kreditbasierte Schwarmfinanzierung“ (Crowdlending) bezeichnet den Vorgang, bei dem ein oder mehrere Darlehensgeber dem Darlehensnehmer gemäß den Artikeln L.548-1 ff. des französischen Währungs- und Finanzgesetzbuchs ein verzinsliches Darlehen gewähren.",
    "„Effektiver Jahreszins“ bezeichnet den jährlichen effektiven Gesamtzinssatz.",
    "„Tilgungsplan“ bezeichnet die in Anlage 1 aufgeführte Tilgungstabelle.",
  ],
  mp_art2Title: "ERKLÄRUNGEN UND ZUSICHERUNGEN DER PARTEIEN",
  mp_art2Sub1: "2.1 Gemeinsame Erklärungen",
  mp_art2Text1:
    "Jede Partei erklärt, die volle Geschäftsfähigkeit zum Vertragsabschluss zu besitzen und sich zum Zeitpunkt der Unterzeichnung nicht in Zahlungseinstellung zu befinden.",
  mp_art2Sub2: "2.2 Erklärungen des Darlehensnehmers",
  mp_art2Text2:
    "Der Darlehensnehmer erklärt, dass die im Rahmen seines Antrags übermittelten Angaben richtig, wahrheitsgemäß und aktuell sind und dass kein Ereignis eingetreten ist, das seine Rückzahlungsfähigkeit beeinträchtigen könnte, ohne die Plattform hierüber informiert zu haben.",
  mp_art2Sub3: "2.3 Erklärungen der Darlehensgeber",
  mp_art2Text3:
    "Jeder Darlehensgeber erklärt, von dem zusammenfassenden Informationsblatt (Anlage 2) Kenntnis genommen zu haben, und bestätigt, über die in Artikel 10 beschriebenen Risiken informiert und gewarnt worden zu sein.",
  mp_art3Title: "VERTRAGSGEGENSTAND",
  mp_art3Text:
    "Der vorliegende Vertrag legt die Bedingungen fest, unter denen die Darlehensgeber dem Darlehensnehmer über die Plattform ein verzinsliches Gelddarlehen gewähren, sowie die Modalitäten von dessen Rückzahlung.",
  mp_art4Title: "FINANZIELLE MERKMALE DES DARLEHENS",
  mp_art4RowLabels: [
    "Gesamtbetrag des Kredits",
    "Laufzeit",
    "Anwendbarer fester Sollzinssatz (jährlich)",
    "Monatsrate (ohne Versicherung)",
    "Gesamtbetrag der Zinsen",
    "Gesamtkosten des Kredits",
  ],
  mp_art4TaegLabel: "Effektiver Jahreszins",
  mp_art4TaegValue: "vom Vermittler vor Veröffentlichung zu berechnen",
  mp_art5Title: "BEREITSTELLUNG DER MITTEL UND GESTÜCKELTE FINANZIERUNG",
  mp_art5Text1:
    "Die Mittel werden auf dem P2P-Marktplatz bis zum Erreichen des Gesamtbetrags eingesammelt: Jeder Darlehensgeber finanziert einen Anteil, ohne dass ein Darlehensgeber über seinen Anteil hinaus haftet oder gesamtschuldnerisch mit den anderen Darlehensgebern verbunden ist. Sobald der Betrag eingesammelt ist, werden die Mittel dem Darlehensnehmer per Überweisung ausgezahlt, gegebenenfalls abzüglich der in Artikel 8 genannten Gebühren.",
  mp_art5Text2:
    "Wird der Gesamtbetrag nicht innerhalb der auf der Plattform angezeigten Frist eingesammelt, gilt die Finanzierung als nicht zustande gekommen, und die bereits eingezahlten Beträge werden den Darlehensgebern zurückerstattet.",
  mp_art6Title: "TILGUNG UND TILGUNGSPLAN",
  mp_art6Text:
    "Das Darlehen ist gemäß einer konstanten Tilgung entsprechend der in Anlage 1 aufgeführten Tabelle zurückzuzahlen. Die Rückzahlungen werden vom Vermittler anteilig entsprechend dem jeweiligen Anteil an jeden Darlehensgeber weiterverteilt.",
  mp_art7Title: "VORZEITIGE RÜCKZAHLUNG",
  mp_art7Text: "Der Darlehensnehmer kann die noch geschuldeten Beträge jederzeit ganz oder teilweise vorzeitig zurückzahlen.",
  mp_art7Callout: "Ist eine Vorfälligkeitsentschädigung anwendbar, und wenn ja, innerhalb welcher gesetzlichen Obergrenze?",
  mp_art8Title: "GEBÜHREN DES VERMITTLERS",
  mp_art8Text:
    "Der Vermittler erhebt Gebühren, deren Grundsatz und Höhe sich nach der Gebührenengine (Fee Engine) richten, die zum Zeitpunkt des Abschlusses des vorliegenden Vertrags auf das betreffende Produkt anwendbar ist.",
  mp_art8Callout: "Genaue Gebührentabelle vor Veröffentlichung als Anlage beizufügen.",
  mp_art9Title: "ZAHLUNGSVERZUG UND VERZUGSZINSEN",
  mp_art9Text:
    "Bei Nichtzahlung zum Fälligkeitstermin, ohne dass eine vorherige Mahnung erforderlich ist, werden die ausstehenden Beträge von Rechts wegen ab dem Fälligkeitsdatum bis zur vollständigen Zahlung mit dem erhöhten gesetzlichen Zinssatz verzinst, unbeschadet des Artikels 1231-6 des französischen Zivilgesetzbuchs (Code civil).",
  mp_art10Title: "RISIKOHINWEIS",
  mp_art10Text:
    "Jeder Darlehensgeber wird gemäß Artikel L.548-6 des französischen Währungs- und Finanzgesetzbuchs über die Funktionsweise der kreditbasierten Schwarmfinanzierung informiert und gewarnt, insbesondere über:",
  mp_art10Items: [
    "das Risiko eines vollständigen oder teilweisen Verlusts des verliehenen Kapitals im Falle eines Zahlungsausfalls des Darlehensnehmers;",
    "das Fehlen einer Rückzahlungsgarantie durch den Vermittler, der weder Darlehensgeber noch Bürge noch Versicherer ist;",
    "das Risiko der Illiquidität der verliehenen Beträge vor dem vereinbarten Fälligkeitstermin;",
    "die Notwendigkeit, seine Investitionen zu diversifizieren.",
  ],
  mp_art11Title: "VORZEITIGE FÄLLIGKEIT",
  mp_art11Text:
    "Der Vermittler kann im Namen und für Rechnung der Darlehensgeber ohne vorherige Ankündigung und ohne vorheriges gerichtliches Verfahren die sofortige Fälligkeit des Darlehens geltend machen, insbesondere im Falle einer nicht innerhalb von 15 Tagen nach Mahnung behobenen Nichtzahlung, eines Insolvenzverfahrens gegen den Darlehensnehmer, der Unrichtigkeit einer Erklärung oder einer betrügerischen Handlung.",
  mp_art12Title: "UMGANG MIT DEM ZAHLUNGSAUSFALL DES DARLEHENSNEHMERS",
  mp_art12Text:
    "Im Falle eines Zahlungsausfalls benachrichtigt der Vermittler die Darlehensgeber und richtet an den Darlehensnehmer eine Zahlungserinnerung und danach, falls innerhalb von 15 Tagen keine Regularisierung erfolgt, eine Mahnung. Bei weiterhin ausbleibender Zahlung kann der Vermittler für Rechnung der ihn hierzu ermächtigenden Darlehensgeber jede außergerichtliche oder gerichtliche Beitreibung einleiten.",
  mp_art13Title: "WIDERRUFSRECHT",
  mp_art13Callout:
    "Das Bestehen und die Dauer eines Widerrufsrechts hängen vom genauen regulatorischen Status des Vermittlers (nationaler IFP oder PSFP im Sinne der Verordnung (EU) 2020/1503, ECSP) sowie von der Einstufung des Darlehensgebers ab. Artikel R.548-6 schreibt vor, dieses Recht und seine Modalitäten anzugeben.",
  mp_art14Title: "ROLLE UND HAFTUNG DES VERMITTLERS",
  mp_art14Text:
    "Der Vermittler handelt als Bevollmächtigter der Darlehensgeber. Er ist in keinem Fall Darlehensgeber, garantiert weder das Kapital noch die Zinsen, und seine Haftung kann nicht allein aufgrund des Zahlungsausfalls des Darlehensnehmers begründet werden, vorbehaltlich seiner Wohlverhaltenspflichten gemäß den Artikeln L.548-1 ff.",
  mp_art15Title: "PERSONENBEZOGENE DATEN",
  mp_art15Text:
    "Die personenbezogenen Daten der Parteien werden vom Vermittler als Verantwortlichem gemäß der DSGVO und dem französischen Gesetz Nr. 78-17 vom 6. Januar 1978 in geänderter Fassung ausschließlich zum Zweck der Vertragserfüllung und der Einhaltung der geltenden gesetzlichen Verpflichtungen verarbeitet.",
  mp_art16Title: "ANWENDBARES RECHT UND ZUSTÄNDIGER GERICHTSSTAND",
  mp_art16Text:
    "Der vorliegende Vertrag unterliegt französischem Recht. Jeder Streitfall bezüglich seiner Gültigkeit, Auslegung oder Erfüllung unterliegt der ausschließlichen Zuständigkeit der örtlich zuständigen französischen Gerichte, vorbehaltlich der anwendbaren zwingenden Rechtsvorschriften.",
  mp_signBorrowerLabel: "Der Darlehensnehmer",
  mp_signIntermediaryLabel: "Für den Vermittler, Lentific",
  mp_annex1Title: "ANLAGE 1 - TILGUNGSPLAN",
  mp_annex1Subtitle: "Darlehen über {amount} · {duration} Monatsraten · fester Zinssatz {rate} % · Monatsrate {monthly}",
  mp_annex1Headers: ["Rate", "Datum", "Kapital", "Zinsen", "Monatsrate", "Restschuld"],
  mp_annex2Title: "ANLAGE 2 - ZUSAMMENFASSENDES INFORMATIONSBLATT",
  mp_annex2RowLabels: [
    "Darlehensnehmer",
    "Darlehensbetrag",
    "Laufzeit",
    "Fester Sollzinssatz",
    "Monatsrate",
    "Gesamtkosten des Kredits",
    "Interner Risiko-Score",
    "Hauptrisiko für den Darlehensgeber",
  ],
  mp_annex2MainRiskText: "Teilweiser oder vollständiger Verlust des verliehenen Kapitals (Artikel 10)",
  mp_annex3Title: "ANLAGE 3 - ZEICHNUNGSSCHEIN (MUSTER)",
  mp_annex3Text:
    "Ich, der/die Unterzeichnende [Name des Darlehensgebers], erkläre, die Finanzierung des in diesem Vertrag bezeichneten Darlehensnehmers in Höhe von [Betrag] EUR zu zeichnen, und bestätige, von sämtlichen Bestimmungen des vorliegenden Vertrags mit dem Aktenzeichen {reference}, insbesondere dem in Artikel 10 enthaltenen Risikohinweis, Kenntnis genommen und diese vorbehaltlos akzeptiert zu haben.",
  mp_footerNote:
    "Dokument automatisch von der Plattform Lentific auf Grundlage der Akte {reference} erstellt. Die als „zu bestätigen“ gekennzeichneten Angaben sind mit den tatsächlichen Registrierungsdaten der Gesellschaft zu vervollständigen und vor jeder Produktivsetzung von einem Rechtsanwalt zu prüfen. Struktur erstellt unter Bezugnahme auf die Artikel L.548-1 ff. und R.548-1 ff. (insbesondere R.548-6) des französischen Währungs- und Finanzgesetzbuchs.",

  dl_pdfTitle: "Direkter Darlehensvertrag - {reference}",
  dl_mainTitle: "DARLEHENSVERTRAG ZWISCHEN PRIVATPERSONEN",
  dl_mainSubtitle: "Direktes Darlehen, das zwischen den Parteien nach einer Vermittlung über die Plattform Lentific geschlossen wurde",
  dl_borrowerHeading: "DER DARLEHENSNEHMER",
  dl_borrowerText: "{name} ({email}){cityPart}, im Folgenden „der Darlehensnehmer“ genannt.",
  dl_borrowerCityPart: ", wohnhaft in {city}",
  dl_lenderHeading: "DER DARLEHENSGEBER",
  dl_lenderText: "{name} ({email}), im Folgenden „der Darlehensgeber“ genannt.",
  dl_preambleHeading: "PRÄAMBEL",
  dl_preambleText:
    "{borrowerName} und {lenderName} wurden über die Plattform Lentific gegen Zahlung der von der Plattform vorgesehenen Vermittlungsgebühr miteinander in Kontakt gebracht. Die Parteien haben vereinbart, außerhalb jeder gestückelten Finanzierung oder von der Plattform regulierten Vermittlung, den vorliegenden Darlehensvertrag über einen Betrag von {amount} unmittelbar untereinander abzuschließen. Lentific ist im Rahmen des vorliegenden Vertrags weder Darlehensgeber noch Darlehensnehmer noch Vermittler für kreditbasierte Schwarmfinanzierung: Ihre Rolle beschränkt sich darauf, die Parteien miteinander in Kontakt gebracht und das vorliegende Dokument erstellt zu haben.",
  dl_art1Title: "VERTRAGSGEGENSTAND",
  dl_art1Text:
    "Der vorliegende Vertrag legt die Bedingungen fest, unter denen der Darlehensgeber dem Darlehensnehmer unmittelbar ein verzinsliches Gelddarlehen gewährt, sowie die Modalitäten von dessen Rückzahlung.",
  dl_art2Title: "FINANZIELLE MERKMALE DES DARLEHENS",
  dl_art2RowLabels: ["Darlehensbetrag", "Laufzeit", "Jährlicher Zinssatz", "Monatsrate", "Gesamtkosten des Kredits"],
  dl_art3Title: "AUSZAHLUNG DER MITTEL",
  dl_art3Text:
    "Die Parteien vereinbaren untereinander frei die Modalitäten der Auszahlung der Mittel durch den Darlehensgeber an den Darlehensnehmer, wobei die Plattform an dieser Auszahlung in keiner Weise beteiligt ist.",
  dl_art4Title: "RÜCKZAHLUNG UND TILGUNGSPLAN",
  dl_art4Text:
    "Das Darlehen ist gemäß dem indikativen Tilgungsplan in Anlage 1 unmittelbar zwischen den Parteien zurückzuzahlen, ohne dass die Plattform eingeschaltet wird.",
  dl_art4Callout:
    "Ein Darlehen zwischen Privatpersonen kann je nach Eigenschaft der Parteien und dem betroffenen Betrag unter das französische Verbrauchergesetzbuch (Code de la consommation, Verbraucherkredit) fallen, mit spezifischen Pflichten (vorheriges Angebot, Widerrufsfrist): vor Unterzeichnung zu prüfen.",
  dl_art5Title: "VORZEITIGE RÜCKZAHLUNG",
  dl_art5Text:
    "Der Darlehensnehmer kann die noch geschuldeten Beträge jederzeit ganz oder teilweise vorzeitig zurückzahlen, sofern die Parteien nicht ausdrücklich etwas anderes vereinbart haben.",
  dl_art6Title: "ZAHLUNGSVERZUG",
  dl_art6Text:
    "Bei Nichtzahlung zum Fälligkeitstermin werden die ausstehenden Beträge von Rechts wegen ab dem Fälligkeitsdatum bis zur vollständigen Zahlung mit dem erhöhten gesetzlichen Zinssatz verzinst, unbeschadet des Artikels 1231-6 des französischen Zivilgesetzbuchs (Code civil).",
  dl_art7Title: "RISIKOHINWEIS",
  dl_art7Text: "Der Darlehensgeber bestätigt, über die mit einem direkten Darlehen an eine Privatperson verbundenen Risiken informiert und gewarnt worden zu sein, insbesondere über:",
  dl_art7Items: [
    "das Risiko eines vollständigen oder teilweisen Verlusts des verliehenen Kapitals im Falle eines Zahlungsausfalls des Darlehensnehmers;",
    "das Fehlen jeglicher Rückzahlungsgarantie durch Lentific, die im Rahmen des vorliegenden Vertrags weder Darlehensgeberin noch Bürgin noch Versicherin noch Vermittlerin für kreditbasierte Schwarmfinanzierung ist;",
    "das Risiko der Illiquidität der verliehenen Beträge vor dem vereinbarten Fälligkeitstermin;",
    "die Empfehlung, den vorliegenden Vertrag vor der Unterzeichnung von einem Rechtsberater prüfen zu lassen, da es sich bei diesem Dokument lediglich um ein Muster handelt.",
  ],
  dl_art8Title: "ROLLE VON LENTIFIC",
  dl_art8Text:
    "Lentific ist in keiner Weise Partei des vorliegenden Vertrags, garantiert weder das Kapital noch die Zinsen, und ihre Rolle beschränkt sich darauf, die Parteien miteinander in Kontakt gebracht zu haben. Was zwischen den Parteien ab der Unterzeichnung des vorliegenden Vertrags geschieht, findet außerhalb der Plattform statt und begründet keine Haftung von Lentific.",
  dl_art9Title: "PERSONENBEZOGENE DATEN",
  dl_art9Text:
    "Die im Rahmen der Vermittlung ausgetauschten personenbezogenen Daten wurden von Lentific gemäß der DSGVO verarbeitet; nach erfolgter Vermittlung tragen die Parteien allein die Verantwortung für die Verarbeitung der Daten der jeweils anderen Partei.",
  dl_art10Title: "ANWENDBARES RECHT UND ZUSTÄNDIGER GERICHTSSTAND",
  dl_art10Text:
    "Der vorliegende Vertrag unterliegt französischem Recht. Jeder Streitfall bezüglich seiner Gültigkeit, Auslegung oder Erfüllung unterliegt der ausschließlichen Zuständigkeit der örtlich zuständigen französischen Gerichte, vorbehaltlich der anwendbaren zwingenden Rechtsvorschriften.",
  dl_signBorrowerLabel: "Der Darlehensnehmer",
  dl_signLenderLabel: "Der Darlehensgeber",
  dl_annex1Title: "ANLAGE 1 - INDIKATIVER TILGUNGSPLAN",
  dl_annex1Subtitle: "Darlehen über {amount} · {duration} Monatsraten · fester Zinssatz {rate} % · Monatsrate {monthly}",
  dl_annex1Headers: ["Rate", "Datum", "Kapital", "Zinsen", "Monatsrate", "Restschuld"],
  dl_footerNote:
    "Dokument automatisch von der Plattform Lentific auf Grundlage der unter dem Aktenzeichen {reference} erfassten Vermittlung erstellt. Dieser Vertrag ist ein MUSTER: vor Unterzeichnung von einem Rechtsberater zu bestätigen, insbesondere hinsichtlich der etwaigen Einstufung als Verbraucherkredit (Artikel 4).",
};
