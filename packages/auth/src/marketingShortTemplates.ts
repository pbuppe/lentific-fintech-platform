/**
 * Modèles courts et percutants (demande produit 2026-11-16) pour les personnes
 * qui nous ont laissé leur adresse : une accroche forte, deux ou trois phrases,
 * un seul bouton vers le site. Aucune promesse de financement ni de taux :
 * le message donne envie de visiter, la plateforme fait le reste.
 */
import type { MarketingTemplateText } from "./marketing";

export const SHORT_TEMPLATE_KEYS = ["s_bank", "s_minutes", "s_monthly", "s_works", "s_invest", "s_waiting", "s_question", "s_how"] as const;
export type ShortTemplateKey = (typeof SHORT_TEMPLATE_KEYS)[number];

export const SHORT_TEMPLATE_PATHS: Record<ShortTemplateKey, string> = {
  s_bank: "/#contact",
  s_minutes: "/simulateur",
  s_monthly: "/#contact",
  s_works: "/#contact",
  s_invest: "/marketplace",
  s_waiting: "/#contact",
  s_question: "/#contact",
  s_how: "/#comment-ca-marche",
};

type L = "fr" | "en" | "es" | "it" | "hu" | "pt" | "de" | "nl";

export const SHORT_TEMPLATES: Record<ShortTemplateKey, Record<L, MarketingTemplateText>> = {
  s_bank: {
    fr: { subject: "Votre banque a dit non ? Ce n'est peut-être pas le dernier mot.", body: "Un refus bancaire ne veut pas dire que votre projet n'est pas finançable.\n\nSur Lentific, votre dossier est étudié gratuitement par notre équipe, puis présenté à des investisseurs. Deux minutes suffisent pour commencer.", ctaLabel: "Faire étudier mon projet" },
    en: { subject: "Your bank said no? It may not be the final word.", body: "A bank refusal doesn't mean your project can't be financed.\n\nOn Lentific, our team reviews your application free of charge, then presents it to investors. Two minutes are enough to get started.", ctaLabel: "Get my project reviewed" },
    es: { subject: "¿Su banco le dijo que no? Quizá no sea la última palabra.", body: "Una negativa del banco no significa que su proyecto no se pueda financiar.\n\nEn Lentific, nuestro equipo estudia su expediente gratis y lo presenta a inversores. Bastan dos minutos para empezar.", ctaLabel: "Que estudien mi proyecto" },
    it: { subject: "La sua banca ha detto no? Forse non è l'ultima parola.", body: "Un rifiuto della banca non significa che il suo progetto non sia finanziabile.\n\nSu Lentific il nostro team analizza gratuitamente la sua pratica e la presenta agli investitori. Bastano due minuti per iniziare.", ctaLabel: "Far analizzare il mio progetto" },
    hu: { subject: "A bank nemet mondott? Lehet, hogy nem ez az utolsó szó.", body: "Egy banki elutasítás nem jelenti azt, hogy a projektje nem finanszírozható.\n\nA Lentificen csapatunk ingyenesen megvizsgálja kérelmét, majd befektetők elé tárja. Két perc elég az induláshoz.", ctaLabel: "Projektem elemzését kérem" },
    pt: { subject: "O seu banco disse que não? Pode não ser a última palavra.", body: "Uma recusa do banco não quer dizer que o seu projeto não seja financiável.\n\nNa Lentific, a nossa equipa analisa gratuitamente o seu processo e apresenta-o a investidores. Bastam dois minutos para começar.", ctaLabel: "Analisar o meu projeto" },
    de: { subject: "Ihre Bank hat Nein gesagt? Das muss nicht das letzte Wort sein.", body: "Eine Absage der Bank heißt nicht, dass Ihr Projekt nicht finanzierbar ist.\n\nBei Lentific prüft unser Team Ihre Unterlagen kostenlos und stellt sie Investoren vor. Zwei Minuten genügen für den Start.", ctaLabel: "Projekt prüfen lassen" },
    nl: { subject: "Zei uw bank nee? Dat is misschien niet het laatste woord.", body: "Een weigering van de bank betekent niet dat uw project niet te financieren is.\n\nBij Lentific beoordeelt ons team uw dossier gratis en legt het voor aan investeerders. Twee minuten volstaan om te beginnen.", ctaLabel: "Mijn project laten beoordelen" },
  },
  s_minutes: {
    fr: { subject: "2 minutes. C'est le temps qu'il faut pour savoir.", body: "Combien pourriez-vous emprunter, et sur quelle durée ?\n\nNotre simulateur vous donne une première estimation, gratuitement et sans inscription.", ctaLabel: "Lancer ma simulation" },
    en: { subject: "2 minutes. That's all it takes to find out.", body: "How much could you borrow, and over what period?\n\nOur simulator gives you a first estimate, free of charge and without signing up.", ctaLabel: "Start my simulation" },
    es: { subject: "2 minutos. Es lo que se tarda en saberlo.", body: "¿Cuánto podría pedir prestado y a qué plazo?\n\nNuestro simulador le da una primera estimación, gratis y sin registro.", ctaLabel: "Iniciar mi simulación" },
    it: { subject: "2 minuti. È il tempo che serve per saperlo.", body: "Quanto potrebbe prendere in prestito, e in quanto tempo?\n\nIl nostro simulatore le fornisce una prima stima, gratis e senza registrazione.", ctaLabel: "Avviare la simulazione" },
    hu: { subject: "2 perc. Ennyi kell, hogy megtudja.", body: "Mennyi hitelt vehetne fel, és milyen futamidőre?\n\nKalkulátorunk ingyenes első becslést ad, regisztráció nélkül.", ctaLabel: "Kalkuláció indítása" },
    pt: { subject: "2 minutos. É o tempo que precisa para saber.", body: "Quanto poderia pedir emprestado, e por quanto tempo?\n\nO nosso simulador dá-lhe uma primeira estimativa, gratuitamente e sem registo.", ctaLabel: "Iniciar a simulação" },
    de: { subject: "2 Minuten. So lange dauert es, Bescheid zu wissen.", body: "Wie viel könnten Sie leihen, und über welche Laufzeit?\n\nUnser Rechner liefert Ihnen eine erste Schätzung – kostenlos und ohne Anmeldung.", ctaLabel: "Berechnung starten" },
    nl: { subject: "2 minuten. Meer is niet nodig om het te weten.", body: "Hoeveel zou u kunnen lenen, en over welke looptijd?\n\nOnze simulator geeft u een eerste schatting, gratis en zonder registratie.", ctaLabel: "Simulatie starten" },
  },
  s_monthly: {
    fr: { subject: "Trop de mensualités chaque mois ?", body: "Regrouper ses crédits peut alléger le budget mensuel (en contrepartie, la durée et le coût total peuvent augmenter).\n\nNotre équipe étudie votre situation gratuitement et sans engagement.", ctaLabel: "Étudier ma situation" },
    en: { subject: "Too many monthly repayments?", body: "Consolidating your loans can lighten your monthly budget (in return, the term and total cost may increase).\n\nOur team reviews your situation free of charge and with no obligation.", ctaLabel: "Review my situation" },
    es: { subject: "¿Demasiadas cuotas cada mes?", body: "Agrupar sus créditos puede aliviar el presupuesto mensual (a cambio, el plazo y el coste total pueden aumentar).\n\nNuestro equipo estudia su situación gratis y sin compromiso.", ctaLabel: "Estudiar mi situación" },
    it: { subject: "Troppe rate ogni mese?", body: "Consolidare i propri crediti può alleggerire il budget mensile (in cambio, la durata e il costo totale possono aumentare).\n\nIl nostro team analizza la sua situazione gratis e senza impegno.", ctaLabel: "Analizzare la mia situazione" },
    hu: { subject: "Túl sok törlesztőrészlet havonta?", body: "A hitelek összevonása csökkentheti a havi terhet (cserébe a futamidő és a teljes költség nőhet).\n\nCsapatunk ingyenesen és kötelezettség nélkül megvizsgálja helyzetét.", ctaLabel: "Helyzetem elemzése" },
    pt: { subject: "Demasiadas prestações todos os meses?", body: "Consolidar os seus créditos pode aliviar o orçamento mensal (em contrapartida, o prazo e o custo total podem aumentar).\n\nA nossa equipa analisa a sua situação gratuitamente e sem compromisso.", ctaLabel: "Analisar a minha situação" },
    de: { subject: "Zu viele Monatsraten?", body: "Eine Umschuldung kann das monatliche Budget entlasten (im Gegenzug können Laufzeit und Gesamtkosten steigen).\n\nUnser Team prüft Ihre Situation kostenlos und unverbindlich.", ctaLabel: "Situation prüfen lassen" },
    nl: { subject: "Te veel maandlasten?", body: "Het samenvoegen van leningen kan uw maandbudget verlichten (de looptijd en de totale kosten kunnen daardoor wel stijgen).\n\nOns team bekijkt uw situatie gratis en vrijblijvend.", ctaLabel: "Mijn situatie laten bekijken" },
  },
  s_works: {
    fr: { subject: "Vos travaux ne devraient pas attendre.", body: "Rénovation, agrandissement, économies d'énergie : présentez votre projet en quelques lignes.\n\nNous étudions gratuitement les solutions de financement possibles.", ctaLabel: "Présenter mon projet" },
    en: { subject: "Your renovation shouldn't have to wait.", body: "Renovation, extension, energy savings: describe your project in a few lines.\n\nWe review the possible financing solutions free of charge.", ctaLabel: "Present my project" },
    es: { subject: "Sus obras no deberían esperar.", body: "Reforma, ampliación, ahorro energético: presente su proyecto en unas líneas.\n\nEstudiamos gratis las posibles soluciones de financiación.", ctaLabel: "Presentar mi proyecto" },
    it: { subject: "I suoi lavori non dovrebbero aspettare.", body: "Ristrutturazione, ampliamento, risparmio energetico: presenti il suo progetto in poche righe.\n\nAnalizziamo gratuitamente le possibili soluzioni di finanziamento.", ctaLabel: "Presentare il mio progetto" },
    hu: { subject: "A felújítás ne várjon tovább.", body: "Felújítás, bővítés, energiatakarékosság: írja le projektjét néhány sorban.\n\nIngyenesen megvizsgáljuk a lehetséges finanszírozási megoldásokat.", ctaLabel: "Projektem bemutatása" },
    pt: { subject: "As suas obras não deviam esperar.", body: "Renovação, ampliação, poupança de energia: apresente o seu projeto em poucas linhas.\n\nAnalisamos gratuitamente as soluções de financiamento possíveis.", ctaLabel: "Apresentar o meu projeto" },
    de: { subject: "Ihre Renovierung sollte nicht warten.", body: "Renovierung, Anbau, Energiesparen: Beschreiben Sie Ihr Projekt in wenigen Zeilen.\n\nWir prüfen kostenlos die möglichen Finanzierungslösungen.", ctaLabel: "Projekt vorstellen" },
    nl: { subject: "Uw verbouwing hoeft niet te wachten.", body: "Renovatie, uitbreiding, energiebesparing: beschrijf uw project in een paar regels.\n\nWij bekijken gratis de mogelijke financieringsoplossingen.", ctaLabel: "Mijn project voorstellen" },
  },
  s_invest: {
    fr: { subject: "Et si votre épargne finançait de vrais projets ?", body: "Sur Lentific, vous choisissez vous-même les projets que vous financez, après étude de chaque dossier par notre équipe.\n\nInvestir comporte un risque de perte en capital.", ctaLabel: "Découvrir les projets" },
    en: { subject: "What if your savings financed real projects?", body: "On Lentific, you choose the projects you finance yourself, after our team has reviewed each application.\n\nInvesting involves a risk of capital loss.", ctaLabel: "Discover the projects" },
    es: { subject: "¿Y si sus ahorros financiaran proyectos reales?", body: "En Lentific, usted elige los proyectos que financia, tras el estudio de cada expediente por nuestro equipo.\n\nInvertir conlleva un riesgo de pérdida de capital.", ctaLabel: "Descubrir los proyectos" },
    it: { subject: "E se i suoi risparmi finanziassero progetti reali?", body: "Su Lentific sceglie lei i progetti da finanziare, dopo l'analisi di ogni pratica da parte del nostro team.\n\nInvestire comporta un rischio di perdita del capitale.", ctaLabel: "Scoprire i progetti" },
    hu: { subject: "Mi lenne, ha megtakarítása valódi projekteket finanszírozna?", body: "A Lentificen Ön választja ki, mely projekteket finanszírozza, miután csapatunk minden kérelmet megvizsgált.\n\nA befektetés tőkevesztési kockázattal jár.", ctaLabel: "A projektek megismerése" },
    pt: { subject: "E se as suas poupanças financiassem projetos reais?", body: "Na Lentific, é o próprio que escolhe os projetos que financia, após a análise de cada processo pela nossa equipa.\n\nInvestir comporta um risco de perda de capital.", ctaLabel: "Descobrir os projetos" },
    de: { subject: "Was, wenn Ihr Erspartes echte Projekte finanziert?", body: "Bei Lentific wählen Sie selbst die Projekte, die Sie finanzieren – nachdem unser Team jede Akte geprüft hat.\n\nEine Geldanlage birgt das Risiko eines Kapitalverlusts.", ctaLabel: "Projekte entdecken" },
    nl: { subject: "Wat als uw spaargeld echte projecten financierde?", body: "Bij Lentific kiest u zelf de projecten die u financiert, nadat ons team elk dossier heeft beoordeeld.\n\nBeleggen brengt een risico op kapitaalverlies met zich mee.", ctaLabel: "Projecten ontdekken" },
  },
  s_waiting: {
    fr: { subject: "Votre étude gratuite vous attend.", body: "Vous nous avez laissé votre adresse : il ne reste qu'une étape pour faire étudier votre projet.\n\nC'est gratuit, sans engagement, et cela prend deux minutes.", ctaLabel: "Faire ma demande" },
    en: { subject: "Your free review is waiting for you.", body: "You left us your address: there is just one step left to get your project reviewed.\n\nIt's free, with no obligation, and takes two minutes.", ctaLabel: "Make my request" },
    es: { subject: "Su estudio gratuito le espera.", body: "Nos dejó su dirección: solo falta un paso para que estudiemos su proyecto.\n\nEs gratis, sin compromiso y lleva dos minutos.", ctaLabel: "Hacer mi solicitud" },
    it: { subject: "La sua analisi gratuita la aspetta.", body: "Ci ha lasciato il suo indirizzo: manca un solo passo per far analizzare il suo progetto.\n\nÈ gratis, senza impegno e richiede due minuti.", ctaLabel: "Inviare la richiesta" },
    hu: { subject: "Ingyenes elemzése már várja.", body: "Megadta nekünk e-mail-címét: már csak egy lépés, hogy megvizsgáljuk projektjét.\n\nIngyenes, kötelezettség nélküli, és két percet vesz igénybe.", ctaLabel: "Kérelem beadása" },
    pt: { subject: "O seu estudo gratuito está à sua espera.", body: "Deixou-nos o seu endereço: falta apenas um passo para analisarmos o seu projeto.\n\nÉ gratuito, sem compromisso, e demora dois minutos.", ctaLabel: "Fazer o meu pedido" },
    de: { subject: "Ihre kostenlose Prüfung wartet auf Sie.", body: "Sie haben uns Ihre Adresse hinterlassen: Nur noch ein Schritt, und wir prüfen Ihr Projekt.\n\nKostenlos, unverbindlich und in zwei Minuten erledigt.", ctaLabel: "Anfrage stellen" },
    nl: { subject: "Uw gratis analyse wacht op u.", body: "U liet ons uw adres achter: nog één stap en wij bekijken uw project.\n\nGratis, vrijblijvend en in twee minuten geregeld.", ctaLabel: "Mijn aanvraag doen" },
  },
  s_question: {
    fr: { subject: "Une seule question : quel est votre projet ?", body: "Acheter, rénover, regrouper vos crédits ou investir ?\n\nDites-le-nous en quelques mots : un conseiller vous répond rapidement.", ctaLabel: "Répondre en 1 minute" },
    en: { subject: "Just one question: what's your project?", body: "Buying, renovating, consolidating your loans or investing?\n\nTell us in a few words: an advisor will get back to you quickly.", ctaLabel: "Answer in 1 minute" },
    es: { subject: "Una sola pregunta: ¿cuál es su proyecto?", body: "¿Comprar, reformar, agrupar sus créditos o invertir?\n\nCuéntenoslo en pocas palabras: un asesor le responderá rápidamente.", ctaLabel: "Responder en 1 minuto" },
    it: { subject: "Una sola domanda: qual è il suo progetto?", body: "Acquistare, ristrutturare, consolidare i crediti o investire?\n\nCe lo dica in poche parole: un consulente le risponderà rapidamente.", ctaLabel: "Rispondere in 1 minuto" },
    hu: { subject: "Csak egy kérdés: mi a terve?", body: "Vásárlás, felújítás, hitelkiváltás vagy befektetés?\n\nÍrja meg pár szóban: egy tanácsadó hamarosan válaszol.", ctaLabel: "Válasz 1 perc alatt" },
    pt: { subject: "Só uma pergunta: qual é o seu projeto?", body: "Comprar, renovar, consolidar créditos ou investir?\n\nDiga-nos em poucas palavras: um consultor responde-lhe rapidamente.", ctaLabel: "Responder em 1 minuto" },
    de: { subject: "Nur eine Frage: Was ist Ihr Projekt?", body: "Kaufen, renovieren, Kredite bündeln oder investieren?\n\nSagen Sie es uns in wenigen Worten: Ein Berater meldet sich zeitnah bei Ihnen.", ctaLabel: "In 1 Minute antworten" },
    nl: { subject: "Eén vraag maar: wat is uw project?", body: "Kopen, verbouwen, leningen samenvoegen of investeren?\n\nVertel het ons in een paar woorden: een adviseur antwoordt u snel.", ctaLabel: "Antwoorden in 1 minuut" },
  },
  s_how: {
    fr: { subject: "Le financement autrement : simple, humain, transparent.", body: "Lentific relie emprunteurs et investisseurs, avec une équipe qui étudie chaque dossier.\n\nDécouvrez comment cela fonctionne, en trois étapes.", ctaLabel: "Voir comment ça marche" },
    en: { subject: "Financing, done differently: simple, human, transparent.", body: "Lentific connects borrowers and investors, with a team that reviews every application.\n\nSee how it works, in three steps.", ctaLabel: "See how it works" },
    es: { subject: "Financiarse de otra manera: sencillo, humano, transparente.", body: "Lentific conecta a prestatarios e inversores, con un equipo que estudia cada expediente.\n\nDescubra cómo funciona, en tres pasos.", ctaLabel: "Ver cómo funciona" },
    it: { subject: "Il finanziamento in un altro modo: semplice, umano, trasparente.", body: "Lentific mette in contatto richiedenti e investitori, con un team che analizza ogni pratica.\n\nScopra come funziona, in tre passaggi.", ctaLabel: "Vedere come funziona" },
    hu: { subject: "Finanszírozás másképp: egyszerűen, emberien, átláthatóan.", body: "A Lentific összeköti a hitelfelvevőket és a befektetőket, egy csapattal, amely minden kérelmet megvizsgál.\n\nNézze meg, hogyan működik, három lépésben.", ctaLabel: "Így működik" },
    pt: { subject: "O financiamento de outra forma: simples, humano, transparente.", body: "A Lentific liga mutuários e investidores, com uma equipa que analisa cada processo.\n\nDescubra como funciona, em três etapas.", ctaLabel: "Ver como funciona" },
    de: { subject: "Finanzierung neu gedacht: einfach, menschlich, transparent.", body: "Lentific verbindet Kreditnehmer und Investoren – mit einem Team, das jede Akte prüft.\n\nSehen Sie, wie es funktioniert, in drei Schritten.", ctaLabel: "So funktioniert es" },
    nl: { subject: "Financieren op een andere manier: eenvoudig, menselijk, transparant.", body: "Lentific verbindt kredietnemers en investeerders, met een team dat elk dossier beoordeelt.\n\nOntdek hoe het werkt, in drie stappen.", ctaLabel: "Bekijk hoe het werkt" },
  },
};
