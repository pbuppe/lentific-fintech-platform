/**
 * Texte de la politique de confidentialité (demande produit 2026-11-16), dans
 * les 8 langues du site. Il décrit le fonctionnement réel de la plateforme
 * (données collectées, prestataires, cookies, durées) : à tenir à jour si l'un
 * de ces points change. {controller} et {email} sont remplacés à l'affichage
 * par l'identité légale (lib/legal.ts).
 */
export type Block = string | { ul: string[] } | { table: { head: string[]; rows: string[][] } };
export type PrivacyText = {
  meta: string;
  reg: string;
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  sections: { h: string; body: Block[] }[];
  cookieButton: string;
  back: string;
};

export const UPDATED_AT = "2026-11-16";

const fr: PrivacyText = {
  meta: "Politique de confidentialité et cookies",
  reg: "société immatriculée au Royaume-Uni (Companies House) sous le n° {n}",
  kicker: "Lentific · Vos données",
  title: "Politique de confidentialité",
  updated: "Dernière mise à jour : {date}",
  intro:
    "Cette page explique, simplement, quelles données personnelles nous recueillons lorsque vous utilisez le site Lentific, pourquoi, avec qui elles sont partagées, combien de temps nous les gardons et comment exercer vos droits. Elle s'applique au site www.lentific.com et à votre espace client.",
  sections: [
    {
      h: "1. Qui est responsable de vos données ?",
      body: [
        "Le responsable du traitement est {controller}. Pour toute question sur vos données ou pour exercer vos droits, écrivez-nous à {email}.",
      ],
    },
    {
      h: "2. Les données que nous recueillons",
      body: [
        {
          ul: [
            "Votre compte : nom, prénom, adresse e-mail, téléphone, pays, langue et mot de passe (enregistré uniquement sous forme chiffrée, jamais en clair).",
            "Votre demande de financement ou votre profil d'investisseur : informations sur votre projet, votre situation et vos capacités financières, ainsi que les justificatifs que vous déposez (par exemple pièce d'identité, justificatifs de revenus ou de domicile).",
            "Vos paiements : ils sont réalisés par PayPal. Nous ne recevons jamais vos numéros de carte ni vos identifiants PayPal ; nous conservons seulement le montant, la date, l'objet et la référence de l'opération.",
            "Le formulaire de contact : nom, adresse e-mail, téléphone, projet et message.",
            "Nos e-mails d'information : adresse e-mail, prénom et langue.",
            "Vos échanges avec notre équipe : messages, demandes d'assistance et notes de suivi de votre dossier.",
            "La sécurité : historique des connexions et des actions effectuées sur les comptes et les dossiers.",
            "La mesure d'audience du site : voir la partie 7 « Cookies et statistiques de visite ».",
          ],
        },
      ],
    },
    {
      h: "3. Pourquoi nous les utilisons",
      body: [
        {
          ul: [
            "Créer et gérer votre compte, étudier votre demande, vous mettre en relation avec des emprunteurs ou des investisseurs et assurer le suivi de votre dossier : c'est nécessaire à l'exécution du service que vous nous demandez.",
            "Vérifier votre identité et celle des investisseurs, prévenir la fraude, le blanchiment d'argent et le financement du terrorisme, conserver les pièces comptables : ce sont des obligations légales.",
            "Répondre à vos messages et vous recontacter lorsque vous nous le demandez via le formulaire : c'est nécessaire pour donner suite à votre demande.",
            "Vous envoyer nos e-mails d'information et de présentation de la plateforme : avec votre accord, ou, pour les professionnels et nos clients, dans le cadre de notre intérêt légitime à faire connaître nos services. Chaque e-mail contient un lien de désinscription.",
            "Mesurer la fréquentation du site et l'améliorer : de façon anonyme pour tous les visiteurs, et de façon plus détaillée uniquement si vous acceptez les cookies.",
            "Assurer la sécurité de la plateforme et de vos données : c'est notre intérêt légitime.",
          ],
        },
        "Nous ne prenons aucune décision vous concernant de façon entièrement automatique : chaque dossier est examiné par une personne de notre équipe.",
      ],
    },
    {
      h: "4. Qui peut y accéder",
      body: [
        {
          ul: [
            "Les membres habilités de notre équipe (conseillers, administrateurs), chacun selon son rôle et uniquement pour ce dont il a besoin.",
            "Dans le cadre d'une mise en relation que vous avez acceptée : les informations strictement nécessaires sont communiquées à l'emprunteur ou à l'investisseur concerné.",
            "Nos prestataires techniques, qui agissent uniquement sur nos instructions : Vercel (hébergement du site), Neon (base de données, hébergée à Francfort, en Allemagne), Resend (envoi des e-mails), PayPal (paiements) et Hostinger (notre messagerie).",
            "Les autorités, lorsque la loi nous y oblige.",
          ],
        },
        "Nous ne vendons ni ne louons vos données, à personne.",
      ],
    },
    {
      h: "5. Transferts hors de l'Union européenne",
      body: [
        "Certains de nos prestataires (notamment Vercel, Resend et PayPal) sont des sociétés américaines et peuvent traiter des données hors de l'Union européenne. Ces transferts sont encadrés par les garanties prévues par le RGPD : clauses contractuelles types de la Commission européenne ou certification au « Data Privacy Framework » UE–États-Unis. Notre société est établie au Royaume-Uni, qui bénéficie d'une décision d'adéquation de la Commission européenne : vos données y sont protégées à un niveau équivalent à celui de l'Union européenne. Notre base de données est, elle, hébergée dans l'Union européenne (Francfort).",
      ],
    },
    {
      h: "6. Combien de temps nous les gardons",
      body: [
        {
          ul: [
            "Compte et dossier : pendant toute la durée de notre relation, puis 5 ans après sa fin (obligations de lutte contre le blanchiment et délais de prescription).",
            "Justificatifs d'identité et de situation : 5 ans après la fin de la relation.",
            "Pièces comptables et paiements : 10 ans, comme l'exige la loi.",
            "Demandes reçues par le formulaire de contact, sans suite : 3 ans après notre dernier échange.",
            "Liste de nos e-mails d'information : jusqu'à votre désinscription, et au plus 3 ans sans aucun échange avec vous.",
            "Statistiques de visite : 25 mois, puis suppression automatique.",
          ],
        },
      ],
    },
    {
      h: "7. Cookies et statistiques de visite",
      body: [
        "Lors de votre première visite, un bandeau vous laisse le choix d'accepter ou de refuser les cookies de mesure d'audience. Refuser est aussi simple qu'accepter, et vous pouvez changer d'avis à tout moment avec le lien « Gérer les cookies » en bas de chaque page ou le bouton ci-dessous.",
        "Que vous acceptiez ou non, nous comptons les pages vues de façon anonyme : page consultée, temps passé, type d'appareil, navigateur, et pays et ville approximatifs. Le pays et la ville sont déduits de votre adresse IP au moment de la visite, par notre hébergeur ; nous n'enregistrons pas votre adresse IP dans nos bases.",
        "Si vous acceptez, un identifiant aléatoire nous permet en plus de reconnaître votre navigateur d'une visite à l'autre, de suivre votre parcours sur le site et les actions effectuées (clics, formulaires envoyés, liens vers d'autres sites). Ces informations restent chez nous : aucun cookie publicitaire, aucun outil d'un réseau social ou d'une régie publicitaire n'est utilisé sur le site.",
        {
          table: {
            head: ["Cookie", "À quoi il sert", "Durée", "Votre accord"],
            rows: [
              ["lentific_session", "Vous garder connecté à votre espace client", "30 jours", "Non requis (indispensable)"],
              ["lentific_assist_code", "Afficher le code d'une assistance à distance que vous avez demandée", "10 minutes", "Non requis (indispensable)"],
              ["NEXT_LOCALE, NEXT_COUNTRY", "Retenir votre langue et votre pays", "1 an", "Non requis (indispensable)"],
              ["lentific_consent", "Retenir votre choix sur les cookies", "6 mois", "Non requis (indispensable)"],
              ["NEXT_VISITOR_ID", "Reconnaître votre navigateur d'une visite à l'autre (statistiques)", "13 mois", "Uniquement si vous acceptez"],
              ["NEXT_VISIT_ID", "Regrouper les pages d'une même visite (statistiques)", "30 minutes", "Uniquement si vous acceptez"],
            ],
          },
        },
        "Lorsque vous payez, la page de paiement PayPal peut déposer ses propres cookies, nécessaires au paiement et régis par la politique de confidentialité de PayPal.",
      ],
    },
    {
      h: "8. Vos droits",
      body: [
        "Vous pouvez à tout moment demander à accéder à vos données, les faire corriger ou supprimer, en limiter l'utilisation, vous opposer à leur utilisation (notamment à nos e-mails d'information, sans avoir à vous justifier), en recevoir une copie dans un format courant, retirer votre accord, et nous indiquer ce que nous devons faire de vos données après votre décès.",
        "Pour cela, écrivez-nous à {email}. Nous vous répondons dans un délai d'un mois. Si nous avons un doute raisonnable sur votre identité, nous pourrons vous demander de la confirmer. Certaines données ne peuvent pas être supprimées avant la fin des durées imposées par la loi (partie 6).",
        "Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir l'autorité de protection des données de votre pays ; en France, la CNIL (www.cnil.fr). Notre société étant établie au Royaume-Uni, vous pouvez aussi vous adresser à l'autorité britannique, l'ICO (ico.org.uk).",
      ],
    },
    {
      h: "9. Sécurité",
      body: [
        "Le site est entièrement chiffré (HTTPS), les mots de passe ne sont jamais conservés en clair, l'accès aux données est limité selon le rôle de chaque membre de l'équipe et les actions sensibles sont enregistrées. Les espaces d'administration ne sont accessibles qu'à notre équipe.",
      ],
    },
    {
      h: "10. Modifications",
      body: [
        "Nous pouvons mettre à jour cette politique, par exemple si nous ajoutons un service ou un prestataire. La date de dernière mise à jour figure en haut de cette page. En cas de changement important, nous vous en informerons sur le site ou par e-mail.",
      ],
    },
  ],
  cookieButton: "Gérer les cookies",
  back: "Retour au site",
};

const en: PrivacyText = {
  meta: "Privacy and cookie policy",
  reg: "a company registered in the United Kingdom (Companies House) under number {n}",
  kicker: "Lentific · Your data",
  title: "Privacy policy",
  updated: "Last updated: {date}",
  intro:
    "This page explains, in plain terms, which personal data we collect when you use the Lentific website, why, who it is shared with, how long we keep it and how to exercise your rights. It applies to www.lentific.com and to your client area.",
  sections: [
    {
      h: "1. Who is responsible for your data?",
      body: ["The data controller is {controller}. For any question about your data or to exercise your rights, write to us at {email}."],
    },
    {
      h: "2. The data we collect",
      body: [
        {
          ul: [
            "Your account: first and last name, e-mail address, phone number, country, language and password (stored only in encrypted form, never in plain text).",
            "Your financing request or investor profile: information about your project, your situation and financial capacity, and the supporting documents you upload (for example ID, proof of income or address).",
            "Your payments: they are processed by PayPal. We never receive your card numbers or PayPal login details; we only keep the amount, date, purpose and reference of the transaction.",
            "The contact form: name, e-mail address, phone number, project and message.",
            "Our newsletters: e-mail address, first name and language.",
            "Your exchanges with our team: messages, assistance requests and follow-up notes on your file.",
            "Security: history of logins and of actions carried out on accounts and files.",
            "Website audience measurement: see section 7 “Cookies and visit statistics”.",
          ],
        },
      ],
    },
    {
      h: "3. Why we use it",
      body: [
        {
          ul: [
            "To create and manage your account, review your request, put you in touch with borrowers or investors and follow up your file: this is necessary to provide the service you ask for.",
            "To verify your identity and that of investors, prevent fraud, money laundering and terrorist financing, and keep accounting records: these are legal obligations.",
            "To answer your messages and call you back when you ask us to through the form: this is necessary to follow up your request.",
            "To send you our newsletters presenting the platform: with your consent or, for professionals and our clients, on the basis of our legitimate interest in making our services known. Every e-mail contains an unsubscribe link.",
            "To measure and improve the website's audience: anonymously for all visitors, and in more detail only if you accept cookies.",
            "To keep the platform and your data secure: this is our legitimate interest.",
          ],
        },
        "We never make decisions about you on a fully automated basis: every file is reviewed by a member of our team.",
      ],
    },
    {
      h: "4. Who can access it",
      body: [
        {
          ul: [
            "Authorised members of our team (advisers, administrators), each according to their role and only for what they need.",
            "As part of an introduction you have accepted: only the strictly necessary information is shared with the borrower or investor concerned.",
            "Our technical providers, acting only on our instructions: Vercel (website hosting), Neon (database, hosted in Frankfurt, Germany), Resend (sending e-mails), PayPal (payments) and Hostinger (our mailbox).",
            "The authorities, when required by law.",
          ],
        },
        "We never sell or rent your data to anyone.",
      ],
    },
    {
      h: "5. Transfers outside the European Union",
      body: [
        "Some of our providers (in particular Vercel, Resend and PayPal) are US companies and may process data outside the European Union. These transfers are covered by the safeguards provided by the GDPR: European Commission standard contractual clauses or certification under the EU–US Data Privacy Framework. Our company is established in the United Kingdom, which benefits from an adequacy decision of the European Commission: your data is protected there to a level equivalent to that of the European Union. Our database itself is hosted in the European Union (Frankfurt).",
      ],
    },
    {
      h: "6. How long we keep it",
      body: [
        {
          ul: [
            "Account and file: for the whole duration of our relationship, then 5 years after it ends (anti-money-laundering obligations and limitation periods).",
            "Identity and supporting documents: 5 years after the end of the relationship.",
            "Accounting records and payments: 10 years, as required by law.",
            "Contact form requests with no follow-up: 3 years after our last exchange.",
            "Newsletter list: until you unsubscribe, and at most 3 years without any exchange with you.",
            "Visit statistics: 25 months, then automatic deletion.",
          ],
        },
      ],
    },
    {
      h: "7. Cookies and visit statistics",
      body: [
        "On your first visit, a banner lets you accept or refuse audience-measurement cookies. Refusing is as easy as accepting, and you can change your mind at any time with the “Manage cookies” link at the bottom of every page or the button below.",
        "Whether or not you accept, we count page views anonymously: page viewed, time spent, device type, browser, and approximate country and city. Country and city are derived from your IP address at the time of the visit by our hosting provider; we do not store your IP address in our databases.",
        "If you accept, a random identifier also lets us recognise your browser from one visit to the next and follow your journey on the site and the actions you take (clicks, forms sent, links to other sites). This information stays with us: no advertising cookie and no social-network or ad-network tool is used on the site.",
        {
          table: {
            head: ["Cookie", "Purpose", "Duration", "Your consent"],
            rows: [
              ["lentific_session", "Keep you logged in to your client area", "30 days", "Not required (essential)"],
              ["lentific_assist_code", "Display the code of a remote assistance session you requested", "10 minutes", "Not required (essential)"],
              ["NEXT_LOCALE, NEXT_COUNTRY", "Remember your language and country", "1 year", "Not required (essential)"],
              ["lentific_consent", "Remember your cookie choice", "6 months", "Not required (essential)"],
              ["NEXT_VISITOR_ID", "Recognise your browser from one visit to the next (statistics)", "13 months", "Only if you accept"],
              ["NEXT_VISIT_ID", "Group the pages of a single visit (statistics)", "30 minutes", "Only if you accept"],
            ],
          },
        },
        "When you pay, the PayPal payment page may set its own cookies, which are needed for the payment and governed by PayPal's privacy policy.",
      ],
    },
    {
      h: "8. Your rights",
      body: [
        "At any time you can ask to access your data, have it corrected or deleted, restrict its use, object to its use (in particular to our newsletters, without having to give a reason), receive a copy in a common format, withdraw your consent, and tell us what to do with your data after your death.",
        "To do so, write to us at {email}. We reply within one month. If we have reasonable doubts about your identity, we may ask you to confirm it. Some data cannot be deleted before the end of the periods required by law (section 6).",
        "If you believe your rights are not being respected, you can lodge a complaint with the data protection authority of your country; in France, the CNIL (www.cnil.fr). As our company is established in the United Kingdom, you can also contact the UK authority, the ICO (ico.org.uk).",
      ],
    },
    {
      h: "9. Security",
      body: [
        "The website is fully encrypted (HTTPS), passwords are never stored in plain text, access to data is limited according to each team member's role, and sensitive actions are logged. The administration areas are only accessible to our team.",
      ],
    },
    {
      h: "10. Changes",
      body: [
        "We may update this policy, for example if we add a service or a provider. The date of the last update is shown at the top of this page. In case of a significant change, we will let you know on the website or by e-mail.",
      ],
    },
  ],
  cookieButton: "Manage cookies",
  back: "Back to the website",
};

const es: PrivacyText = {
  meta: "Política de privacidad y cookies",
  reg: "sociedad registrada en el Reino Unido (Companies House) con el n.º {n}",
  kicker: "Lentific · Sus datos",
  title: "Política de privacidad",
  updated: "Última actualización: {date}",
  intro:
    "Esta página explica, de forma sencilla, qué datos personales recogemos cuando utiliza el sitio Lentific, para qué, con quién se comparten, cuánto tiempo los conservamos y cómo ejercer sus derechos. Se aplica a www.lentific.com y a su área de cliente.",
  sections: [
    {
      h: "1. ¿Quién es responsable de sus datos?",
      body: ["El responsable del tratamiento es {controller}. Para cualquier pregunta sobre sus datos o para ejercer sus derechos, escríbanos a {email}."],
    },
    {
      h: "2. Los datos que recogemos",
      body: [
        {
          ul: [
            "Su cuenta: nombre, apellidos, correo electrónico, teléfono, país, idioma y contraseña (guardada únicamente cifrada, nunca en claro).",
            "Su solicitud de financiación o su perfil de inversor: información sobre su proyecto, su situación y su capacidad financiera, así como los justificantes que aporte (por ejemplo documento de identidad, justificantes de ingresos o de domicilio).",
            "Sus pagos: se realizan a través de PayPal. Nunca recibimos los números de su tarjeta ni sus credenciales de PayPal; solo conservamos el importe, la fecha, el concepto y la referencia de la operación.",
            "El formulario de contacto: nombre, correo electrónico, teléfono, proyecto y mensaje.",
            "Nuestros correos informativos: correo electrónico, nombre e idioma.",
            "Sus intercambios con nuestro equipo: mensajes, solicitudes de asistencia y notas de seguimiento de su expediente.",
            "La seguridad: historial de conexiones y de acciones realizadas en las cuentas y los expedientes.",
            "La medición de audiencia del sitio: véase el apartado 7 «Cookies y estadísticas de visitas».",
          ],
        },
      ],
    },
    {
      h: "3. Para qué los utilizamos",
      body: [
        {
          ul: [
            "Crear y gestionar su cuenta, estudiar su solicitud, ponerle en contacto con prestatarios o inversores y hacer el seguimiento de su expediente: es necesario para prestar el servicio que nos solicita.",
            "Verificar su identidad y la de los inversores, prevenir el fraude, el blanqueo de capitales y la financiación del terrorismo y conservar los documentos contables: son obligaciones legales.",
            "Responder a sus mensajes y volver a contactarle cuando nos lo pida mediante el formulario: es necesario para atender su solicitud.",
            "Enviarle nuestros correos informativos y de presentación de la plataforma: con su consentimiento o, para profesionales y clientes, en virtud de nuestro interés legítimo en dar a conocer nuestros servicios. Cada correo incluye un enlace para darse de baja.",
            "Medir y mejorar la audiencia del sitio: de forma anónima para todos los visitantes y de forma más detallada solo si acepta las cookies.",
            "Garantizar la seguridad de la plataforma y de sus datos: es nuestro interés legítimo.",
          ],
        },
        "No tomamos ninguna decisión sobre usted de forma totalmente automatizada: cada expediente lo examina una persona de nuestro equipo.",
      ],
    },
    {
      h: "4. Quién puede acceder a ellos",
      body: [
        {
          ul: [
            "Los miembros autorizados de nuestro equipo (asesores, administradores), cada uno según su función y solo para lo que necesita.",
            "En el marco de una puesta en contacto que usted haya aceptado: solo se comunica la información estrictamente necesaria al prestatario o inversor correspondiente.",
            "Nuestros proveedores técnicos, que actúan únicamente siguiendo nuestras instrucciones: Vercel (alojamiento del sitio), Neon (base de datos, alojada en Fráncfort, Alemania), Resend (envío de correos), PayPal (pagos) y Hostinger (nuestro correo).",
            "Las autoridades, cuando la ley nos obliga.",
          ],
        },
        "No vendemos ni alquilamos sus datos a nadie.",
      ],
    },
    {
      h: "5. Transferencias fuera de la Unión Europea",
      body: [
        "Algunos de nuestros proveedores (en particular Vercel, Resend y PayPal) son empresas estadounidenses y pueden tratar datos fuera de la Unión Europea. Estas transferencias están amparadas por las garantías previstas en el RGPD: cláusulas contractuales tipo de la Comisión Europea o certificación en el «Data Privacy Framework» UE-EE. UU. Nuestra sociedad está establecida en el Reino Unido, que cuenta con una decisión de adecuación de la Comisión Europea: allí sus datos están protegidos a un nivel equivalente al de la Unión Europea. Nuestra base de datos, por su parte, está alojada en la Unión Europea (Fráncfort).",
      ],
    },
    {
      h: "6. Cuánto tiempo los conservamos",
      body: [
        {
          ul: [
            "Cuenta y expediente: durante toda nuestra relación y 5 años después de su fin (obligaciones de prevención del blanqueo y plazos de prescripción).",
            "Justificantes de identidad y de situación: 5 años después del fin de la relación.",
            "Documentos contables y pagos: 10 años, como exige la ley.",
            "Solicitudes recibidas por el formulario de contacto sin continuidad: 3 años después de nuestro último intercambio.",
            "Lista de correos informativos: hasta que se dé de baja y, como máximo, 3 años sin ningún intercambio con usted.",
            "Estadísticas de visitas: 25 meses, y después se eliminan automáticamente.",
          ],
        },
      ],
    },
    {
      h: "7. Cookies y estadísticas de visitas",
      body: [
        "En su primera visita, un banner le permite aceptar o rechazar las cookies de medición de audiencia. Rechazar es tan fácil como aceptar, y puede cambiar de opinión en cualquier momento con el enlace «Gestionar las cookies» al pie de cada página o con el botón de abajo.",
        "Acepte o no, contamos las páginas vistas de forma anónima: página consultada, tiempo, tipo de dispositivo, navegador y país y ciudad aproximados. Nuestro proveedor de alojamiento deduce el país y la ciudad de su dirección IP en el momento de la visita; no guardamos su dirección IP en nuestras bases de datos.",
        "Si acepta, un identificador aleatorio nos permite además reconocer su navegador de una visita a otra y seguir su recorrido por el sitio y las acciones realizadas (clics, formularios enviados, enlaces a otros sitios). Esta información se queda con nosotros: en el sitio no se utiliza ninguna cookie publicitaria ni ninguna herramienta de redes sociales o de agencias de publicidad.",
        {
          table: {
            head: ["Cookie", "Para qué sirve", "Duración", "Su consentimiento"],
            rows: [
              ["lentific_session", "Mantener su sesión en el área de cliente", "30 días", "No necesario (imprescindible)"],
              ["lentific_assist_code", "Mostrar el código de una asistencia remota que usted ha solicitado", "10 minutos", "No necesario (imprescindible)"],
              ["NEXT_LOCALE, NEXT_COUNTRY", "Recordar su idioma y su país", "1 año", "No necesario (imprescindible)"],
              ["lentific_consent", "Recordar su elección sobre las cookies", "6 meses", "No necesario (imprescindible)"],
              ["NEXT_VISITOR_ID", "Reconocer su navegador de una visita a otra (estadísticas)", "13 meses", "Solo si acepta"],
              ["NEXT_VISIT_ID", "Agrupar las páginas de una misma visita (estadísticas)", "30 minutos", "Solo si acepta"],
            ],
          },
        },
        "Cuando paga, la página de pago de PayPal puede instalar sus propias cookies, necesarias para el pago y regidas por la política de privacidad de PayPal.",
      ],
    },
    {
      h: "8. Sus derechos",
      body: [
        "En cualquier momento puede solicitar el acceso a sus datos, su rectificación o supresión, la limitación de su uso, oponerse a su uso (en particular a nuestros correos informativos, sin necesidad de justificarse), recibir una copia en un formato habitual, retirar su consentimiento e indicarnos qué hacer con sus datos tras su fallecimiento.",
        "Para ello, escríbanos a {email}. Le respondemos en el plazo de un mes. Si tenemos dudas razonables sobre su identidad, podremos pedirle que la confirme. Algunos datos no pueden suprimirse antes de que finalicen los plazos exigidos por la ley (apartado 6).",
        "Si considera que no se respetan sus derechos, puede presentar una reclamación ante la autoridad de protección de datos de su país; en España, la AEPD (www.aepd.es); en Francia, la CNIL (www.cnil.fr). Como nuestra sociedad está establecida en el Reino Unido, también puede dirigirse a la autoridad británica, la ICO (ico.org.uk).",
      ],
    },
    {
      h: "9. Seguridad",
      body: [
        "El sitio está totalmente cifrado (HTTPS), las contraseñas nunca se guardan en claro, el acceso a los datos está limitado según la función de cada miembro del equipo y las acciones sensibles quedan registradas. Las áreas de administración solo son accesibles para nuestro equipo.",
      ],
    },
    {
      h: "10. Cambios",
      body: [
        "Podemos actualizar esta política, por ejemplo si añadimos un servicio o un proveedor. La fecha de la última actualización figura en la parte superior de esta página. En caso de cambio importante, se lo comunicaremos en el sitio o por correo electrónico.",
      ],
    },
  ],
  cookieButton: "Gestionar las cookies",
  back: "Volver al sitio",
};

const it: PrivacyText = {
  meta: "Informativa sulla privacy e sui cookie",
  reg: "società registrata nel Regno Unito (Companies House) con il n. {n}",
  kicker: "Lentific · I suoi dati",
  title: "Informativa sulla privacy",
  updated: "Ultimo aggiornamento: {date}",
  intro:
    "Questa pagina spiega, in modo semplice, quali dati personali raccogliamo quando utilizza il sito Lentific, perché, con chi vengono condivisi, per quanto tempo li conserviamo e come esercitare i suoi diritti. Si applica a www.lentific.com e alla sua area clienti.",
  sections: [
    {
      h: "1. Chi è responsabile dei suoi dati?",
      body: ["Il titolare del trattamento è {controller}. Per qualsiasi domanda sui suoi dati o per esercitare i suoi diritti, ci scriva a {email}."],
    },
    {
      h: "2. I dati che raccogliamo",
      body: [
        {
          ul: [
            "Il suo account: nome, cognome, indirizzo e-mail, telefono, paese, lingua e password (conservata solo in forma cifrata, mai in chiaro).",
            "La sua richiesta di finanziamento o il suo profilo di investitore: informazioni sul progetto, sulla sua situazione e capacità finanziaria e i documenti giustificativi che carica (ad esempio documento d'identità, prova del reddito o della residenza).",
            "I suoi pagamenti: sono effettuati tramite PayPal. Non riceviamo mai i numeri della sua carta né le sue credenziali PayPal; conserviamo solo importo, data, causale e riferimento dell'operazione.",
            "Il modulo di contatto: nome, indirizzo e-mail, telefono, progetto e messaggio.",
            "Le nostre e-mail informative: indirizzo e-mail, nome e lingua.",
            "I suoi scambi con il nostro team: messaggi, richieste di assistenza e note di follow-up della sua pratica.",
            "La sicurezza: cronologia degli accessi e delle azioni effettuate su account e pratiche.",
            "La misurazione dell'audience del sito: veda la sezione 7 «Cookie e statistiche delle visite».",
          ],
        },
      ],
    },
    {
      h: "3. Perché li utilizziamo",
      body: [
        {
          ul: [
            "Creare e gestire il suo account, esaminare la sua richiesta, metterla in contatto con richiedenti o investitori e seguire la sua pratica: è necessario per fornire il servizio che ci chiede.",
            "Verificare la sua identità e quella degli investitori, prevenire frodi, riciclaggio di denaro e finanziamento del terrorismo, conservare la documentazione contabile: sono obblighi di legge.",
            "Rispondere ai suoi messaggi e ricontattarla quando ce lo chiede tramite il modulo: è necessario per dare seguito alla sua richiesta.",
            "Inviarle le nostre e-mail informative e di presentazione della piattaforma: con il suo consenso o, per professionisti e clienti, sulla base del nostro legittimo interesse a far conoscere i nostri servizi. Ogni e-mail contiene un link di disiscrizione.",
            "Misurare e migliorare l'audience del sito: in forma anonima per tutti i visitatori e in modo più dettagliato solo se accetta i cookie.",
            "Garantire la sicurezza della piattaforma e dei suoi dati: è il nostro legittimo interesse.",
          ],
        },
        "Non prendiamo alcuna decisione che la riguarda in modo interamente automatizzato: ogni pratica è esaminata da una persona del nostro team.",
      ],
    },
    {
      h: "4. Chi può accedervi",
      body: [
        {
          ul: [
            "I membri autorizzati del nostro team (consulenti, amministratori), ciascuno secondo il proprio ruolo e solo per ciò di cui ha bisogno.",
            "Nell'ambito di una messa in contatto che lei ha accettato: solo le informazioni strettamente necessarie sono comunicate al richiedente o all'investitore interessato.",
            "I nostri fornitori tecnici, che agiscono solo su nostra istruzione: Vercel (hosting del sito), Neon (database, ospitato a Francoforte, Germania), Resend (invio delle e-mail), PayPal (pagamenti) e Hostinger (la nostra casella di posta).",
            "Le autorità, quando la legge lo impone.",
          ],
        },
        "Non vendiamo né cediamo in locazione i suoi dati a nessuno.",
      ],
    },
    {
      h: "5. Trasferimenti al di fuori dell'Unione europea",
      body: [
        "Alcuni dei nostri fornitori (in particolare Vercel, Resend e PayPal) sono società statunitensi e possono trattare dati al di fuori dell'Unione europea. Questi trasferimenti sono coperti dalle garanzie previste dal GDPR: clausole contrattuali tipo della Commissione europea o certificazione al «Data Privacy Framework» UE-USA. La nostra società ha sede nel Regno Unito, che beneficia di una decisione di adeguatezza della Commissione europea: i suoi dati vi sono protetti a un livello equivalente a quello dell'Unione europea. Il nostro database è invece ospitato nell'Unione europea (Francoforte).",
      ],
    },
    {
      h: "6. Per quanto tempo li conserviamo",
      body: [
        {
          ul: [
            "Account e pratica: per tutta la durata del rapporto, poi 5 anni dopo la sua fine (obblighi antiriciclaggio e termini di prescrizione).",
            "Documenti d'identità e giustificativi: 5 anni dopo la fine del rapporto.",
            "Documentazione contabile e pagamenti: 10 anni, come previsto dalla legge.",
            "Richieste ricevute tramite il modulo di contatto senza seguito: 3 anni dopo il nostro ultimo scambio.",
            "Elenco delle e-mail informative: fino alla disiscrizione e al massimo 3 anni senza alcuno scambio con lei.",
            "Statistiche delle visite: 25 mesi, poi cancellazione automatica.",
          ],
        },
      ],
    },
    {
      h: "7. Cookie e statistiche delle visite",
      body: [
        "Alla prima visita, un banner le permette di accettare o rifiutare i cookie di misurazione dell'audience. Rifiutare è facile quanto accettare e può cambiare idea in qualsiasi momento con il link «Gestire i cookie» in fondo a ogni pagina o con il pulsante qui sotto.",
        "Che accetti o no, contiamo le pagine viste in forma anonima: pagina consultata, tempo trascorso, tipo di dispositivo, browser, paese e città approssimativi. Paese e città sono ricavati dal suo indirizzo IP al momento della visita dal nostro fornitore di hosting; non registriamo il suo indirizzo IP nei nostri database.",
        "Se accetta, un identificativo casuale ci permette inoltre di riconoscere il suo browser da una visita all'altra e di seguire il suo percorso sul sito e le azioni compiute (clic, moduli inviati, link verso altri siti). Queste informazioni restano presso di noi: sul sito non è utilizzato alcun cookie pubblicitario né alcuno strumento di social network o concessionarie pubblicitarie.",
        {
          table: {
            head: ["Cookie", "A cosa serve", "Durata", "Il suo consenso"],
            rows: [
              ["lentific_session", "Mantenerla collegata alla sua area clienti", "30 giorni", "Non richiesto (indispensabile)"],
              ["lentific_assist_code", "Mostrare il codice di un'assistenza a distanza da lei richiesta", "10 minuti", "Non richiesto (indispensabile)"],
              ["NEXT_LOCALE, NEXT_COUNTRY", "Ricordare la sua lingua e il suo paese", "1 anno", "Non richiesto (indispensabile)"],
              ["lentific_consent", "Ricordare la sua scelta sui cookie", "6 mesi", "Non richiesto (indispensabile)"],
              ["NEXT_VISITOR_ID", "Riconoscere il suo browser da una visita all'altra (statistiche)", "13 mesi", "Solo se accetta"],
              ["NEXT_VISIT_ID", "Raggruppare le pagine di una stessa visita (statistiche)", "30 minuti", "Solo se accetta"],
            ],
          },
        },
        "Quando paga, la pagina di pagamento PayPal può installare i propri cookie, necessari al pagamento e disciplinati dall'informativa sulla privacy di PayPal.",
      ],
    },
    {
      h: "8. I suoi diritti",
      body: [
        "In qualsiasi momento può chiedere di accedere ai suoi dati, di rettificarli o cancellarli, di limitarne l'uso, di opporsi al loro uso (in particolare alle nostre e-mail informative, senza doverne indicare il motivo), di riceverne una copia in un formato di uso comune, di revocare il consenso e di indicarci cosa fare dei suoi dati dopo il decesso.",
        "Per farlo, ci scriva a {email}. Rispondiamo entro un mese. Se abbiamo ragionevoli dubbi sulla sua identità, potremo chiederle di confermarla. Alcuni dati non possono essere cancellati prima della scadenza dei termini previsti dalla legge (sezione 6).",
        "Se ritiene che i suoi diritti non siano rispettati, può presentare reclamo all'autorità di protezione dei dati del suo paese; in Italia, il Garante per la protezione dei dati personali (www.garanteprivacy.it); in Francia, la CNIL (www.cnil.fr). Poiché la nostra società ha sede nel Regno Unito, può rivolgersi anche all'autorità britannica, l'ICO (ico.org.uk).",
      ],
    },
    {
      h: "9. Sicurezza",
      body: [
        "Il sito è interamente cifrato (HTTPS), le password non sono mai conservate in chiaro, l'accesso ai dati è limitato secondo il ruolo di ciascun membro del team e le azioni sensibili sono registrate. Le aree di amministrazione sono accessibili solo al nostro team.",
      ],
    },
    {
      h: "10. Modifiche",
      body: [
        "Possiamo aggiornare questa informativa, ad esempio se aggiungiamo un servizio o un fornitore. La data dell'ultimo aggiornamento è indicata in cima a questa pagina. In caso di modifiche importanti, la informeremo sul sito o via e-mail.",
      ],
    },
  ],
  cookieButton: "Gestire i cookie",
  back: "Torna al sito",
};

const hu: PrivacyText = {
  meta: "Adatvédelmi és sütikezelési tájékoztató",
  reg: "az Egyesült Királyságban (Companies House) {n} számon bejegyzett társaság",
  kicker: "Lentific · Az Ön adatai",
  title: "Adatvédelmi tájékoztató",
  updated: "Utolsó frissítés: {date}",
  intro:
    "Ez az oldal közérthetően elmagyarázza, milyen személyes adatokat gyűjtünk, amikor Ön a Lentific oldalt használja, miért, kivel osztjuk meg őket, meddig őrizzük, és hogyan gyakorolhatja jogait. A www.lentific.com oldalra és az Ön ügyfélfiókjára vonatkozik.",
  sections: [
    {
      h: "1. Ki felel az Ön adataiért?",
      body: ["Az adatkezelő: {controller}. Az adataival kapcsolatos kérdéseivel vagy jogai gyakorlásához írjon nekünk: {email}."],
    },
    {
      h: "2. Az általunk gyűjtött adatok",
      body: [
        {
          ul: [
            "Fiókja: vezeték- és keresztnév, e-mail-cím, telefonszám, ország, nyelv és jelszó (kizárólag titkosított formában tároljuk, soha nem olvasható formában).",
            "Finanszírozási kérelme vagy befektetői profilja: a projektjére, helyzetére és pénzügyi teherbíró képességére vonatkozó adatok, valamint a feltöltött igazoló dokumentumok (például személyazonosító okmány, jövedelem- vagy lakcímigazolás).",
            "Fizetései: ezeket a PayPal bonyolítja. Kártyaszámát és PayPal-belépési adatait soha nem kapjuk meg; csak a tranzakció összegét, dátumát, tárgyát és azonosítóját őrizzük meg.",
            "A kapcsolatfelvételi űrlap: név, e-mail-cím, telefonszám, projekt és üzenet.",
            "Tájékoztató e-mailjeink: e-mail-cím, keresztnév és nyelv.",
            "Kapcsolattartása csapatunkkal: üzenetek, segítségkérések és az ügyével kapcsolatos feljegyzések.",
            "Biztonság: a bejelentkezések, valamint a fiókokon és ügyeken végzett műveletek naplója.",
            "Az oldal látogatottságának mérése: lásd a 7. pontot („Sütik és látogatási statisztikák”).",
          ],
        },
      ],
    },
    {
      h: "3. Miért használjuk őket",
      body: [
        {
          ul: [
            "Fiókja létrehozása és kezelése, kérelme vizsgálata, hitelfelvevőkkel vagy befektetőkkel való kapcsolatba hozása és ügye nyomon követése: ez az Ön által kért szolgáltatás nyújtásához szükséges.",
            "Az Ön és a befektetők személyazonosságának ellenőrzése, a csalás, a pénzmosás és a terrorizmus finanszírozásának megelőzése, a számviteli bizonylatok megőrzése: ezek jogi kötelezettségek.",
            "Üzeneteinek megválaszolása és visszahívása, ha az űrlapon ezt kéri: ez a kérése teljesítéséhez szükséges.",
            "Tájékoztató és a platformot bemutató e-mailjeink küldése: az Ön hozzájárulásával, illetve szakmai partnerek és ügyfeleink esetében a szolgáltatásaink megismertetéséhez fűződő jogos érdekünk alapján. Minden e-mail tartalmaz leiratkozási linket.",
            "Az oldal látogatottságának mérése és fejlesztése: minden látogató esetében névtelenül, részletesebben pedig csak akkor, ha Ön elfogadja a sütiket.",
            "A platform és az Ön adatainak biztonsága: ez a jogos érdekünk.",
          ],
        },
        "Önt érintő döntést soha nem hozunk kizárólag automatizált módon: minden ügyet csapatunk egy tagja vizsgál meg.",
      ],
    },
    {
      h: "4. Ki férhet hozzá",
      body: [
        {
          ul: [
            "Csapatunk jogosult tagjai (tanácsadók, adminisztrátorok), mindegyikük a szerepköre szerint és csak a feladatához szükséges mértékben.",
            "Az Ön által elfogadott kapcsolatfelvétel keretében: csak a feltétlenül szükséges adatokat adjuk át az érintett hitelfelvevőnek vagy befektetőnek.",
            "Műszaki szolgáltatóink, akik kizárólag a mi utasításaink szerint járnak el: Vercel (az oldal tárhelye), Neon (adatbázis, Frankfurtban, Németországban tárolva), Resend (e-mailek küldése), PayPal (fizetések) és Hostinger (levelezésünk).",
            "A hatóságok, ha ezt jogszabály írja elő.",
          ],
        },
        "Adatait soha senkinek nem adjuk el és nem adjuk bérbe.",
      ],
    },
    {
      h: "5. Adattovábbítás az Európai Unión kívülre",
      body: [
        "Egyes szolgáltatóink (különösen a Vercel, a Resend és a PayPal) amerikai vállalatok, és az Európai Unión kívül is kezelhetnek adatokat. Ezekre a továbbításokra a GDPR által előírt garanciák vonatkoznak: az Európai Bizottság általános szerződési feltételei vagy az EU–USA „Data Privacy Framework” szerinti tanúsítás. Társaságunk az Egyesült Királyságban működik, amelyre az Európai Bizottság megfelelőségi határozata vonatkozik: adatai ott az Európai Unióval egyenértékű védelemben részesülnek. Adatbázisunkat ugyanakkor az Európai Unióban (Frankfurtban) tároljuk.",
      ],
    },
    {
      h: "6. Meddig őrizzük őket",
      body: [
        {
          ul: [
            "Fiók és ügy: kapcsolatunk teljes időtartama alatt, majd annak megszűnése után 5 évig (pénzmosás elleni kötelezettségek és elévülési idők).",
            "Személyazonosító és igazoló dokumentumok: a kapcsolat megszűnése után 5 évig.",
            "Számviteli bizonylatok és fizetések: 10 évig, a jogszabályok szerint.",
            "A kapcsolatfelvételi űrlapon érkezett, folytatás nélküli megkeresések: utolsó kapcsolattartásunk után 3 évig.",
            "Tájékoztató e-mailjeink listája: leiratkozásáig, legfeljebb 3 évig, ha nem volt kapcsolatunk Önnel.",
            "Látogatási statisztikák: 25 hónapig, majd automatikus törlés.",
          ],
        },
      ],
    },
    {
      h: "7. Sütik és látogatási statisztikák",
      body: [
        "Első látogatásakor egy sáv lehetővé teszi, hogy elfogadja vagy elutasítsa a látogatottságmérő sütiket. Az elutasítás ugyanolyan egyszerű, mint az elfogadás, és bármikor meggondolhatja magát az oldalak alján található „Sütik kezelése” linkkel vagy az alábbi gombbal.",
        "Akár elfogadja, akár nem, az oldalmegtekintéseket névtelenül számoljuk: megtekintett oldal, eltöltött idő, eszköz típusa, böngésző, valamint hozzávetőleges ország és város. Az országot és a várost tárhelyszolgáltatónk a látogatás pillanatában az Ön IP-címéből állapítja meg; IP-címét nem tároljuk adatbázisainkban.",
        "Ha elfogadja, egy véletlenszerű azonosító révén ezenfelül felismerjük böngészőjét látogatásról látogatásra, és követjük útját az oldalon, valamint az elvégzett műveleteket (kattintások, elküldött űrlapok, más oldalakra mutató linkek). Ezek az adatok nálunk maradnak: az oldalon nem használunk reklámcélú sütit, sem közösségi hálózatok vagy hirdetési hálózatok eszközeit.",
        {
          table: {
            head: ["Süti", "Mire szolgál", "Időtartam", "Az Ön hozzájárulása"],
            rows: [
              ["lentific_session", "Bejelentkezve tartja az ügyfélfiókjában", "30 nap", "Nem szükséges (nélkülözhetetlen)"],
              ["lentific_assist_code", "Az Ön által kért távsegítség kódjának megjelenítése", "10 perc", "Nem szükséges (nélkülözhetetlen)"],
              ["NEXT_LOCALE, NEXT_COUNTRY", "Megjegyzi nyelvét és országát", "1 év", "Nem szükséges (nélkülözhetetlen)"],
              ["lentific_consent", "Megjegyzi a sütikkel kapcsolatos döntését", "6 hónap", "Nem szükséges (nélkülözhetetlen)"],
              ["NEXT_VISITOR_ID", "Felismeri böngészőjét látogatásról látogatásra (statisztika)", "13 hónap", "Csak ha elfogadja"],
              ["NEXT_VISIT_ID", "Egy látogatás oldalainak csoportosítása (statisztika)", "30 perc", "Csak ha elfogadja"],
            ],
          },
        },
        "Fizetéskor a PayPal fizetési oldala saját sütiket helyezhet el, amelyek a fizetéshez szükségesek, és a PayPal adatvédelmi szabályzata vonatkozik rájuk.",
      ],
    },
    {
      h: "8. Az Ön jogai",
      body: [
        "Bármikor kérheti adataihoz való hozzáférést, azok helyesbítését vagy törlését, kezelésük korlátozását, tiltakozhat kezelésük ellen (különösen tájékoztató e-mailjeink ellen, indoklás nélkül), kérheti adatai másolatát általánosan használt formátumban, visszavonhatja hozzájárulását, és rendelkezhet adatairól halála esetére.",
        "Ehhez írjon nekünk: {email}. Egy hónapon belül válaszolunk. Ha személyazonosságát illetően megalapozott kétségünk merül fel, kérhetjük annak megerősítését. Egyes adatok a jogszabályban előírt határidők lejárta előtt nem törölhetők (6. pont).",
        "Ha úgy véli, hogy jogai sérültek, panaszt tehet országa adatvédelmi hatóságánál; Magyarországon a NAIH-nál (www.naih.hu), Franciaországban a CNIL-nél (www.cnil.fr). Mivel társaságunk az Egyesült Királyságban működik, a brit hatósághoz, az ICO-hoz (ico.org.uk) is fordulhat.",
      ],
    },
    {
      h: "9. Biztonság",
      body: [
        "Az oldal teljes egészében titkosított (HTTPS), a jelszavakat soha nem tároljuk olvasható formában, az adatokhoz való hozzáférés a csapattagok szerepköréhez kötött, az érzékeny műveleteket pedig naplózzuk. Az adminisztrációs felületek csak csapatunk számára érhetők el.",
      ],
    },
    {
      h: "10. Változások",
      body: [
        "Ezt a tájékoztatót frissíthetjük, például ha új szolgáltatást vagy szolgáltatót veszünk igénybe. Az utolsó frissítés dátuma az oldal tetején látható. Jelentős változás esetén az oldalon vagy e-mailben értesítjük.",
      ],
    },
  ],
  cookieButton: "Sütik kezelése",
  back: "Vissza az oldalra",
};

const pt: PrivacyText = {
  meta: "Política de privacidade e de cookies",
  reg: "sociedade registada no Reino Unido (Companies House) sob o n.º {n}",
  kicker: "Lentific · Os seus dados",
  title: "Política de privacidade",
  updated: "Última atualização: {date}",
  intro:
    "Esta página explica, de forma simples, que dados pessoais recolhemos quando utiliza o site Lentific, para quê, com quem são partilhados, durante quanto tempo os conservamos e como exercer os seus direitos. Aplica-se a www.lentific.com e à sua área de cliente.",
  sections: [
    {
      h: "1. Quem é responsável pelos seus dados?",
      body: ["O responsável pelo tratamento é {controller}. Para qualquer questão sobre os seus dados ou para exercer os seus direitos, escreva-nos para {email}."],
    },
    {
      h: "2. Os dados que recolhemos",
      body: [
        {
          ul: [
            "A sua conta: nome, apelido, endereço de e-mail, telefone, país, idioma e palavra-passe (guardada apenas de forma cifrada, nunca em texto legível).",
            "O seu pedido de financiamento ou o seu perfil de investidor: informações sobre o seu projeto, a sua situação e capacidade financeira, bem como os comprovativos que carrega (por exemplo documento de identificação, comprovativos de rendimentos ou de morada).",
            "Os seus pagamentos: são efetuados através do PayPal. Nunca recebemos os números do seu cartão nem as suas credenciais PayPal; conservamos apenas o montante, a data, o objeto e a referência da operação.",
            "O formulário de contacto: nome, endereço de e-mail, telefone, projeto e mensagem.",
            "Os nossos e-mails informativos: endereço de e-mail, nome próprio e idioma.",
            "As suas trocas com a nossa equipa: mensagens, pedidos de assistência e notas de acompanhamento do seu processo.",
            "A segurança: histórico de acessos e de ações realizadas nas contas e nos processos.",
            "A medição de audiência do site: ver a secção 7 «Cookies e estatísticas de visitas».",
          ],
        },
      ],
    },
    {
      h: "3. Para que os utilizamos",
      body: [
        {
          ul: [
            "Criar e gerir a sua conta, analisar o seu pedido, pô-lo em contacto com mutuários ou investidores e acompanhar o seu processo: é necessário para prestar o serviço que nos pede.",
            "Verificar a sua identidade e a dos investidores, prevenir a fraude, o branqueamento de capitais e o financiamento do terrorismo e conservar os documentos contabilísticos: são obrigações legais.",
            "Responder às suas mensagens e voltar a contactá-lo quando nos pede através do formulário: é necessário para dar seguimento ao seu pedido.",
            "Enviar-lhe os nossos e-mails informativos e de apresentação da plataforma: com o seu consentimento ou, para profissionais e clientes, com base no nosso interesse legítimo em dar a conhecer os nossos serviços. Cada e-mail contém uma ligação para cancelar a subscrição.",
            "Medir e melhorar a audiência do site: de forma anónima para todos os visitantes e de forma mais detalhada apenas se aceitar os cookies.",
            "Garantir a segurança da plataforma e dos seus dados: é o nosso interesse legítimo.",
          ],
        },
        "Não tomamos nenhuma decisão sobre si de forma totalmente automatizada: cada processo é analisado por uma pessoa da nossa equipa.",
      ],
    },
    {
      h: "4. Quem pode aceder-lhes",
      body: [
        {
          ul: [
            "Os membros autorizados da nossa equipa (consultores, administradores), cada um segundo a sua função e apenas para o que precisa.",
            "No âmbito de uma apresentação que aceitou: só as informações estritamente necessárias são comunicadas ao mutuário ou investidor em causa.",
            "Os nossos prestadores técnicos, que atuam apenas segundo as nossas instruções: Vercel (alojamento do site), Neon (base de dados, alojada em Frankfurt, na Alemanha), Resend (envio de e-mails), PayPal (pagamentos) e Hostinger (o nosso correio eletrónico).",
            "As autoridades, quando a lei o exige.",
          ],
        },
        "Não vendemos nem alugamos os seus dados a ninguém.",
      ],
    },
    {
      h: "5. Transferências para fora da União Europeia",
      body: [
        "Alguns dos nossos prestadores (em particular Vercel, Resend e PayPal) são empresas norte-americanas e podem tratar dados fora da União Europeia. Estas transferências estão abrangidas pelas garantias previstas no RGPD: cláusulas contratuais-tipo da Comissão Europeia ou certificação no «Data Privacy Framework» UE-EUA. A nossa sociedade está estabelecida no Reino Unido, que beneficia de uma decisão de adequação da Comissão Europeia: os seus dados estão aí protegidos a um nível equivalente ao da União Europeia. A nossa base de dados está, por sua vez, alojada na União Europeia (Frankfurt).",
      ],
    },
    {
      h: "6. Durante quanto tempo os conservamos",
      body: [
        {
          ul: [
            "Conta e processo: durante toda a nossa relação e 5 anos após o seu fim (obrigações de prevenção do branqueamento e prazos de prescrição).",
            "Documentos de identificação e comprovativos: 5 anos após o fim da relação.",
            "Documentos contabilísticos e pagamentos: 10 anos, como exige a lei.",
            "Pedidos recebidos pelo formulário de contacto sem seguimento: 3 anos após a nossa última troca.",
            "Lista de e-mails informativos: até cancelar a subscrição e, no máximo, 3 anos sem qualquer troca consigo.",
            "Estatísticas de visitas: 25 meses, seguidos de eliminação automática.",
          ],
        },
      ],
    },
    {
      h: "7. Cookies e estatísticas de visitas",
      body: [
        "Na sua primeira visita, uma faixa permite-lhe aceitar ou recusar os cookies de medição de audiência. Recusar é tão simples como aceitar, e pode mudar de ideias a qualquer momento através da ligação «Gerir os cookies» no rodapé de cada página ou do botão abaixo.",
        "Quer aceite quer não, contamos as páginas vistas de forma anónima: página consultada, tempo, tipo de dispositivo, navegador e país e cidade aproximados. O país e a cidade são deduzidos do seu endereço IP no momento da visita pelo nosso fornecedor de alojamento; não registamos o seu endereço IP nas nossas bases de dados.",
        "Se aceitar, um identificador aleatório permite-nos ainda reconhecer o seu navegador de uma visita para a outra e acompanhar o seu percurso no site e as ações realizadas (cliques, formulários enviados, ligações para outros sites). Estas informações ficam connosco: não é utilizado no site nenhum cookie publicitário nem nenhuma ferramenta de redes sociais ou de agências de publicidade.",
        {
          table: {
            head: ["Cookie", "Para que serve", "Duração", "O seu consentimento"],
            rows: [
              ["lentific_session", "Manter a sua sessão na área de cliente", "30 dias", "Não necessário (indispensável)"],
              ["lentific_assist_code", "Mostrar o código de uma assistência remota que pediu", "10 minutos", "Não necessário (indispensável)"],
              ["NEXT_LOCALE, NEXT_COUNTRY", "Memorizar o seu idioma e o seu país", "1 ano", "Não necessário (indispensável)"],
              ["lentific_consent", "Memorizar a sua escolha sobre os cookies", "6 meses", "Não necessário (indispensável)"],
              ["NEXT_VISITOR_ID", "Reconhecer o seu navegador de uma visita para a outra (estatísticas)", "13 meses", "Só se aceitar"],
              ["NEXT_VISIT_ID", "Agrupar as páginas de uma mesma visita (estatísticas)", "30 minutos", "Só se aceitar"],
            ],
          },
        },
        "Quando paga, a página de pagamento do PayPal pode instalar os seus próprios cookies, necessários ao pagamento e regidos pela política de privacidade do PayPal.",
      ],
    },
    {
      h: "8. Os seus direitos",
      body: [
        "Pode, a qualquer momento, pedir para aceder aos seus dados, retificá-los ou apagá-los, limitar a sua utilização, opor-se à sua utilização (em particular aos nossos e-mails informativos, sem ter de se justificar), receber uma cópia num formato corrente, retirar o seu consentimento e indicar-nos o que fazer com os seus dados após a sua morte.",
        "Para isso, escreva-nos para {email}. Respondemos no prazo de um mês. Se tivermos dúvidas razoáveis sobre a sua identidade, poderemos pedir-lhe que a confirme. Alguns dados não podem ser apagados antes do fim dos prazos exigidos por lei (secção 6).",
        "Se considerar que os seus direitos não são respeitados, pode apresentar reclamação à autoridade de proteção de dados do seu país; em Portugal, a CNPD (www.cnpd.pt); em França, a CNIL (www.cnil.fr). Como a nossa sociedade está estabelecida no Reino Unido, pode também dirigir-se à autoridade britânica, a ICO (ico.org.uk).",
      ],
    },
    {
      h: "9. Segurança",
      body: [
        "O site está totalmente cifrado (HTTPS), as palavras-passe nunca são guardadas em texto legível, o acesso aos dados é limitado segundo a função de cada membro da equipa e as ações sensíveis são registadas. As áreas de administração só são acessíveis à nossa equipa.",
      ],
    },
    {
      h: "10. Alterações",
      body: [
        "Podemos atualizar esta política, por exemplo se acrescentarmos um serviço ou um prestador. A data da última atualização figura no topo desta página. Em caso de alteração importante, informá-lo-emos no site ou por e-mail.",
      ],
    },
  ],
  cookieButton: "Gerir os cookies",
  back: "Voltar ao site",
};

const de: PrivacyText = {
  meta: "Datenschutz- und Cookie-Richtlinie",
  reg: "eine im Vereinigten Königreich (Companies House) unter der Nummer {n} eingetragene Gesellschaft",
  kicker: "Lentific · Ihre Daten",
  title: "Datenschutzerklärung",
  updated: "Zuletzt aktualisiert: {date}",
  intro:
    "Diese Seite erklärt in einfachen Worten, welche personenbezogenen Daten wir erheben, wenn Sie die Website von Lentific nutzen, wozu, an wen sie weitergegeben werden, wie lange wir sie aufbewahren und wie Sie Ihre Rechte ausüben. Sie gilt für www.lentific.com und Ihren Kundenbereich.",
  sections: [
    {
      h: "1. Wer ist für Ihre Daten verantwortlich?",
      body: ["Verantwortlicher ist {controller}. Bei Fragen zu Ihren Daten oder um Ihre Rechte auszuüben, schreiben Sie uns an {email}."],
    },
    {
      h: "2. Welche Daten wir erheben",
      body: [
        {
          ul: [
            "Ihr Konto: Vor- und Nachname, E-Mail-Adresse, Telefonnummer, Land, Sprache und Passwort (nur verschlüsselt gespeichert, nie im Klartext).",
            "Ihre Finanzierungsanfrage oder Ihr Investorenprofil: Angaben zu Ihrem Vorhaben, Ihrer Situation und finanziellen Leistungsfähigkeit sowie die von Ihnen hochgeladenen Nachweise (z. B. Ausweis, Einkommens- oder Wohnsitznachweis).",
            "Ihre Zahlungen: Sie werden über PayPal abgewickelt. Ihre Kartennummern und PayPal-Zugangsdaten erhalten wir nie; wir speichern nur Betrag, Datum, Zweck und Referenz des Vorgangs.",
            "Das Kontaktformular: Name, E-Mail-Adresse, Telefonnummer, Vorhaben und Nachricht.",
            "Unsere Informations-E-Mails: E-Mail-Adresse, Vorname und Sprache.",
            "Ihr Austausch mit unserem Team: Nachrichten, Hilfeanfragen und Notizen zur Bearbeitung Ihrer Akte.",
            "Sicherheit: Protokoll der Anmeldungen und der Aktionen an Konten und Akten.",
            "Reichweitenmessung der Website: siehe Abschnitt 7 „Cookies und Besuchsstatistiken“.",
          ],
        },
      ],
    },
    {
      h: "3. Wozu wir sie verwenden",
      body: [
        {
          ul: [
            "Ihr Konto einrichten und verwalten, Ihre Anfrage prüfen, Sie mit Kreditnehmern oder Investoren in Kontakt bringen und Ihre Akte betreuen: Dies ist zur Erbringung der von Ihnen gewünschten Leistung erforderlich.",
            "Ihre Identität und die der Investoren prüfen, Betrug, Geldwäsche und Terrorismusfinanzierung verhindern und Buchhaltungsunterlagen aufbewahren: Dies sind gesetzliche Pflichten.",
            "Ihre Nachrichten beantworten und Sie zurückrufen, wenn Sie dies über das Formular wünschen: Dies ist zur Bearbeitung Ihrer Anfrage erforderlich.",
            "Ihnen unsere Informations-E-Mails zur Vorstellung der Plattform senden: mit Ihrer Einwilligung oder, bei Geschäftskunden und unseren Kunden, auf Grundlage unseres berechtigten Interesses, unsere Leistungen bekannt zu machen. Jede E-Mail enthält einen Abmeldelink.",
            "Die Reichweite der Website messen und verbessern: anonym für alle Besucher und detaillierter nur, wenn Sie Cookies akzeptieren.",
            "Die Sicherheit der Plattform und Ihrer Daten gewährleisten: Dies ist unser berechtigtes Interesse.",
          ],
        },
        "Wir treffen keine Entscheidung über Sie ausschließlich automatisiert: Jede Akte wird von einer Person aus unserem Team geprüft.",
      ],
    },
    {
      h: "4. Wer darauf zugreifen kann",
      body: [
        {
          ul: [
            "Berechtigte Mitglieder unseres Teams (Berater, Administratoren), jeweils entsprechend ihrer Rolle und nur im erforderlichen Umfang.",
            "Im Rahmen einer von Ihnen akzeptierten Vermittlung: Nur die unbedingt nötigen Angaben werden an den betreffenden Kreditnehmer oder Investor weitergegeben.",
            "Unsere technischen Dienstleister, die ausschließlich nach unseren Weisungen handeln: Vercel (Hosting der Website), Neon (Datenbank, gehostet in Frankfurt, Deutschland), Resend (E-Mail-Versand), PayPal (Zahlungen) und Hostinger (unser E-Mail-Postfach).",
            "Behörden, wenn wir gesetzlich dazu verpflichtet sind.",
          ],
        },
        "Wir verkaufen oder vermieten Ihre Daten an niemanden.",
      ],
    },
    {
      h: "5. Übermittlungen außerhalb der Europäischen Union",
      body: [
        "Einige unserer Dienstleister (insbesondere Vercel, Resend und PayPal) sind US-Unternehmen und können Daten außerhalb der Europäischen Union verarbeiten. Diese Übermittlungen sind durch die in der DSGVO vorgesehenen Garantien abgesichert: Standardvertragsklauseln der Europäischen Kommission oder Zertifizierung nach dem EU-US „Data Privacy Framework“. Unser Unternehmen hat seinen Sitz im Vereinigten Königreich, für das ein Angemessenheitsbeschluss der Europäischen Kommission gilt: Ihre Daten sind dort auf einem dem der Europäischen Union gleichwertigen Niveau geschützt. Unsere Datenbank selbst wird in der Europäischen Union (Frankfurt) gehostet.",
      ],
    },
    {
      h: "6. Wie lange wir sie aufbewahren",
      body: [
        {
          ul: [
            "Konto und Akte: während der gesamten Geschäftsbeziehung, danach 5 Jahre (Pflichten zur Geldwäscheprävention und Verjährungsfristen).",
            "Identitäts- und sonstige Nachweise: 5 Jahre nach Ende der Geschäftsbeziehung.",
            "Buchhaltungsunterlagen und Zahlungen: 10 Jahre, wie gesetzlich vorgeschrieben.",
            "Anfragen über das Kontaktformular ohne weiteren Verlauf: 3 Jahre nach unserem letzten Austausch.",
            "Verteiler unserer Informations-E-Mails: bis zu Ihrer Abmeldung, höchstens 3 Jahre ohne jeden Austausch mit Ihnen.",
            "Besuchsstatistiken: 25 Monate, danach automatische Löschung.",
          ],
        },
      ],
    },
    {
      h: "7. Cookies und Besuchsstatistiken",
      body: [
        "Bei Ihrem ersten Besuch können Sie in einem Banner Cookies zur Reichweitenmessung akzeptieren oder ablehnen. Ablehnen ist genauso einfach wie Akzeptieren, und Sie können Ihre Entscheidung jederzeit über den Link „Cookies verwalten“ unten auf jeder Seite oder über die Schaltfläche unten ändern.",
        "Ob Sie zustimmen oder nicht: Wir zählen Seitenaufrufe anonym – aufgerufene Seite, Verweildauer, Gerätetyp, Browser sowie ungefähres Land und ungefähre Stadt. Land und Stadt werden zum Zeitpunkt des Besuchs von unserem Hosting-Anbieter aus Ihrer IP-Adresse abgeleitet; Ihre IP-Adresse speichern wir nicht in unseren Datenbanken.",
        "Wenn Sie zustimmen, erlaubt uns eine zufällige Kennung zusätzlich, Ihren Browser von Besuch zu Besuch wiederzuerkennen und Ihren Weg über die Website sowie Ihre Aktionen (Klicks, gesendete Formulare, Links zu anderen Websites) nachzuvollziehen. Diese Informationen bleiben bei uns: Auf der Website werden keine Werbe-Cookies und keine Werkzeuge sozialer Netzwerke oder Werbenetzwerke eingesetzt.",
        {
          table: {
            head: ["Cookie", "Zweck", "Dauer", "Ihre Einwilligung"],
            rows: [
              ["lentific_session", "Sie in Ihrem Kundenbereich angemeldet halten", "30 Tage", "Nicht erforderlich (unbedingt notwendig)"],
              ["lentific_assist_code", "Den Code einer von Ihnen angeforderten Fernhilfe anzeigen", "10 Minuten", "Nicht erforderlich (unbedingt notwendig)"],
              ["NEXT_LOCALE, NEXT_COUNTRY", "Ihre Sprache und Ihr Land speichern", "1 Jahr", "Nicht erforderlich (unbedingt notwendig)"],
              ["lentific_consent", "Ihre Cookie-Auswahl speichern", "6 Monate", "Nicht erforderlich (unbedingt notwendig)"],
              ["NEXT_VISITOR_ID", "Ihren Browser von Besuch zu Besuch wiedererkennen (Statistik)", "13 Monate", "Nur wenn Sie zustimmen"],
              ["NEXT_VISIT_ID", "Die Seiten eines Besuchs zusammenfassen (Statistik)", "30 Minuten", "Nur wenn Sie zustimmen"],
            ],
          },
        },
        "Wenn Sie bezahlen, kann die Zahlungsseite von PayPal eigene Cookies setzen, die für die Zahlung erforderlich sind und der Datenschutzerklärung von PayPal unterliegen.",
      ],
    },
    {
      h: "8. Ihre Rechte",
      body: [
        "Sie können jederzeit Auskunft über Ihre Daten verlangen, sie berichtigen oder löschen lassen, ihre Verarbeitung einschränken, der Verarbeitung widersprechen (insbesondere unseren Informations-E-Mails, ohne Begründung), eine Kopie in einem gängigen Format erhalten, Ihre Einwilligung widerrufen und uns mitteilen, was nach Ihrem Tod mit Ihren Daten geschehen soll.",
        "Schreiben Sie uns dazu an {email}. Wir antworten innerhalb eines Monats. Bei begründeten Zweifeln an Ihrer Identität können wir Sie bitten, diese zu bestätigen. Manche Daten dürfen vor Ablauf der gesetzlichen Fristen nicht gelöscht werden (Abschnitt 6).",
        "Wenn Sie der Ansicht sind, dass Ihre Rechte nicht gewahrt werden, können Sie sich bei der Datenschutzaufsichtsbehörde Ihres Landes beschweren; in Frankreich bei der CNIL (www.cnil.fr). Da unser Unternehmen seinen Sitz im Vereinigten Königreich hat, können Sie sich auch an die britische Behörde ICO (ico.org.uk) wenden.",
      ],
    },
    {
      h: "9. Sicherheit",
      body: [
        "Die Website ist vollständig verschlüsselt (HTTPS), Passwörter werden nie im Klartext gespeichert, der Zugriff auf Daten ist nach der Rolle jedes Teammitglieds beschränkt und sensible Aktionen werden protokolliert. Die Verwaltungsbereiche sind nur unserem Team zugänglich.",
      ],
    },
    {
      h: "10. Änderungen",
      body: [
        "Wir können diese Erklärung aktualisieren, zum Beispiel wenn wir einen Dienst oder Dienstleister hinzufügen. Das Datum der letzten Aktualisierung steht oben auf dieser Seite. Bei wesentlichen Änderungen informieren wir Sie auf der Website oder per E-Mail.",
      ],
    },
  ],
  cookieButton: "Cookies verwalten",
  back: "Zurück zur Website",
};

const nl: PrivacyText = {
  meta: "Privacy- en cookiebeleid",
  reg: "een vennootschap ingeschreven in het Verenigd Koninkrijk (Companies House) onder nummer {n}",
  kicker: "Lentific · Uw gegevens",
  title: "Privacybeleid",
  updated: "Laatst bijgewerkt: {date}",
  intro:
    "Deze pagina legt eenvoudig uit welke persoonsgegevens wij verzamelen wanneer u de website van Lentific gebruikt, waarom, met wie ze worden gedeeld, hoe lang we ze bewaren en hoe u uw rechten uitoefent. Ze geldt voor www.lentific.com en voor uw klantomgeving.",
  sections: [
    {
      h: "1. Wie is verantwoordelijk voor uw gegevens?",
      body: ["De verwerkingsverantwoordelijke is {controller}. Voor vragen over uw gegevens of om uw rechten uit te oefenen, schrijft u ons op {email}."],
    },
    {
      h: "2. De gegevens die wij verzamelen",
      body: [
        {
          ul: [
            "Uw account: voor- en achternaam, e-mailadres, telefoonnummer, land, taal en wachtwoord (alleen versleuteld opgeslagen, nooit leesbaar).",
            "Uw financieringsaanvraag of investeerdersprofiel: informatie over uw project, uw situatie en financiële draagkracht, en de bewijsstukken die u uploadt (bijvoorbeeld identiteitsbewijs, inkomens- of adresbewijs).",
            "Uw betalingen: deze verlopen via PayPal. Wij ontvangen nooit uw kaartnummers of PayPal-inloggegevens; we bewaren alleen het bedrag, de datum, het doel en de referentie van de transactie.",
            "Het contactformulier: naam, e-mailadres, telefoonnummer, project en bericht.",
            "Onze informatieve e-mails: e-mailadres, voornaam en taal.",
            "Uw contact met ons team: berichten, hulpvragen en notities bij de opvolging van uw dossier.",
            "Beveiliging: overzicht van aanmeldingen en van handelingen op accounts en dossiers.",
            "Bezoekersmeting van de website: zie deel 7 „Cookies en bezoekstatistieken”.",
          ],
        },
      ],
    },
    {
      h: "3. Waarom wij ze gebruiken",
      body: [
        {
          ul: [
            "Uw account aanmaken en beheren, uw aanvraag beoordelen, u in contact brengen met kredietnemers of investeerders en uw dossier opvolgen: dit is nodig om de dienst te leveren die u vraagt.",
            "Uw identiteit en die van investeerders controleren, fraude, witwassen en terrorismefinanciering voorkomen en de boekhouding bewaren: dit zijn wettelijke verplichtingen.",
            "Uw berichten beantwoorden en u terugbellen wanneer u daarom vraagt via het formulier: dit is nodig om uw verzoek af te handelen.",
            "U onze informatieve e-mails over het platform sturen: met uw toestemming of, voor professionals en klanten, op basis van ons gerechtvaardigd belang om onze diensten bekend te maken. Elke e-mail bevat een afmeldlink.",
            "Het bezoek aan de website meten en verbeteren: anoniem voor alle bezoekers, en gedetailleerder alleen als u cookies accepteert.",
            "De beveiliging van het platform en uw gegevens waarborgen: dit is ons gerechtvaardigd belang.",
          ],
        },
        "Wij nemen geen enkel besluit over u volledig geautomatiseerd: elk dossier wordt bekeken door iemand van ons team.",
      ],
    },
    {
      h: "4. Wie er toegang toe heeft",
      body: [
        {
          ul: [
            "Bevoegde leden van ons team (adviseurs, beheerders), elk volgens zijn rol en alleen voor wat nodig is.",
            "In het kader van een kennismaking die u hebt aanvaard: alleen de strikt noodzakelijke informatie wordt gedeeld met de betrokken kredietnemer of investeerder.",
            "Onze technische dienstverleners, die uitsluitend volgens onze instructies handelen: Vercel (hosting van de website), Neon (database, gehost in Frankfurt, Duitsland), Resend (verzending van e-mails), PayPal (betalingen) en Hostinger (onze mailbox).",
            "De autoriteiten, wanneer de wet ons daartoe verplicht.",
          ],
        },
        "Wij verkopen of verhuren uw gegevens aan niemand.",
      ],
    },
    {
      h: "5. Doorgifte buiten de Europese Unie",
      body: [
        "Sommige van onze dienstverleners (met name Vercel, Resend en PayPal) zijn Amerikaanse bedrijven en kunnen gegevens buiten de Europese Unie verwerken. Deze doorgiften vallen onder de waarborgen van de AVG: standaardcontractbepalingen van de Europese Commissie of certificering onder het EU-VS „Data Privacy Framework”. Onze vennootschap is gevestigd in het Verenigd Koninkrijk, waarvoor een adequaatheidsbesluit van de Europese Commissie geldt: uw gegevens worden daar beschermd op een niveau dat gelijkwaardig is aan dat van de Europese Unie. Onze database zelf wordt gehost in de Europese Unie (Frankfurt).",
      ],
    },
    {
      h: "6. Hoe lang wij ze bewaren",
      body: [
        {
          ul: [
            "Account en dossier: zolang onze relatie duurt, en daarna 5 jaar (verplichtingen ter voorkoming van witwassen en verjaringstermijnen).",
            "Identiteits- en bewijsstukken: 5 jaar na het einde van de relatie.",
            "Boekhoudstukken en betalingen: 10 jaar, zoals de wet vereist.",
            "Aanvragen via het contactformulier zonder vervolg: 3 jaar na ons laatste contact.",
            "Lijst voor onze informatieve e-mails: tot u zich afmeldt, en maximaal 3 jaar zonder enig contact met u.",
            "Bezoekstatistieken: 25 maanden, daarna automatische verwijdering.",
          ],
        },
      ],
    },
    {
      h: "7. Cookies en bezoekstatistieken",
      body: [
        "Bij uw eerste bezoek kunt u via een banner cookies voor bezoekersmeting accepteren of weigeren. Weigeren is even eenvoudig als accepteren, en u kunt uw keuze altijd wijzigen via de link „Cookies beheren” onderaan elke pagina of via de knop hieronder.",
        "Of u nu accepteert of niet, wij tellen paginaweergaven anoniem: bekeken pagina, bestede tijd, type apparaat, browser en het bij benadering bepaalde land en de stad. Land en stad worden op het moment van het bezoek door onze hostingprovider afgeleid uit uw IP-adres; wij slaan uw IP-adres niet op in onze databases.",
        "Als u accepteert, kunnen wij met een willekeurige code bovendien uw browser van bezoek tot bezoek herkennen en uw route op de site en uw handelingen volgen (klikken, verzonden formulieren, links naar andere sites). Deze informatie blijft bij ons: op de site worden geen advertentiecookies en geen tools van sociale netwerken of advertentienetwerken gebruikt.",
        {
          table: {
            head: ["Cookie", "Waarvoor", "Duur", "Uw toestemming"],
            rows: [
              ["lentific_session", "U aangemeld houden in uw klantomgeving", "30 dagen", "Niet nodig (noodzakelijk)"],
              ["lentific_assist_code", "De code tonen van hulp op afstand die u hebt aangevraagd", "10 minuten", "Niet nodig (noodzakelijk)"],
              ["NEXT_LOCALE, NEXT_COUNTRY", "Uw taal en land onthouden", "1 jaar", "Niet nodig (noodzakelijk)"],
              ["lentific_consent", "Uw cookiekeuze onthouden", "6 maanden", "Niet nodig (noodzakelijk)"],
              ["NEXT_VISITOR_ID", "Uw browser van bezoek tot bezoek herkennen (statistieken)", "13 maanden", "Alleen als u accepteert"],
              ["NEXT_VISIT_ID", "De pagina's van één bezoek groeperen (statistieken)", "30 minuten", "Alleen als u accepteert"],
            ],
          },
        },
        "Wanneer u betaalt, kan de betaalpagina van PayPal eigen cookies plaatsen die nodig zijn voor de betaling en onder het privacybeleid van PayPal vallen.",
      ],
    },
    {
      h: "8. Uw rechten",
      body: [
        "U kunt op elk moment vragen om inzage in uw gegevens, ze laten corrigeren of verwijderen, het gebruik ervan beperken, bezwaar maken tegen het gebruik (met name tegen onze informatieve e-mails, zonder opgave van redenen), een kopie in een gangbaar formaat ontvangen, uw toestemming intrekken en ons laten weten wat er na uw overlijden met uw gegevens moet gebeuren.",
        "Schrijf ons daarvoor op {email}. Wij antwoorden binnen een maand. Als wij redelijke twijfel hebben over uw identiteit, kunnen wij u vragen die te bevestigen. Sommige gegevens kunnen niet worden verwijderd vóór het einde van de wettelijke termijnen (deel 6).",
        "Als u vindt dat uw rechten niet worden gerespecteerd, kunt u een klacht indienen bij de gegevensbeschermingsautoriteit van uw land; in Nederland de Autoriteit Persoonsgegevens (www.autoriteitpersoonsgegevens.nl), in België de Gegevensbeschermingsautoriteit (www.gegevensbeschermingsautoriteit.be), in Frankrijk de CNIL (www.cnil.fr). Omdat onze vennootschap in het Verenigd Koninkrijk is gevestigd, kunt u zich ook tot de Britse autoriteit wenden, de ICO (ico.org.uk).",
      ],
    },
    {
      h: "9. Beveiliging",
      body: [
        "De website is volledig versleuteld (HTTPS), wachtwoorden worden nooit leesbaar bewaard, de toegang tot gegevens is beperkt volgens de rol van elk teamlid en gevoelige handelingen worden vastgelegd. De beheeromgevingen zijn alleen toegankelijk voor ons team.",
      ],
    },
    {
      h: "10. Wijzigingen",
      body: [
        "Wij kunnen dit beleid bijwerken, bijvoorbeeld als we een dienst of dienstverlener toevoegen. De datum van de laatste wijziging staat bovenaan deze pagina. Bij een belangrijke wijziging laten wij het u weten via de website of per e-mail.",
      ],
    },
  ],
  cookieButton: "Cookies beheren",
  back: "Terug naar de website",
};

export const PRIVACY: Record<string, PrivacyText> = { fr, en, es, it, hu, pt, de, nl };
