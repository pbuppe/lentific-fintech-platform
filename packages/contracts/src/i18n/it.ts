import type { ContractStrings } from "./types";

export const it: ContractStrings = {
  bannerLabel: "MODELLO: documento generato automaticamente, da far validare da un legale prima dell'uso effettivo",
  bannerRef: "Riferimento della pratica: {reference}, generato il {date}",
  articleWord: "ARTICOLO",
  calloutPrefix: "DA CONFERMARE DA PARTE DELLA CONSULENZA LEGALE",
  durationUnit: "mesi",
  signElectronic: "(firma elettronica)",
  noScoreAvailable: "Non disponibile",

  mp_pdfTitle: "Contratto di prestito - {reference}",
  mp_mainTitle: "CONTRATTO DI PRESTITO DI FINANZIAMENTO PARTECIPATIVO",
  mp_mainSubtitle: "Redatto in applicazione degli articoli L.548-1 e ss. e R.548-1 e ss. del Codice Monetario e Finanziario francese",
  mp_intermediaryHeading: "L'INTERMEDIARIO IN FINANZIAMENTO PARTECIPATIVO",
  mp_intermediaryText:
    "La società Lentific, [forma sociale da completare] con capitale di [importo] euro, [indirizzo della sede legale da completare], iscritta al RCS (registro delle imprese francese) di [città] con il numero [SIREN da confermare], iscritta presso l'ORIAS in qualità di intermediario in finanziamento partecipativo con il numero [numero ORIAS da confermare], di seguito «l'Intermediario» o «Lentific», agente in qualità di mandatario dei Mutuanti, senza essere essa stessa parte mutuante.",
  mp_borrowerHeading: "IL MUTUATARIO",
  mp_borrowerText: "{name} ({email}){cityPart}, agente a titolo professionale, di seguito «il Mutuatario».",
  mp_borrowerCityPart: ", domiciliato/a a {city}",
  mp_lendersHeading: "IL O I MUTUANTI",
  mp_lendersText:
    "Le persone fisiche o giuridiche la cui identità, i cui recapiti e la cui quota individualmente prestata figurano nell'Allegato 3 (Moduli di sottoscrizione), ciascun Mutuante agendo individualmente e senza vincolo di solidarietà tra loro, di seguito collettivamente i «Mutuanti».",
  mp_preambleHeading: "PREMESSA",
  mp_preambleText1:
    "Il Mutuatario ha presentato sulla piattaforma Lentific una richiesta di finanziamento di importo pari a {amount} destinata a un uso professionale. Tale pratica è stata oggetto di una verifica dell'identità, di un'analisi della capacità di rimborso da parte del motore di rischio della Piattaforma{riskPart}, quindi di una revisione da parte di un gestore autorizzato, al termine della quale è stata predisposta un'offerta accettata dal Mutuatario.",
  mp_preambleRiskPart: " (punteggio ottenuto: {score}/100)",
  mp_preambleText2:
    "Il presente contratto formalizza le condizioni di tale finanziamento, garantito da uno o più Mutuanti sul marketplace P2P della Piattaforma, alle condizioni di finanziamento frazionato descritte all'Articolo 5.",
  mp_art1Title: "DEFINIZIONI",
  mp_art1Items: [
    "«Piattaforma» indica il sito e l'applicazione gestiti da Lentific.",
    "«Finanziamento partecipativo tramite prestito» (crowdlending) indica l'operazione mediante la quale uno o più Mutuanti concedono un prestito remunerato al Mutuatario, conformemente agli articoli L.548-1 e seguenti del Codice Monetario e Finanziario francese.",
    "«TAEG» indica il tasso annuo effettivo globale.",
    "«Piano di Ammortamento» indica la tabella di ammortamento riportata nell'Allegato 1.",
  ],
  mp_art2Title: "DICHIARAZIONI E GARANZIE DELLE PARTI",
  mp_art2Sub1: "2.1 Dichiarazioni comuni",
  mp_art2Text1:
    "Ciascuna Parte dichiara di avere piena capacità giuridica di contrarre e di non trovarsi in stato di insolvenza alla data della firma.",
  mp_art2Sub2: "2.2 Dichiarazioni del Mutuatario",
  mp_art2Text2:
    "Il Mutuatario dichiara che le informazioni trasmesse nell'ambito della propria richiesta sono esatte, veritiere e aggiornate, e che non si è verificato alcun evento suscettibile di incidere sulla propria capacità di rimborso senza averne informato la Piattaforma.",
  mp_art2Sub3: "2.3 Dichiarazioni dei Mutuanti",
  mp_art2Text3:
    "Ciascun Mutuante dichiara di aver preso visione della scheda informativa sintetica (Allegato 2) e riconosce di essere stato informato e messo in guardia sui rischi descritti all'Articolo 10.",
  mp_art3Title: "OGGETTO DEL CONTRATTO",
  mp_art3Text:
    "Il presente contratto fissa le condizioni alle quali i Mutuanti concedono al Mutuatario, per il tramite della Piattaforma, un prestito di denaro remunerato, nonché le modalità del suo rimborso.",
  mp_art4Title: "CARATTERISTICHE FINANZIARIE DEL PRESTITO",
  mp_art4RowLabels: [
    "Importo totale del credito",
    "Durata",
    "Tasso debitore fisso applicabile (annuo)",
    "Rata mensile (assicurazione esclusa)",
    "Importo totale degli interessi",
    "Costo totale del credito",
  ],
  mp_art4TaegLabel: "TAEG",
  mp_art4TaegValue: "da calcolare a cura dell'Intermediario prima della diffusione",
  mp_art5Title: "MESSA A DISPOSIZIONE DEI FONDI E FINANZIAMENTO FRAZIONATO",
  mp_art5Text1:
    "I fondi sono raccolti sul marketplace P2P fino al raggiungimento dell'importo totale: ciascun Mutuante finanzia una quota, senza che alcun Mutuante sia tenuto oltre la propria quota né solidalmente responsabile con gli altri Mutuanti. Una volta raccolto l'importo, i fondi sono versati al Mutuatario mediante bonifico, previa deduzione, ove applicabile, delle spese di cui all'Articolo 8.",
  mp_art5Text2:
    "Se l'importo totale non viene raccolto entro il termine indicato sulla Piattaforma, il finanziamento si considera non concluso e le somme già versate sono restituite ai Mutuanti.",
  mp_art6Title: "AMMORTAMENTO E PIANO DI AMMORTAMENTO",
  mp_art6Text:
    "Il prestito è rimborsabile secondo un ammortamento costante, conformemente alla tabella riportata nell'Allegato 1. I rimborsi sono ridistribuiti dall'Intermediario a ciascun Mutuante in proporzione alla propria quota.",
  mp_art7Title: "RIMBORSO ANTICIPATO",
  mp_art7Text: "Il Mutuatario può in qualsiasi momento rimborsare anticipatamente, in tutto o in parte, le somme residue dovute.",
  mp_art7Callout: "è applicabile un'indennità di rimborso anticipato e, in tal caso, entro quale massimale regolamentare?",
  mp_art8Title: "SPESE DELL'INTERMEDIARIO",
  mp_art8Text:
    "L'Intermediario percepisce delle spese il cui principio e la cui tabella sono quelli definiti dal motore delle commissioni (Fee Engine) applicabile al prodotto interessato alla data di conclusione del presente contratto.",
  mp_art8Callout: "tabella precisa da allegare prima della diffusione.",
  mp_art9Title: "INADEMPIMENTO DI PAGAMENTO E INTERESSI DI MORA",
  mp_art9Text:
    "In caso di mancato pagamento alla scadenza, e senza necessità di previa costituzione in mora, le somme non pagate produrranno di diritto interessi al tasso legale in vigore maggiorato, a decorrere dalla data di esigibilità fino al pagamento integrale, fatto salvo quanto previsto dall'articolo 1231-6 del Codice Civile francese.",
  mp_art10Title: "AVVERTENZA SUI RISCHI",
  mp_art10Text:
    "Ciascun Mutuante è avvisato e messo in guardia, conformemente all'articolo L.548-6 del Codice Monetario e Finanziario francese, sul funzionamento del finanziamento partecipativo, e in particolare:",
  mp_art10Items: [
    "il rischio di perdita totale o parziale del capitale prestato in caso di inadempimento del Mutuatario;",
    "l'assenza di garanzia di rimborso da parte dell'Intermediario, che non è né mutuante, né garante, né assicuratore;",
    "il rischio di illiquidità delle somme prestate prima della scadenza convenuta;",
    "la necessità di diversificare i propri investimenti.",
  ],
  mp_art11Title: "ESIGIBILITÀ ANTICIPATA",
  mp_art11Text:
    "L'Intermediario, in nome e per conto dei Mutuanti, potrà avvalersi dell'esigibilità immediata del prestito, senza preavviso né formalità giudiziale preventiva, in particolare in caso di mancato pagamento non regolarizzato entro 15 giorni dalla costituzione in mora, di procedura concorsuale a carico del Mutuatario, di inesattezza di una dichiarazione o di manovra fraudolenta.",
  mp_art12Title: "GESTIONE DELL'INADEMPIMENTO DEL MUTUATARIO",
  mp_art12Text:
    "In caso di mancato pagamento, l'Intermediario notifica i Mutuanti e invia al Mutuatario un sollecito e, in mancanza di regolarizzazione entro 15 giorni, una costituzione in mora. In assenza di pagamento, l'Intermediario potrà avviare ogni azione di recupero, stragiudiziale o giudiziale, per conto dei Mutuanti che lo autorizzano a tal fine.",
  mp_art13Title: "DIRITTO DI RECESSO",
  mp_art13Callout:
    "l'esistenza e la durata di un diritto di recesso dipendono dallo status regolamentare preciso dell'Intermediario (IFP nazionale o PSFP ai sensi del Regolamento (UE) 2020/1503, ECSP) e dalla qualificazione del Mutuante. L'articolo R.548-6 impone di menzionare tale diritto e le sue modalità.",
  mp_art14Title: "RUOLO E RESPONSABILITÀ DELL'INTERMEDIARIO",
  mp_art14Text:
    "L'Intermediario agisce in qualità di mandatario dei Mutuanti. Esso non è in alcun caso parte mutuante, non garantisce né il capitale né gli interessi, e la sua responsabilità non potrà essere chiamata in causa per il solo fatto dell'inadempimento del Mutuatario, fatti salvi i suoi obblighi di corretta condotta ai sensi degli articoli L.548-1 e seguenti.",
  mp_art15Title: "DATI PERSONALI",
  mp_art15Text:
    "I dati personali delle Parti sono trattati dall'Intermediario, titolare del trattamento, conformemente al RGPD (GDPR) e alla Legge francese n. 78-17 del 6 gennaio 1978, modificata, ai soli fini dell'esecuzione del contratto e del rispetto degli obblighi legali applicabili.",
  mp_art16Title: "LEGGE APPLICABILE E FORO COMPETENTE",
  mp_art16Text:
    "Il presente contratto è disciplinato dal diritto francese. Ogni controversia relativa alla sua validità, alla sua interpretazione o alla sua esecuzione sarà sottoposta alla competenza esclusiva dei tribunali francesi territorialmente competenti, fatte salve le norme di ordine pubblico applicabili.",
  mp_signBorrowerLabel: "Il Mutuatario",
  mp_signIntermediaryLabel: "Per l'Intermediario, Lentific",
  mp_annex1Title: "ALLEGATO 1 - PIANO DI AMMORTAMENTO DEL RIMBORSO",
  mp_annex1Subtitle: "Prestito di {amount} · {duration} rate mensili · tasso fisso {rate} % · rata mensile {monthly}",
  mp_annex1Headers: ["Rata", "Data", "Capitale", "Interessi", "Rata mensile", "Debito residuo"],
  mp_annex2Title: "ALLEGATO 2 - SCHEDA INFORMATIVA SINTETICA",
  mp_annex2RowLabels: [
    "Mutuatario",
    "Importo preso in prestito",
    "Durata",
    "Tasso debitore fisso",
    "Rata mensile",
    "Costo totale del credito",
    "Punteggio di rischio interno",
    "Rischio principale per il Mutuante",
  ],
  mp_annex2MainRiskText: "Perdita parziale o totale del capitale prestato (Articolo 10)",
  mp_annex3Title: "ALLEGATO 3 - MODULO DI SOTTOSCRIZIONE (MODELLO)",
  mp_annex3Text:
    "Il sottoscritto/La sottoscritta [Nome del Mutuante], dichiara di sottoscrivere il finanziamento del Mutuatario indicato nel presente atto per un importo di [importo] EUR, e riconosce di aver preso visione e accettato senza riserve l'integralità delle disposizioni del presente contratto contraddistinto dal riferimento {reference}, in particolare l'avvertenza sui rischi riportata all'Articolo 10.",
  mp_footerNote:
    "Documento generato automaticamente dalla piattaforma Lentific a partire dalla pratica {reference}. Le indicazioni contrassegnate «da confermare» devono essere completate con i dati di registrazione reali della società e sottoposte alla valutazione di un avvocato prima di qualsiasi messa in produzione. Struttura redatta con riferimento agli articoli L.548-1 e ss. e R.548-1 e ss. (in particolare R.548-6) del Codice Monetario e Finanziario francese.",

  dl_pdfTitle: "Contratto di prestito diretto - {reference}",
  dl_mainTitle: "CONTRATTO DI PRESTITO TRA PRIVATI",
  dl_mainSubtitle: "Prestito diretto concluso tra le parti a seguito di una messa in contatto tramite la piattaforma Lentific",
  dl_borrowerHeading: "IL MUTUATARIO",
  dl_borrowerText: "{name} ({email}){cityPart}, di seguito «il Mutuatario».",
  dl_borrowerCityPart: ", domiciliato/a a {city}",
  dl_lenderHeading: "IL MUTUANTE",
  dl_lenderText: "{name} ({email}), di seguito «il Mutuante».",
  dl_preambleHeading: "PREMESSA",
  dl_preambleText:
    "{borrowerName} e {lenderName} sono stati messi in contatto tramite la piattaforma Lentific, dietro pagamento delle spese di messa in contatto previste dalla Piattaforma. Le Parti hanno convenuto, al di fuori di qualsiasi finanziamento frazionato o intermediazione regolamentata dalla Piattaforma, di concludere direttamente tra loro il presente contratto di prestito di importo pari a {amount}. Lentific non è né mutuante, né mutuatario, né intermediario in finanziamento partecipativo ai fini del presente contratto: il suo ruolo si limita ad aver messo in contatto le Parti e alla generazione del presente documento.",
  dl_art1Title: "OGGETTO DEL CONTRATTO",
  dl_art1Text:
    "Il presente contratto fissa le condizioni alle quali il Mutuante concede al Mutuatario, direttamente, un prestito di denaro remunerato, nonché le modalità del suo rimborso.",
  dl_art2Title: "CARATTERISTICHE FINANZIARIE DEL PRESTITO",
  dl_art2RowLabels: ["Importo del prestito", "Durata", "Tasso di interesse annuo", "Rata mensile", "Costo totale del credito"],
  dl_art3Title: "VERSAMENTO DEI FONDI",
  dl_art3Text:
    "Le Parti concordano liberamente tra loro le modalità di versamento dei fondi dal Mutuante al Mutuatario, non intervenendo la Piattaforma a nessun titolo in tale versamento.",
  dl_art4Title: "RIMBORSO E PIANO DI AMMORTAMENTO",
  dl_art4Text:
    "Il prestito è rimborsabile secondo il piano di ammortamento indicativo riportato nell'Allegato 1, direttamente tra le Parti, senza passare per la Piattaforma.",
  dl_art4Callout:
    "un prestito tra privati può rientrare nell'ambito del Codice del Consumo francese (credito al consumo) a seconda della qualità delle Parti e dell'importo in gioco, con obblighi specifici (offerta preliminare, termine di recesso): da verificare prima della firma.",
  dl_art5Title: "RIMBORSO ANTICIPATO",
  dl_art5Text:
    "Il Mutuatario può in qualsiasi momento rimborsare anticipatamente, in tutto o in parte, le somme residue dovute, salvo diversa pattuizione espressamente concordata tra le Parti.",
  dl_art6Title: "INADEMPIMENTO DI PAGAMENTO",
  dl_art6Text:
    "In caso di mancato pagamento alla scadenza, le somme non pagate produrranno di diritto interessi al tasso legale in vigore maggiorato, a decorrere dalla data di esigibilità fino al pagamento integrale, fatto salvo quanto previsto dall'articolo 1231-6 del Codice Civile francese.",
  dl_art7Title: "AVVERTENZA SUI RISCHI",
  dl_art7Text: "Il Mutuante riconosce di essere stato informato e messo in guardia sui rischi inerenti a un prestito diretto a un privato, e in particolare:",
  dl_art7Items: [
    "il rischio di perdita totale o parziale del capitale prestato in caso di inadempimento del Mutuatario;",
    "l'assenza di qualsiasi garanzia di rimborso da parte di Lentific, che non è né mutuante, né garante, né assicuratore, né intermediario in finanziamento partecipativo ai fini del presente contratto;",
    "il rischio di illiquidità delle somme prestate prima della scadenza convenuta;",
    "l'opportunità di far verificare il presente contratto da un professionista del diritto prima della firma, essendo questo documento solo un modello.",
  ],
  dl_art8Title: "RUOLO DI LENTIFIC",
  dl_art8Text:
    "Lentific non è parte a nessun titolo del presente contratto, non garantisce né il capitale né gli interessi, e il suo ruolo si limita ad aver messo in contatto le Parti. Quanto avviene tra le Parti a decorrere dalla firma del presente contratto ha luogo al di fuori della Piattaforma e non coinvolge la responsabilità di Lentific.",
  dl_art9Title: "DATI PERSONALI",
  dl_art9Text:
    "I dati personali scambiati nell'ambito della messa in contatto sono stati trattati da Lentific conformemente al RGPD (GDPR); le Parti restano le sole responsabili del trattamento che effettuano dei dati dell'altra Parte una volta messe in contatto.",
  dl_art10Title: "LEGGE APPLICABILE E FORO COMPETENTE",
  dl_art10Text:
    "Il presente contratto è disciplinato dal diritto francese. Ogni controversia relativa alla sua validità, alla sua interpretazione o alla sua esecuzione sarà sottoposta alla competenza esclusiva dei tribunali francesi territorialmente competenti, fatte salve le norme di ordine pubblico applicabili.",
  dl_signBorrowerLabel: "Il Mutuatario",
  dl_signLenderLabel: "Il Mutuante",
  dl_annex1Title: "ALLEGATO 1 - PIANO DI AMMORTAMENTO INDICATIVO DEL RIMBORSO",
  dl_annex1Subtitle: "Prestito di {amount} · {duration} rate mensili · tasso fisso {rate} % · rata mensile {monthly}",
  dl_annex1Headers: ["Rata", "Data", "Capitale", "Interessi", "Rata mensile", "Debito residuo"],
  dl_footerNote:
    "Documento generato automaticamente dalla piattaforma Lentific a partire dalla messa in contatto contraddistinta dal riferimento {reference}. Il presente contratto è un MODELLO: da far validare da un professionista del diritto prima della firma, in particolare riguardo all'eventuale qualificazione come credito al consumo (Articolo 4).",
};
