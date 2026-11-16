/**
 * E-mailing marketing (demande produit 2026-11-15).
 *
 * Depuis le back-office (admin / super admin) : une liste de contacts de
 * prospection, des modèles de textes prêts à l'emploi (6 formats × 8 langues)
 * et des campagnes envoyées par lots via Resend.
 *
 * Garde-fous intégrés :
 *  - chaque contact est ajouté avec sa base légale (consentement, adresse
 *    professionnelle, client existant) : on ne prospecte pas « à froid » des
 *    particuliers ;
 *  - chaque e-mail porte un lien de désinscription en un clic (et les en-têtes
 *    List-Unsubscribe reconnus par Gmail / Outlook) ; un contact désinscrit ne
 *    reçoit plus rien ;
 *  - une campagne ne part jamais deux fois vers le même contact ;
 *  - plafond quotidien (MARKETING_DAILY_LIMIT, 80 par défaut) pour rester sous
 *    le quota de l'offre gratuite de Resend (100/jour, e-mails de compte
 *    compris).
 */
import { randomBytes } from "node:crypto";
import { prisma } from "@fintech/database";
import { sendEmail, layout, escapeHtml, companyFooter, webBaseUrl, webUrlInLocale, contactInbox } from "./mailer";
import { SHORT_TEMPLATES, SHORT_TEMPLATE_KEYS, SHORT_TEMPLATE_PATHS } from "./marketingShortTemplates";

export const MARKETING_LOCALES = ["fr", "en", "es", "it", "hu", "pt", "de", "nl"] as const;
export type MarketingLocale = (typeof MARKETING_LOCALES)[number];

const CLASSIC_TEMPLATE_KEYS = ["discover", "borrowers", "investors", "followup", "premium", "partners"] as const;
/** Modèles courts et percutants d'abord (2026-11-16), puis les modèles classiques. */
export const MARKETING_TEMPLATE_KEYS = [...SHORT_TEMPLATE_KEYS, ...CLASSIC_TEMPLATE_KEYS] as const;
export const MARKETING_SHORT_TEMPLATE_KEYS: readonly string[] = SHORT_TEMPLATE_KEYS;
export type MarketingTemplateKey = (typeof MARKETING_TEMPLATE_KEYS)[number];

export interface MarketingTemplateText {
  subject: string;
  body: string; // paragraphes séparés par une ligne vide
  ctaLabel: string;
}

/** Page du site ouverte par le bouton de chaque modèle. */
export const MARKETING_TEMPLATE_PATHS: Record<MarketingTemplateKey, string> = {
  ...SHORT_TEMPLATE_PATHS,
  discover: "/",
  borrowers: "/#contact",
  investors: "/marketplace",
  followup: "/",
  premium: "/login",
  partners: "/#contact",
};

export function isMarketingLocale(v: string | null | undefined): v is MarketingLocale {
  return !!v && (MARKETING_LOCALES as readonly string[]).includes(v);
}

// ---------------------------------------------------------------------------
// Textes communs (salutation, signature, pied de page)
// ---------------------------------------------------------------------------

interface CommonTexts {
  hello: (name: string) => string;
  helloNoName: string;
  signature: string;
  why: string;
  reply: string;
  unsubscribe: string;
}

const COMMON: Record<MarketingLocale, CommonTexts> = {
  fr: { hello: (n) => `Bonjour ${n},`, helloNoName: "Bonjour,", signature: "L'équipe Lentific", why: "Vous recevez cet e-mail car votre adresse figure dans la liste de contacts de Lentific.", reply: "Une question ? Répondez simplement à cet e-mail.", unsubscribe: "Ne plus recevoir nos e-mails" },
  en: { hello: (n) => `Hello ${n},`, helloNoName: "Hello,", signature: "The Lentific team", why: "You are receiving this e-mail because your address is on Lentific's contact list.", reply: "Any questions? Simply reply to this e-mail.", unsubscribe: "Unsubscribe from our e-mails" },
  es: { hello: (n) => `Hola ${n}:`, helloNoName: "Hola:", signature: "El equipo de Lentific", why: "Recibe este correo porque su dirección figura en la lista de contactos de Lentific.", reply: "¿Alguna pregunta? Basta con responder a este correo.", unsubscribe: "No recibir más nuestros correos" },
  it: { hello: (n) => `Gentile ${n},`, helloNoName: "Buongiorno,", signature: "Il team Lentific", why: "Riceve questa e-mail perché il suo indirizzo è presente nell'elenco contatti di Lentific.", reply: "Ha domande? Risponda semplicemente a questa e-mail.", unsubscribe: "Non ricevere più le nostre e-mail" },
  hu: { hello: (n) => `Kedves ${n}!`, helloNoName: "Tisztelt Hölgyem/Uram!", signature: "A Lentific csapata", why: "Azért kapja ezt az e-mailt, mert címe szerepel a Lentific kapcsolati listáján.", reply: "Kérdése van? Egyszerűen válaszoljon erre az e-mailre.", unsubscribe: "Leiratkozás e-mailjeinkről" },
  pt: { hello: (n) => `Olá ${n},`, helloNoName: "Olá,", signature: "A equipa Lentific", why: "Recebe este e-mail porque o seu endereço consta da lista de contactos da Lentific.", reply: "Tem alguma questão? Basta responder a este e-mail.", unsubscribe: "Deixar de receber os nossos e-mails" },
  de: { hello: (n) => `Guten Tag ${n},`, helloNoName: "Guten Tag,", signature: "Ihr Lentific-Team", why: "Sie erhalten diese E-Mail, weil Ihre Adresse in der Kontaktliste von Lentific steht.", reply: "Fragen? Antworten Sie einfach auf diese E-Mail.", unsubscribe: "Keine E-Mails mehr erhalten" },
  nl: { hello: (n) => `Beste ${n},`, helloNoName: "Geachte heer/mevrouw,", signature: "Het Lentific-team", why: "U ontvangt deze e-mail omdat uw adres in de contactlijst van Lentific staat.", reply: "Vragen? Beantwoord gewoon deze e-mail.", unsubscribe: "Geen e-mails meer ontvangen" },
};

// ---------------------------------------------------------------------------
// Modèles prêts à l'emploi : 6 formats, dans les 8 langues du site
// ---------------------------------------------------------------------------

const CLASSIC_TEMPLATES: Record<(typeof CLASSIC_TEMPLATE_KEYS)[number], Record<MarketingLocale, MarketingTemplateText>> = {
  // 1. Invitation générale à découvrir la plateforme
  discover: {
    fr: {
      subject: "Découvrez Lentific, la plateforme qui simplifie votre financement",
      body: "Nous avons le plaisir de vous présenter Lentific, une plateforme en ligne qui met en relation emprunteurs et investisseurs, avec un accompagnement humain à chaque étape.\n\nQue vous ayez un projet immobilier, des travaux à financer ou des crédits à regrouper, ou que vous cherchiez à investir, Lentific vous permet d'avancer simplement, depuis votre espace personnel.\n\nL'inscription est gratuite et ne prend que quelques minutes. Nous serions ravis de vous compter parmi nos membres.",
      ctaLabel: "Découvrir la plateforme",
    },
    en: {
      subject: "Discover Lentific, the platform that makes financing simpler",
      body: "We are pleased to introduce Lentific, an online platform that connects borrowers and investors, with personal support at every step.\n\nWhether you have a property project, renovation work to finance or loans to consolidate, or you are looking to invest, Lentific lets you move forward easily from your personal space.\n\nSigning up is free and only takes a few minutes. We would be delighted to welcome you.",
      ctaLabel: "Discover the platform",
    },
    es: {
      subject: "Descubra Lentific, la plataforma que simplifica su financiación",
      body: "Nos complace presentarle Lentific, una plataforma en línea que pone en contacto a prestatarios e inversores, con un acompañamiento personalizado en cada etapa.\n\nTanto si tiene un proyecto inmobiliario, obras que financiar o créditos que agrupar, como si desea invertir, Lentific le permite avanzar con sencillez desde su espacio personal.\n\nEl registro es gratuito y solo lleva unos minutos. Será un placer contar con usted.",
      ctaLabel: "Descubrir la plataforma",
    },
    it: {
      subject: "Scopra Lentific, la piattaforma che semplifica il suo finanziamento",
      body: "Abbiamo il piacere di presentarle Lentific, una piattaforma online che mette in contatto richiedenti e investitori, con un accompagnamento personale in ogni fase.\n\nChe abbia un progetto immobiliare, lavori da finanziare o crediti da consolidare, oppure desideri investire, Lentific le permette di procedere in modo semplice dal suo spazio personale.\n\nL'iscrizione è gratuita e richiede solo pochi minuti. Saremo lieti di accoglierla.",
      ctaLabel: "Scopra la piattaforma",
    },
    hu: {
      subject: "Ismerje meg a Lentificet, a finanszírozást egyszerűsítő platformot",
      body: "Örömmel mutatjuk be a Lentificet: egy online platformot, amely összeköti a hitelfelvevőket és a befektetőket, minden lépésnél személyes támogatással.\n\nLegyen szó ingatlanprojektről, finanszírozandó felújításról, hitelkiváltásról vagy befektetésről, a Lentific segítségével egyszerűen haladhat előre saját fiókjából.\n\nA regisztráció ingyenes, és csak néhány percet vesz igénybe. Örömmel üdvözöljük Önt.",
      ctaLabel: "A platform megismerése",
    },
    pt: {
      subject: "Descubra a Lentific, a plataforma que simplifica o seu financiamento",
      body: "Temos o prazer de lhe apresentar a Lentific, uma plataforma online que põe em contacto mutuários e investidores, com acompanhamento personalizado em cada etapa.\n\nQuer tenha um projeto imobiliário, obras para financiar ou créditos para consolidar, quer pretenda investir, a Lentific permite-lhe avançar de forma simples a partir do seu espaço pessoal.\n\nO registo é gratuito e demora apenas alguns minutos. Teremos todo o gosto em recebê-lo.",
      ctaLabel: "Descobrir a plataforma",
    },
    de: {
      subject: "Entdecken Sie Lentific – die Plattform, die Ihre Finanzierung vereinfacht",
      body: "Wir freuen uns, Ihnen Lentific vorzustellen: eine Online-Plattform, die Kreditnehmer und Investoren zusammenbringt – mit persönlicher Begleitung bei jedem Schritt.\n\nOb Immobilienprojekt, Renovierung, Umschuldung oder Geldanlage: Mit Lentific kommen Sie bequem von Ihrem persönlichen Bereich aus voran.\n\nDie Registrierung ist kostenlos und dauert nur wenige Minuten. Wir würden uns freuen, Sie begrüßen zu dürfen.",
      ctaLabel: "Plattform entdecken",
    },
    nl: {
      subject: "Ontdek Lentific, het platform dat uw financiering eenvoudiger maakt",
      body: "Graag stellen wij u Lentific voor: een online platform dat kredietnemers en investeerders met elkaar in contact brengt, met persoonlijke begeleiding bij elke stap.\n\nOf u nu een vastgoedproject heeft, een verbouwing wilt financieren, leningen wilt samenvoegen of wilt investeren: met Lentific gaat u eenvoudig vooruit vanuit uw persoonlijke omgeving.\n\nRegistreren is gratis en duurt maar een paar minuten. Wij verwelkomen u graag.",
      ctaLabel: "Ontdek het platform",
    },
  },

  // 2. Emprunteurs : étude gratuite du projet
  borrowers: {
    fr: {
      subject: "Votre projet mérite une étude gratuite et sans engagement",
      body: "Vous préparez un achat immobilier, des travaux ou le regroupement de vos crédits ? Lentific étudie gratuitement votre projet et vous accompagne dans la recherche du financement adapté.\n\nVous déposez votre demande en quelques minutes, un conseiller l'examine et revient vers vous rapidement. Vous suivez ensuite l'avancement de votre dossier depuis votre espace en ligne.\n\nL'étude est gratuite et sans engagement de votre part.",
      ctaLabel: "Demander mon étude gratuite",
    },
    en: {
      subject: "Your project deserves a free, no-obligation review",
      body: "Are you planning a property purchase, renovation work or consolidating your loans? Lentific reviews your project free of charge and helps you find suitable financing.\n\nYou submit your request in a few minutes, an advisor reviews it and gets back to you quickly. You can then follow your application from your online space.\n\nThe review is free and there is no obligation on your part.",
      ctaLabel: "Request my free review",
    },
    es: {
      subject: "Su proyecto merece un estudio gratuito y sin compromiso",
      body: "¿Prepara la compra de una vivienda, unas obras o la agrupación de sus créditos? Lentific estudia gratuitamente su proyecto y le acompaña en la búsqueda de la financiación adecuada.\n\nPresenta su solicitud en unos minutos, un asesor la examina y se pone en contacto con usted rápidamente. Después puede seguir el avance de su expediente desde su espacio en línea.\n\nEl estudio es gratuito y sin compromiso.",
      ctaLabel: "Solicitar mi estudio gratuito",
    },
    it: {
      subject: "Il suo progetto merita un'analisi gratuita e senza impegno",
      body: "Sta preparando l'acquisto di un immobile, dei lavori o il consolidamento dei suoi crediti? Lentific analizza gratuitamente il suo progetto e la accompagna nella ricerca del finanziamento più adatto.\n\nInvia la sua richiesta in pochi minuti, un consulente la esamina e la ricontatta rapidamente. Potrà poi seguire l'avanzamento della pratica dal suo spazio online.\n\nL'analisi è gratuita e senza impegno.",
      ctaLabel: "Richiedere l'analisi gratuita",
    },
    hu: {
      subject: "Projektje megérdemel egy ingyenes, kötelezettség nélküli elemzést",
      body: "Ingatlanvásárlást, felújítást vagy hitelei kiváltását tervezi? A Lentific ingyenesen megvizsgálja projektjét, és segít megtalálni a megfelelő finanszírozást.\n\nKérelmét néhány perc alatt beadhatja, egy tanácsadó átnézi, és hamarosan felveszi Önnel a kapcsolatot. Ügye alakulását ezután online fiókjában követheti.\n\nAz elemzés ingyenes, és semmilyen kötelezettséggel nem jár.",
      ctaLabel: "Ingyenes elemzést kérek",
    },
    pt: {
      subject: "O seu projeto merece um estudo gratuito e sem compromisso",
      body: "Está a preparar a compra de uma casa, obras ou a consolidação dos seus créditos? A Lentific estuda gratuitamente o seu projeto e acompanha-o na procura do financiamento adequado.\n\nApresenta o seu pedido em poucos minutos, um consultor analisa-o e contacta-o rapidamente. Depois, acompanha o andamento do seu processo a partir do seu espaço online.\n\nO estudo é gratuito e sem compromisso.",
      ctaLabel: "Pedir o meu estudo gratuito",
    },
    de: {
      subject: "Ihr Projekt verdient eine kostenlose und unverbindliche Prüfung",
      body: "Planen Sie einen Immobilienkauf, eine Renovierung oder die Zusammenlegung Ihrer Kredite? Lentific prüft Ihr Projekt kostenlos und begleitet Sie bei der Suche nach der passenden Finanzierung.\n\nSie stellen Ihre Anfrage in wenigen Minuten, ein Berater prüft sie und meldet sich zeitnah bei Ihnen. Den Stand Ihrer Akte verfolgen Sie anschließend in Ihrem Online-Bereich.\n\nDie Prüfung ist kostenlos und unverbindlich.",
      ctaLabel: "Kostenlose Prüfung anfordern",
    },
    nl: {
      subject: "Uw project verdient een gratis en vrijblijvende analyse",
      body: "Bereidt u de aankoop van een woning, een verbouwing of het samenvoegen van uw kredieten voor? Lentific analyseert uw project gratis en begeleidt u bij het zoeken naar een passende financiering.\n\nU dient uw aanvraag in enkele minuten in, een adviseur bekijkt die en neemt snel contact met u op. Daarna volgt u de voortgang van uw dossier in uw online omgeving.\n\nDe analyse is gratis en vrijblijvend.",
      ctaLabel: "Gratis analyse aanvragen",
    },
  },

  // 3. Investeurs : découvrir les projets à financer
  investors: {
    fr: {
      subject: "Investisseurs : découvrez les projets à financer sur Lentific",
      body: "Lentific met en relation des investisseurs avec des porteurs de projets dont le dossier a été étudié par notre équipe.\n\nDepuis votre espace, vous consultez les projets disponibles, vous choisissez ceux qui vous intéressent et vous suivez vos engagements en toute transparence.\n\nComme tout investissement, le prêt comporte des risques, notamment de perte en capital : n'investissez que des sommes dont vous n'avez pas besoin à court terme.",
      ctaLabel: "Voir les projets",
    },
    en: {
      subject: "Investors: discover the projects to finance on Lentific",
      body: "Lentific connects investors with project owners whose applications have been reviewed by our team.\n\nFrom your space, you browse the available projects, choose the ones that interest you and follow your commitments transparently.\n\nLike any investment, lending carries risks, including the loss of capital: only invest money you will not need in the short term.",
      ctaLabel: "See the projects",
    },
    es: {
      subject: "Inversores: descubra los proyectos que financiar en Lentific",
      body: "Lentific pone en contacto a inversores con promotores de proyectos cuyo expediente ha sido estudiado por nuestro equipo.\n\nDesde su espacio, consulta los proyectos disponibles, elige los que le interesan y sigue sus compromisos con total transparencia.\n\nComo toda inversión, el préstamo conlleva riesgos, en particular de pérdida de capital: invierta solo sumas que no necesite a corto plazo.",
      ctaLabel: "Ver los proyectos",
    },
    it: {
      subject: "Investitori: scoprite i progetti da finanziare su Lentific",
      body: "Lentific mette in contatto investitori e promotori di progetti la cui pratica è stata analizzata dal nostro team.\n\nDal suo spazio consulta i progetti disponibili, sceglie quelli che le interessano e segue i suoi impegni in piena trasparenza.\n\nCome ogni investimento, il prestito comporta rischi, in particolare di perdita del capitale: investa solo somme di cui non ha bisogno a breve termine.",
      ctaLabel: "Vedere i progetti",
    },
    hu: {
      subject: "Befektetőknek: ismerje meg a Lentificen finanszírozható projekteket",
      body: "A Lentific olyan projektgazdákkal hozza össze a befektetőket, akiknek kérelmét csapatunk megvizsgálta.\n\nFiókjában áttekintheti az elérhető projekteket, kiválaszthatja az Önt érdeklőket, és átláthatóan követheti vállalásait.\n\nMint minden befektetés, a hitelezés is kockázattal jár, beleértve a tőkevesztést: csak olyan összeget fektessen be, amelyre rövid távon nincs szüksége.",
      ctaLabel: "A projektek megtekintése",
    },
    pt: {
      subject: "Investidores: descubra os projetos a financiar na Lentific",
      body: "A Lentific põe em contacto investidores com promotores de projetos cujo processo foi analisado pela nossa equipa.\n\nNo seu espaço, consulta os projetos disponíveis, escolhe os que lhe interessam e acompanha os seus compromissos com total transparência.\n\nComo qualquer investimento, o empréstimo comporta riscos, nomeadamente de perda de capital: invista apenas montantes de que não precise a curto prazo.",
      ctaLabel: "Ver os projetos",
    },
    de: {
      subject: "Für Investoren: Entdecken Sie die Projekte auf Lentific",
      body: "Lentific bringt Investoren mit Projektträgern zusammen, deren Unterlagen von unserem Team geprüft wurden.\n\nIn Ihrem Bereich sehen Sie die verfügbaren Projekte, wählen die für Sie interessanten aus und verfolgen Ihre Engagements transparent.\n\nWie jede Geldanlage birgt auch die Kreditvergabe Risiken, insbesondere den Verlust des eingesetzten Kapitals: Investieren Sie nur Beträge, die Sie kurzfristig nicht benötigen.",
      ctaLabel: "Projekte ansehen",
    },
    nl: {
      subject: "Investeerders: ontdek de projecten om te financieren op Lentific",
      body: "Lentific brengt investeerders in contact met projecteigenaren van wie het dossier door ons team is beoordeeld.\n\nIn uw omgeving bekijkt u de beschikbare projecten, kiest u de projecten die u interesseren en volgt u uw verbintenissen op transparante wijze.\n\nZoals elke belegging brengt uitlenen risico's met zich mee, waaronder kapitaalverlies: investeer alleen bedragen die u op korte termijn niet nodig heeft.",
      ctaLabel: "Projecten bekijken",
    },
  },

  // 4. Relance courte
  followup: {
    fr: {
      subject: "Avez-vous eu le temps de découvrir Lentific ?",
      body: "Nous vous avions récemment présenté Lentific, la plateforme qui facilite le financement de vos projets et l'investissement.\n\nSi vous avez la moindre question, notre équipe se tient à votre disposition : il vous suffit de répondre à cet e-mail.",
      ctaLabel: "Visiter Lentific",
    },
    en: {
      subject: "Have you had a chance to discover Lentific?",
      body: "We recently introduced you to Lentific, the platform that makes financing your projects and investing easier.\n\nIf you have any questions, our team is at your disposal: simply reply to this e-mail.",
      ctaLabel: "Visit Lentific",
    },
    es: {
      subject: "¿Ha tenido ocasión de descubrir Lentific?",
      body: "Hace poco le presentamos Lentific, la plataforma que facilita la financiación de sus proyectos y la inversión.\n\nSi tiene cualquier pregunta, nuestro equipo está a su disposición: basta con responder a este correo.",
      ctaLabel: "Visitar Lentific",
    },
    it: {
      subject: "Ha avuto modo di scoprire Lentific?",
      body: "Di recente le abbiamo presentato Lentific, la piattaforma che facilita il finanziamento dei suoi progetti e l'investimento.\n\nPer qualsiasi domanda il nostro team è a sua disposizione: basta rispondere a questa e-mail.",
      ctaLabel: "Visitare Lentific",
    },
    hu: {
      subject: "Volt már ideje megismerni a Lentificet?",
      body: "Nemrég bemutattuk Önnek a Lentificet, a platformot, amely megkönnyíti projektjei finanszírozását és a befektetést.\n\nHa bármilyen kérdése van, csapatunk szívesen áll rendelkezésére: egyszerűen válaszoljon erre az e-mailre.",
      ctaLabel: "Irány a Lentific",
    },
    pt: {
      subject: "Já teve oportunidade de descobrir a Lentific?",
      body: "Apresentámos-lhe recentemente a Lentific, a plataforma que facilita o financiamento dos seus projetos e o investimento.\n\nSe tiver alguma questão, a nossa equipa está à sua disposição: basta responder a este e-mail.",
      ctaLabel: "Visitar a Lentific",
    },
    de: {
      subject: "Hatten Sie schon Gelegenheit, Lentific zu entdecken?",
      body: "Wir haben Ihnen kürzlich Lentific vorgestellt, die Plattform, die die Finanzierung Ihrer Projekte und die Geldanlage erleichtert.\n\nBei Fragen steht Ihnen unser Team gern zur Verfügung: Antworten Sie einfach auf diese E-Mail.",
      ctaLabel: "Lentific besuchen",
    },
    nl: {
      subject: "Heeft u Lentific al kunnen ontdekken?",
      body: "Onlangs hebben wij u Lentific voorgesteld, het platform dat de financiering van uw projecten en het investeren eenvoudiger maakt.\n\nHeeft u vragen? Ons team staat voor u klaar: beantwoord gewoon deze e-mail.",
      ctaLabel: "Lentific bezoeken",
    },
  },

  // 5. Offre Premium (membres)
  premium: {
    fr: {
      subject: "Passez à Lentific Premium et profitez d'un accompagnement prioritaire",
      body: "Avec l'abonnement Premium, votre dossier est traité en priorité et vous bénéficiez d'un suivi renforcé par notre équipe.\n\nL'abonnement est à 44,90 € par mois, sans engagement : vous pouvez l'arrêter à tout moment depuis votre espace.\n\nConnectez-vous à votre compte pour découvrir tous les avantages Premium.",
      ctaLabel: "Découvrir Premium",
    },
    en: {
      subject: "Upgrade to Lentific Premium for priority support",
      body: "With the Premium subscription, your application is handled as a priority and you benefit from closer follow-up by our team.\n\nThe subscription costs €44.90 per month, with no commitment: you can stop it at any time from your space.\n\nLog in to your account to discover all the Premium benefits.",
      ctaLabel: "Discover Premium",
    },
    es: {
      subject: "Pásese a Lentific Premium y disfrute de un acompañamiento prioritario",
      body: "Con la suscripción Premium, su expediente se trata con prioridad y disfruta de un seguimiento reforzado por parte de nuestro equipo.\n\nLa suscripción cuesta 44,90 € al mes, sin permanencia: puede cancelarla en cualquier momento desde su espacio.\n\nInicie sesión en su cuenta para descubrir todas las ventajas Premium.",
      ctaLabel: "Descubrir Premium",
    },
    it: {
      subject: "Passi a Lentific Premium per un accompagnamento prioritario",
      body: "Con l'abbonamento Premium la sua pratica viene trattata in via prioritaria e beneficia di un supporto rafforzato da parte del nostro team.\n\nL'abbonamento costa 44,90 € al mese, senza vincoli: può interromperlo in qualsiasi momento dal suo spazio.\n\nAcceda al suo account per scoprire tutti i vantaggi Premium.",
      ctaLabel: "Scoprire Premium",
    },
    hu: {
      subject: "Váltson Lentific Premiumra, és élvezze a kiemelt támogatást",
      body: "A Premium előfizetéssel ügyét elsőbbséggel kezeljük, és csapatunk fokozott figyelemmel kíséri.\n\nAz előfizetés havi 44,90 €, hűségidő nélkül: fiókjából bármikor lemondhatja.\n\nJelentkezzen be fiókjába, és ismerje meg a Premium összes előnyét.",
      ctaLabel: "A Premium megismerése",
    },
    pt: {
      subject: "Passe para o Lentific Premium e beneficie de acompanhamento prioritário",
      body: "Com a subscrição Premium, o seu processo é tratado com prioridade e beneficia de um acompanhamento reforçado pela nossa equipa.\n\nA subscrição custa 44,90 € por mês, sem fidelização: pode cancelá-la a qualquer momento a partir do seu espaço.\n\nInicie sessão na sua conta para descobrir todas as vantagens Premium.",
      ctaLabel: "Descobrir o Premium",
    },
    de: {
      subject: "Wechseln Sie zu Lentific Premium – mit bevorzugter Betreuung",
      body: "Mit dem Premium-Abonnement wird Ihre Akte bevorzugt bearbeitet und Sie profitieren von einer intensiveren Betreuung durch unser Team.\n\nDas Abonnement kostet 44,90 € pro Monat, ohne Mindestlaufzeit: Sie können es jederzeit in Ihrem Bereich beenden.\n\nMelden Sie sich in Ihrem Konto an, um alle Premium-Vorteile zu entdecken.",
      ctaLabel: "Premium entdecken",
    },
    nl: {
      subject: "Stap over op Lentific Premium voor voorrangsbegeleiding",
      body: "Met het Premium-abonnement wordt uw dossier met voorrang behandeld en krijgt u intensievere begeleiding van ons team.\n\nHet abonnement kost € 44,90 per maand, zonder verplichting: u kunt het op elk moment stopzetten vanuit uw omgeving.\n\nLog in op uw account om alle Premium-voordelen te ontdekken.",
      ctaLabel: "Premium ontdekken",
    },
  },

  // 6. Professionnels (courtiers, agents immobiliers, conseillers…)
  partners: {
    fr: {
      subject: "Proposition de partenariat avec Lentific",
      body: "Vous accompagnez des clients qui ont besoin d'un financement ? Lentific peut être un relais utile pour votre activité.\n\nNotre plateforme étudie les projets de vos clients, les met en relation avec des investisseurs et leur permet de suivre leur dossier en ligne. Vous restez leur interlocuteur privilégié.\n\nNous serions heureux d'échanger avec vous sur un partenariat : répondez simplement à cet e-mail pour convenir d'un rendez-vous.",
      ctaLabel: "Prendre contact",
    },
    en: {
      subject: "Partnership proposal from Lentific",
      body: "Do you work with clients who need financing? Lentific can be a useful partner for your business.\n\nOur platform reviews your clients' projects, connects them with investors and lets them follow their application online. You remain their main point of contact.\n\nWe would be happy to discuss a partnership with you: simply reply to this e-mail to arrange a meeting.",
      ctaLabel: "Get in touch",
    },
    es: {
      subject: "Propuesta de colaboración con Lentific",
      body: "¿Acompaña a clientes que necesitan financiación? Lentific puede ser un apoyo útil para su actividad.\n\nNuestra plataforma estudia los proyectos de sus clientes, los pone en contacto con inversores y les permite seguir su expediente en línea. Usted sigue siendo su interlocutor principal.\n\nNos encantaría hablar con usted sobre una colaboración: responda a este correo para concertar una cita.",
      ctaLabel: "Ponerse en contacto",
    },
    it: {
      subject: "Proposta di partnership con Lentific",
      body: "Accompagna clienti che hanno bisogno di un finanziamento? Lentific può essere un supporto utile per la sua attività.\n\nLa nostra piattaforma analizza i progetti dei suoi clienti, li mette in contatto con investitori e consente loro di seguire la pratica online. Lei resta il loro interlocutore di riferimento.\n\nSaremo lieti di parlarle di una partnership: risponda a questa e-mail per fissare un appuntamento.",
      ctaLabel: "Contattarci",
    },
    hu: {
      subject: "Partnerségi ajánlat a Lentifictől",
      body: "Olyan ügyfeleket segít, akiknek finanszírozásra van szükségük? A Lentific hasznos partner lehet tevékenységében.\n\nPlatformunk megvizsgálja ügyfelei projektjeit, befektetőkkel hozza össze őket, és lehetővé teszi, hogy ügyüket online kövessék. Ön marad a fő kapcsolattartójuk.\n\nSzívesen beszélnénk Önnel egy partnerségről: válaszoljon erre az e-mailre időpont egyeztetéséhez.",
      ctaLabel: "Kapcsolatfelvétel",
    },
    pt: {
      subject: "Proposta de parceria com a Lentific",
      body: "Acompanha clientes que precisam de financiamento? A Lentific pode ser um apoio útil para a sua atividade.\n\nA nossa plataforma analisa os projetos dos seus clientes, põe-nos em contacto com investidores e permite-lhes acompanhar o processo online. Continua a ser o seu interlocutor privilegiado.\n\nTeremos todo o gosto em falar consigo sobre uma parceria: basta responder a este e-mail para marcar uma reunião.",
      ctaLabel: "Entrar em contacto",
    },
    de: {
      subject: "Partnerschaftsangebot von Lentific",
      body: "Begleiten Sie Kunden, die eine Finanzierung benötigen? Lentific kann eine wertvolle Ergänzung für Ihr Geschäft sein.\n\nUnsere Plattform prüft die Projekte Ihrer Kunden, bringt sie mit Investoren zusammen und lässt sie ihre Akte online verfolgen. Sie bleiben ihr erster Ansprechpartner.\n\nGern sprechen wir mit Ihnen über eine Partnerschaft: Antworten Sie einfach auf diese E-Mail, um einen Termin zu vereinbaren.",
      ctaLabel: "Kontakt aufnehmen",
    },
    nl: {
      subject: "Partnerschapsvoorstel van Lentific",
      body: "Begeleidt u klanten die financiering nodig hebben? Lentific kan een nuttige partner zijn voor uw activiteiten.\n\nOns platform analyseert de projecten van uw klanten, brengt hen in contact met investeerders en laat hen hun dossier online volgen. U blijft hun vaste aanspreekpunt.\n\nWij bespreken graag een samenwerking met u: beantwoord deze e-mail om een afspraak te maken.",
      ctaLabel: "Contact opnemen",
    },
  },
};

export const MARKETING_TEMPLATES: Record<MarketingTemplateKey, Record<MarketingLocale, MarketingTemplateText>> = { ...SHORT_TEMPLATES, ...CLASSIC_TEMPLATES };

export function marketingTemplate(key: string, locale: string): MarketingTemplateText | null {
  if (!(MARKETING_TEMPLATE_KEYS as readonly string[]).includes(key) || !isMarketingLocale(locale)) return null;
  return MARKETING_TEMPLATES[key as MarketingTemplateKey][locale];
}

// ---------------------------------------------------------------------------
// Rendu d'un e-mail de campagne pour un contact
// ---------------------------------------------------------------------------

export function unsubscribeUrl(token: string) {
  return `${webBaseUrl()}/desabonnement?t=${encodeURIComponent(token)}`;
}

/** Adresse de désinscription « en un clic » (en-tête List-Unsubscribe, POST de Gmail / Outlook). */
export function oneClickUnsubscribeUrl(token: string) {
  return `${webBaseUrl()}/api/desabonnement?t=${encodeURIComponent(token)}`;
}

/** Lien du bouton : chemin du site (/…) mis dans la langue du contact, ou URL complète telle quelle. */
function ctaHref(ctaUrl: string, locale: string) {
  if (/^https?:\/\//i.test(ctaUrl)) return ctaUrl;
  const path = ctaUrl.startsWith("/") ? ctaUrl : `/${ctaUrl}`;
  const [beforeHash, hash] = path.split("#");
  const url = webUrlInLocale(beforeHash || "/", locale);
  const tagged = `${url}${url.includes("?") ? "&" : "?"}utm_source=email&utm_medium=marketing`;
  return hash ? `${tagged}#${hash}` : tagged;
}

export function renderMarketingEmail(
  campaign: { subject: string; body: string; ctaLabel: string | null; ctaUrl: string | null; locale: string },
  contact: { name: string | null; unsubscribeToken: string }
) {
  const locale = isMarketingLocale(campaign.locale) ? campaign.locale : "fr";
  const c = COMMON[locale];
  const firstName = contact.name?.trim().split(/\s+/)[0] ?? "";
  const greeting = firstName ? c.hello(firstName) : c.helloNoName;
  const paragraphs = campaign.body.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const unsub = unsubscribeUrl(contact.unsubscribeToken);
  const button = campaign.ctaLabel && campaign.ctaUrl ? { label: campaign.ctaLabel, url: ctaHref(campaign.ctaUrl, locale) } : undefined;

  const html = layout(
    [escapeHtml(greeting), ...paragraphs.map((p) => escapeHtml(p).replace(/\n/g, "<br>"))],
    button,
    c.signature,
    `${escapeHtml(c.reply)}<br><br><span style="font-size:12px">${escapeHtml(c.why)} <a href="${unsub}" style="color:#6b7080">${escapeHtml(c.unsubscribe)}</a></span>`
  );
  const text = [
    greeting, "", ...paragraphs.flatMap((p) => [p, ""]),
    ...(button ? [`${button.label} : ${button.url}`, ""] : []),
    c.signature, "", c.reply, c.why, `${c.unsubscribe} : ${unsub}`,
    "", "--", companyFooter(),
  ].join("\n");
  return { subject: campaign.subject, html, text, unsubscribe: oneClickUnsubscribeUrl(contact.unsubscribeToken) };
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export type MarketingBasis = "CONSENT" | "PROFESSIONAL" | "CLIENT";

const EMAIL_RE = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/;

/**
 * Ajoute des contacts à partir d'un texte collé : une ligne par contact,
 * « e-mail » ou « e-mail ; nom » ou « e-mail ; nom ; langue » (virgule,
 * point-virgule ou tabulation). Les adresses déjà connues sont ignorées.
 */
export async function addMarketingContacts(input: {
  raw: string;
  basis: MarketingBasis;
  defaultLocale: string;
  addedById: string;
}) {
  const defaultLocale = isMarketingLocale(input.defaultLocale) ? input.defaultLocale : "fr";
  const parsed = new Map<string, { name: string | null; locale: MarketingLocale }>();
  let invalid = 0;
  for (const line of input.raw.split(/\r?\n/).slice(0, 2000)) {
    const parts = line.split(/[;,\t]/).map((p) => p.trim());
    if (!parts[0]) continue;
    const email = parts[0].toLowerCase().replace(/^<|>$/g, "");
    if (!EMAIL_RE.test(email) || email.length > 160) { invalid++; continue; }
    const lang = (parts[2] ?? "").toLowerCase();
    parsed.set(email, { name: parts[1] ? parts[1].slice(0, 80) : null, locale: isMarketingLocale(lang) ? lang : defaultLocale });
  }
  const emails = [...parsed.keys()];
  const existing = new Set(
    (await prisma.marketingContact.findMany({ where: { email: { in: emails } }, select: { email: true } })).map((c) => c.email)
  );
  const fresh = emails.filter((e) => !existing.has(e));
  if (fresh.length > 0) {
    await prisma.marketingContact.createMany({
      data: fresh.map((email) => ({
        email,
        name: parsed.get(email)!.name,
        locale: parsed.get(email)!.locale,
        basis: input.basis,
        source: emails.length > 1 ? "IMPORT" : "MANUAL",
        unsubscribeToken: randomBytes(24).toString("base64url"),
        addedById: input.addedById,
      })),
      skipDuplicates: true,
    });
  }
  return { added: fresh.length, skipped: existing.size, invalid };
}

/** Désinscription depuis le lien de l'e-mail. Renvoie la langue du contact, ou null si le lien est inconnu. */
export async function unsubscribeMarketingContact(token: string | null | undefined) {
  if (!token || token.length < 16 || token.length > 100) return null;
  const contact = await prisma.marketingContact.findUnique({ where: { unsubscribeToken: token } });
  if (!contact) return null;
  if (contact.status === "SUBSCRIBED") {
    await prisma.marketingContact.update({ where: { id: contact.id }, data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() } });
  }
  return { locale: contact.locale, email: contact.email };
}

/** Langue d'un contact à partir de son lien (pour afficher la page de désinscription dans sa langue). */
export async function marketingContactLocale(token: string | null | undefined) {
  if (!token || token.length < 16 || token.length > 100) return null;
  const contact = await prisma.marketingContact.findUnique({ where: { unsubscribeToken: token }, select: { locale: true, status: true } });
  return contact;
}

// ---------------------------------------------------------------------------
// Envoi des campagnes
// ---------------------------------------------------------------------------

export function marketingDailyLimit() {
  const n = Number(process.env.MARKETING_DAILY_LIMIT);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 80;
}

/** E-mails marketing réellement partis sur les dernières 24 h. */
export async function marketingSentLast24h() {
  return prisma.marketingSend.count({ where: { status: "SENT", createdAt: { gt: new Date(Date.now() - 24 * 3600 * 1000) } } });
}

/** Contacts visés par une campagne : inscrits, de la langue de la campagne, pas encore servis. */
function pendingRecipientsWhere(campaignId: string, locale: string) {
  return { status: "SUBSCRIBED" as const, locale, sends: { none: { campaignId } } };
}

export async function countCampaignPending(campaignId: string, locale: string) {
  return prisma.marketingContact.count({ where: pendingRecipientsWhere(campaignId, locale) });
}

/** E-mail d'essai à un membre de l'équipe (journalisé dans « E-mails envoyés »). */
export async function sendCampaignTest(campaignId: string, to: string) {
  const campaign = await prisma.marketingCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { status: "FAILED" as const, error: "campagne introuvable" };
  const r = renderMarketingEmail(campaign, { name: null, unsubscribeToken: "apercu-test-sans-effet" });
  return sendEmail({ to, subject: `[TEST] ${r.subject}`, text: r.text, html: r.html, kind: "marketing.test", replyTo: contactInbox() });
}

type BatchOutcome = { status: "SENT" | "FAILED" | "LOCAL"; error?: string };

async function deliverBatch(items: { to: string; subject: string; html: string; text: string; unsubscribe: string }[]): Promise<BatchOutcome> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { status: "LOCAL" };
  try {
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(
        items.map((m) => ({
          from,
          to: [m.to],
          subject: m.subject,
          html: m.html,
          text: m.text,
          reply_to: contactInbox(),
          headers: { "List-Unsubscribe": `<${m.unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        }))
      ),
    });
    if (!res.ok) return { status: "FAILED", error: `${res.status} ${await res.text()}`.slice(0, 500) };
    return { status: "SENT" };
  } catch (error) {
    return { status: "FAILED", error: String(error).slice(0, 500) };
  }
}

/**
 * Envoie le lot suivant d'une campagne (au plus 50 e-mails par clic, dans la
 * limite du plafond quotidien). Les contacts déjà servis sont ignorés : on peut
 * relancer l'envoi le lendemain pour continuer.
 */
export async function sendCampaignBatch(campaignId: string) {
  const campaign = await prisma.marketingCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { sent: 0, failed: 0, local: 0, remaining: 0, limited: false, error: "campagne introuvable" };

  const providerLive = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  const room = providerLive ? Math.max(0, marketingDailyLimit() - (await marketingSentLast24h())) : 50;
  const take = Math.min(50, room);
  const pendingBefore = await countCampaignPending(campaign.id, campaign.locale);
  if (take === 0 || pendingBefore === 0) {
    return { sent: 0, failed: 0, local: 0, remaining: pendingBefore, limited: take === 0 && pendingBefore > 0 };
  }

  const contacts = await prisma.marketingContact.findMany({
    where: pendingRecipientsWhere(campaign.id, campaign.locale),
    orderBy: { createdAt: "asc" },
    take,
  });
  const rendered = contacts.map((c) => ({ contact: c, ...renderMarketingEmail(campaign, c) }));
  const outcome = await deliverBatch(rendered.map((r) => ({ to: r.contact.email, subject: r.subject, html: r.html, text: r.text, unsubscribe: r.unsubscribe })));

  // Un lot refusé par le fournisseur n'est pas enregistré : il pourra être retenté.
  if (outcome.status !== "FAILED") {
    await prisma.marketingSend.createMany({
      data: contacts.map((c) => ({ campaignId: campaign.id, contactId: c.id, status: outcome.status })),
      skipDuplicates: true,
    });
  }

  const sent = outcome.status === "SENT" ? contacts.length : 0;
  const local = outcome.status === "LOCAL" ? contacts.length : 0;
  const failed = outcome.status === "FAILED" ? contacts.length : 0;
  const remaining = await countCampaignPending(campaign.id, campaign.locale);
  await prisma.marketingCampaign.update({
    where: { id: campaign.id },
    data: {
      sentCount: { increment: sent + local },
      failedCount: { increment: failed },
      status: remaining === 0 && failed === 0 ? "SENT" : "SENDING",
      sentAt: campaign.sentAt ?? (sent + local > 0 ? new Date() : null),
    },
  });
  if (failed) console.error(`[marketing] lot refusé pour la campagne ${campaign.id} : ${outcome.error}`);
  return { sent, failed, local, remaining, limited: remaining > 0 && take < 50, error: outcome.error };
}
