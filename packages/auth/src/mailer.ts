/**
 * Envoi d'e-mails transactionnels (demande produit 2026-11-14).
 *
 * Chaque e-mail est TOUJOURS journalisé dans OutboundEmail, puis :
 *  - si RESEND_API_KEY et EMAIL_FROM sont définis → envoi réel via l'API
 *    Resend (status SENT, ou FAILED avec le message d'erreur) ;
 *  - sinon → status LOCAL : rien ne part, l'e-mail est lisible dans le
 *    back-office (onglet « E-mails envoyés »), ce qui permet de tester tout
 *    le parcours en local sans fournisseur.
 * Pour changer de fournisseur plus tard : remplacer deliver() uniquement.
 */
import { outboundEmailsRepo } from "@fintech/database";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  kind: string;
  userId?: string | null;
}

async function deliver(msg: EmailMessage): Promise<{ status: "LOCAL" | "SENT" | "FAILED"; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { status: "LOCAL" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html }),
    });
    if (!res.ok) return { status: "FAILED", error: `${res.status} ${await res.text()}`.slice(0, 500) };
    return { status: "SENT" };
  } catch (error) {
    return { status: "FAILED", error: String(error).slice(0, 500) };
  }
}

/** N'échoue jamais : un e-mail raté ne doit pas casser une inscription ou une validation. */
export async function sendEmail(msg: EmailMessage) {
  const result = await deliver(msg);
  if (result.status === "LOCAL") {
    console.log(`[mailer] (local, non envoyé) ${msg.kind} → ${msg.to} : ${msg.subject}`);
  } else if (result.status === "FAILED") {
    console.error(`[mailer] échec d'envoi ${msg.kind} → ${msg.to} : ${result.error}`);
  }
  await outboundEmailsRepo.create({ ...msg, status: result.status, error: result.error ?? null });
  return result;
}

// ---------------------------------------------------------------------------
// Gabarits des e-mails de compte, dans la langue préférée de l'utilisateur
// ---------------------------------------------------------------------------

type Locale = "fr" | "en" | "es" | "it" | "hu" | "pt" | "de" | "nl";

interface AccountEmailTexts {
  hello: (name: string) => string;
  verifySubject: string;
  verifyBody: string;
  verifyButton: string;
  verifyExpiry: string;
  verifyIgnore: string;
  approvedSubject: string;
  approvedBody: string;
  approvedButton: string;
  rejectedSubject: string;
  rejectedBody: string;
  rejectedReason: string;
  signature: string;
}

const TEXTS: Record<Locale, AccountEmailTexts> = {
  fr: {
    hello: (n) => `Bonjour ${n},`,
    verifySubject: "Confirmez votre adresse e-mail – SODIVA CREDITS",
    verifyBody: "Merci pour votre inscription sur SODIVA CREDITS. Pour confirmer que cette adresse e-mail est bien la vôtre, cliquez sur le bouton ci-dessous.",
    verifyButton: "Confirmer mon adresse e-mail",
    verifyExpiry: "Ce lien est valable 48 heures. Une fois votre adresse confirmée, un administrateur examinera votre inscription avant d'activer votre compte.",
    verifyIgnore: "Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet e-mail.",
    approvedSubject: "Votre compte SODIVA CREDITS est activé",
    approvedBody: "Bonne nouvelle : un administrateur a validé votre inscription. Vous pouvez dès maintenant vous connecter et accéder à votre espace.",
    approvedButton: "Accéder à mon espace",
    rejectedSubject: "Votre inscription sur SODIVA CREDITS",
    rejectedBody: "Après examen, nous ne sommes pas en mesure de valider votre inscription pour le moment.",
    rejectedReason: "Motif :",
    signature: "L'équipe SODIVA CREDITS",
  },
  en: {
    hello: (n) => `Hello ${n},`,
    verifySubject: "Confirm your email address – SODIVA CREDITS",
    verifyBody: "Thank you for signing up to SODIVA CREDITS. To confirm that this email address belongs to you, click the button below.",
    verifyButton: "Confirm my email address",
    verifyExpiry: "This link is valid for 48 hours. Once your address is confirmed, an administrator will review your registration before activating your account.",
    verifyIgnore: "If you did not sign up, simply ignore this email.",
    approvedSubject: "Your SODIVA CREDITS account is active",
    approvedBody: "Good news: an administrator has approved your registration. You can now sign in and access your account.",
    approvedButton: "Go to my account",
    rejectedSubject: "Your SODIVA CREDITS registration",
    rejectedBody: "After review, we are unable to approve your registration at this time.",
    rejectedReason: "Reason:",
    signature: "The SODIVA CREDITS team",
  },
  es: {
    hello: (n) => `Hola ${n}:`,
    verifySubject: "Confirma tu dirección de correo – SODIVA CREDITS",
    verifyBody: "Gracias por registrarte en SODIVA CREDITS. Para confirmar que esta dirección de correo es tuya, haz clic en el botón de abajo.",
    verifyButton: "Confirmar mi correo",
    verifyExpiry: "Este enlace es válido durante 48 horas. Una vez confirmada tu dirección, un administrador revisará tu registro antes de activar tu cuenta.",
    verifyIgnore: "Si no te has registrado, ignora este correo.",
    approvedSubject: "Tu cuenta de SODIVA CREDITS está activada",
    approvedBody: "Buenas noticias: un administrador ha validado tu registro. Ya puedes iniciar sesión y acceder a tu espacio.",
    approvedButton: "Acceder a mi espacio",
    rejectedSubject: "Tu registro en SODIVA CREDITS",
    rejectedBody: "Tras revisarlo, no podemos validar tu registro por el momento.",
    rejectedReason: "Motivo:",
    signature: "El equipo de SODIVA CREDITS",
  },
  it: {
    hello: (n) => `Ciao ${n},`,
    verifySubject: "Conferma il tuo indirizzo e-mail – SODIVA CREDITS",
    verifyBody: "Grazie per esserti registrato su SODIVA CREDITS. Per confermare che questo indirizzo e-mail è tuo, clicca sul pulsante qui sotto.",
    verifyButton: "Conferma il mio indirizzo e-mail",
    verifyExpiry: "Il link è valido 48 ore. Una volta confermato l'indirizzo, un amministratore esaminerà la tua registrazione prima di attivare l'account.",
    verifyIgnore: "Se non sei stato tu a registrarti, ignora questa e-mail.",
    approvedSubject: "Il tuo account SODIVA CREDITS è attivo",
    approvedBody: "Buone notizie: un amministratore ha approvato la tua registrazione. Ora puoi accedere al tuo spazio.",
    approvedButton: "Vai al mio spazio",
    rejectedSubject: "La tua registrazione su SODIVA CREDITS",
    rejectedBody: "Dopo l'esame, al momento non possiamo approvare la tua registrazione.",
    rejectedReason: "Motivo:",
    signature: "Il team SODIVA CREDITS",
  },
  hu: {
    hello: (n) => `Kedves ${n}!`,
    verifySubject: "Erősítse meg e-mail-címét – SODIVA CREDITS",
    verifyBody: "Köszönjük, hogy regisztrált a SODIVA CREDITS oldalán. Kattintson az alábbi gombra annak megerősítéséhez, hogy ez az e-mail-cím az Öné.",
    verifyButton: "E-mail-cím megerősítése",
    verifyExpiry: "A link 48 óráig érvényes. A cím megerősítése után egy adminisztrátor átnézi a regisztrációját, mielőtt aktiválja a fiókját.",
    verifyIgnore: "Ha nem Ön regisztrált, hagyja figyelmen kívül ezt az e-mailt.",
    approvedSubject: "SODIVA CREDITS-fiókja aktív",
    approvedBody: "Jó hír: egy adminisztrátor jóváhagyta a regisztrációját. Most már bejelentkezhet a fiókjába.",
    approvedButton: "Tovább a fiókomhoz",
    rejectedSubject: "SODIVA CREDITS-regisztrációja",
    rejectedBody: "Az átvizsgálás után jelenleg nem tudjuk jóváhagyni a regisztrációját.",
    rejectedReason: "Indoklás:",
    signature: "A SODIVA CREDITS csapata",
  },
  pt: {
    hello: (n) => `Olá ${n},`,
    verifySubject: "Confirme o seu endereço de e-mail – SODIVA CREDITS",
    verifyBody: "Obrigado por se registar na SODIVA CREDITS. Para confirmar que este endereço de e-mail é seu, clique no botão abaixo.",
    verifyButton: "Confirmar o meu e-mail",
    verifyExpiry: "Este link é válido durante 48 horas. Depois de confirmado o endereço, um administrador analisará o seu registo antes de ativar a conta.",
    verifyIgnore: "Se não fez este registo, ignore este e-mail.",
    approvedSubject: "A sua conta SODIVA CREDITS está ativa",
    approvedBody: "Boas notícias: um administrador validou o seu registo. Já pode iniciar sessão e aceder ao seu espaço.",
    approvedButton: "Aceder ao meu espaço",
    rejectedSubject: "O seu registo na SODIVA CREDITS",
    rejectedBody: "Após análise, não podemos validar o seu registo de momento.",
    rejectedReason: "Motivo:",
    signature: "A equipa SODIVA CREDITS",
  },
  de: {
    hello: (n) => `Hallo ${n},`,
    verifySubject: "Bestätigen Sie Ihre E-Mail-Adresse – SODIVA CREDITS",
    verifyBody: "Vielen Dank für Ihre Registrierung bei SODIVA CREDITS. Klicken Sie auf die Schaltfläche unten, um zu bestätigen, dass diese E-Mail-Adresse Ihnen gehört.",
    verifyButton: "E-Mail-Adresse bestätigen",
    verifyExpiry: "Dieser Link ist 48 Stunden gültig. Nach der Bestätigung prüft ein Administrator Ihre Registrierung, bevor Ihr Konto freigeschaltet wird.",
    verifyIgnore: "Falls Sie sich nicht registriert haben, ignorieren Sie diese E-Mail einfach.",
    approvedSubject: "Ihr SODIVA CREDITS-Konto ist freigeschaltet",
    approvedBody: "Gute Nachricht: Ein Administrator hat Ihre Registrierung bestätigt. Sie können sich jetzt anmelden.",
    approvedButton: "Zu meinem Konto",
    rejectedSubject: "Ihre Registrierung bei SODIVA CREDITS",
    rejectedBody: "Nach Prüfung können wir Ihre Registrierung derzeit leider nicht bestätigen.",
    rejectedReason: "Grund:",
    signature: "Ihr SODIVA CREDITS-Team",
  },
  nl: {
    hello: (n) => `Hallo ${n},`,
    verifySubject: "Bevestig je e-mailadres – SODIVA CREDITS",
    verifyBody: "Bedankt voor je registratie bij SODIVA CREDITS. Klik op de knop hieronder om te bevestigen dat dit e-mailadres van jou is.",
    verifyButton: "Mijn e-mailadres bevestigen",
    verifyExpiry: "Deze link is 48 uur geldig. Zodra je adres is bevestigd, beoordeelt een beheerder je registratie voordat je account wordt geactiveerd.",
    verifyIgnore: "Heb je je niet geregistreerd? Negeer deze e-mail dan.",
    approvedSubject: "Je SODIVA CREDITS-account is geactiveerd",
    approvedBody: "Goed nieuws: een beheerder heeft je registratie goedgekeurd. Je kunt nu inloggen.",
    approvedButton: "Naar mijn account",
    rejectedSubject: "Je registratie bij SODIVA CREDITS",
    rejectedBody: "Na beoordeling kunnen we je registratie op dit moment niet goedkeuren.",
    rejectedReason: "Reden:",
    signature: "Het SODIVA CREDITS-team",
  },
};

function textsFor(locale: string | null | undefined): AccountEmailTexts {
  return TEXTS[(locale ?? "fr") as Locale] ?? TEXTS.fr;
}

export function webBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Mise en page commune, compatible avec les clients e-mail (tableaux + styles en ligne). */
function layout(paragraphs: string[], button?: { label: string; url: string }, signature = "", footnote = "") {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#1f2433">${p}</p>`).join("");
  const btn = button
    ? `<p style="margin:24px 0"><a href="${button.url}" style="display:inline-block;background:#2F5D46;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px;font-size:15px">${escapeHtml(button.label)}</a></p>
       <p style="margin:0 0 16px;font-size:12px;color:#6b7080;word-break:break-all">${button.url}</p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#F4F1EA;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EA;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:32px">
<tr><td>
<p style="margin:0 0 24px;font-size:13px;font-weight:700;letter-spacing:2px;color:#2F5D46">SODIVA CREDITS</p>
${body}${btn}
${footnote ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#6b7080">${footnote}</p>` : ""}
<p style="margin:24px 0 0;font-size:14px;color:#1f2433">${escapeHtml(signature)}</p>
</td></tr></table></td></tr></table></body></html>`;
}

interface Recipient {
  id: string;
  email: string;
  name: string | null;
  preferredLocale: string | null;
}

export function sendVerifyEmail(user: Recipient, verifyUrl: string) {
  const t = textsFor(user.preferredLocale);
  const name = user.name ?? user.email;
  const text = [t.hello(name), "", t.verifyBody, "", verifyUrl, "", t.verifyExpiry, t.verifyIgnore, "", t.signature].join("\n");
  const html = layout(
    [escapeHtml(t.hello(name)), escapeHtml(t.verifyBody)],
    { label: t.verifyButton, url: verifyUrl },
    t.signature,
    `${escapeHtml(t.verifyExpiry)}<br>${escapeHtml(t.verifyIgnore)}`
  );
  return sendEmail({ to: user.email, subject: t.verifySubject, text, html, kind: "account.verify_email", userId: user.id });
}

export function sendAccountApprovedEmail(user: Recipient) {
  const t = textsFor(user.preferredLocale);
  const name = user.name ?? user.email;
  const url = `${webBaseUrl()}/login`;
  const text = [t.hello(name), "", t.approvedBody, "", url, "", t.signature].join("\n");
  const html = layout([escapeHtml(t.hello(name)), escapeHtml(t.approvedBody)], { label: t.approvedButton, url }, t.signature);
  return sendEmail({ to: user.email, subject: t.approvedSubject, text, html, kind: "account.approved", userId: user.id });
}

export function sendAccountRejectedEmail(user: Recipient, reason: string) {
  const t = textsFor(user.preferredLocale);
  const name = user.name ?? user.email;
  const text = [t.hello(name), "", t.rejectedBody, `${t.rejectedReason} ${reason}`, "", t.signature].join("\n");
  const html = layout(
    [escapeHtml(t.hello(name)), escapeHtml(t.rejectedBody), `<strong>${escapeHtml(t.rejectedReason)}</strong> ${escapeHtml(reason)}`],
    undefined,
    t.signature
  );
  return sendEmail({ to: user.email, subject: t.rejectedSubject, text, html, kind: "account.rejected", userId: user.id });
}

// ---------------------------------------------------------------------------
// Avis « nouveau message / demande dans votre espace » (demande produit
// 2026-11-14) : envoyé à CHAQUE envoi de l'équipe vers un client. Volontairement
// sans le contenu du message : le client le lit dans son espace sécurisé (un
// e-mail peut être intercepté ou imité ; on n'y met ni montant ni pièce).
// ---------------------------------------------------------------------------

export type ClientNoticeKind = "message" | "document" | "payment";

type NoticeTexts = {
  subject: Record<ClientNoticeKind, string>;
  body: Record<ClientNoticeKind, (sender: string) => string>;
  button: string;
  safety: string;
};

const NOTICE_TEXTS: Record<Locale, NoticeTexts> = {
  fr: {
    subject: { message: "Nouveau message dans votre espace client", document: "Un document vous est demandé", payment: "Nouvelle demande de paiement dans votre espace" },
    body: {
      message: (s) => `${s} vous a envoyé un message. Connectez-vous à votre espace client pour le lire, dans la rubrique « Messages ».`,
      document: (s) => `${s} vous demande un document pour avancer sur votre dossier. Connectez-vous à votre espace client pour l'envoyer, dans la rubrique « Mes documents ».`,
      payment: (s) => `${s} vous a adressé une demande de paiement. Retrouvez le détail dans votre espace client, rubrique « Paiements ».`,
    },
    button: "Ouvrir mon espace client",
    safety: "Par sécurité, cet e-mail ne contient aucun détail. Nous ne vous demanderons jamais vos identifiants ni de payer vers un compte communiqué par e-mail.",
  },
  en: {
    subject: { message: "New message in your client space", document: "A document is requested from you", payment: "New payment request in your client space" },
    body: {
      message: (s) => `${s} has sent you a message. Sign in to your client space to read it, under "Messages".`,
      document: (s) => `${s} needs a document from you to move your file forward. Sign in to your client space to send it, under "My documents".`,
      payment: (s) => `${s} has sent you a payment request. See the details in your client space, under "Payments".`,
    },
    button: "Open my client space",
    safety: "For your security, this e-mail contains no details. We will never ask for your login details or for a payment to an account given by e-mail.",
  },
  es: {
    subject: { message: "Nuevo mensaje en su espacio de cliente", document: "Se le solicita un documento", payment: "Nueva solicitud de pago en su espacio" },
    body: {
      message: (s) => `${s} le ha enviado un mensaje. Inicie sesión en su espacio de cliente para leerlo, en «Mensajes».`,
      document: (s) => `${s} necesita un documento para avanzar con su expediente. Inicie sesión en su espacio de cliente para enviarlo, en «Mis documentos».`,
      payment: (s) => `${s} le ha enviado una solicitud de pago. Consulte el detalle en su espacio de cliente, en «Pagos».`,
    },
    button: "Abrir mi espacio de cliente",
    safety: "Por seguridad, este correo no contiene ningún detalle. Nunca le pediremos sus credenciales ni un pago a una cuenta comunicada por correo.",
  },
  it: {
    subject: { message: "Nuovo messaggio nella vostra area clienti", document: "Vi è richiesto un documento", payment: "Nuova richiesta di pagamento nella vostra area" },
    body: {
      message: (s) => `${s} vi ha inviato un messaggio. Accedete alla vostra area clienti per leggerlo, nella sezione «Messaggi».`,
      document: (s) => `${s} ha bisogno di un documento per far avanzare la pratica. Accedete alla vostra area clienti per inviarlo, nella sezione «I miei documenti».`,
      payment: (s) => `${s} vi ha inviato una richiesta di pagamento. Trovate i dettagli nella vostra area clienti, sezione «Pagamenti».`,
    },
    button: "Aprire la mia area clienti",
    safety: "Per sicurezza, questa e-mail non contiene dettagli. Non vi chiederemo mai le credenziali né un pagamento su un conto comunicato per e-mail.",
  },
  hu: {
    subject: { message: "Új üzenet az ügyfélfelületén", document: "Dokumentumot kérünk Öntől", payment: "Új fizetési kérés az ügyfélfelületén" },
    body: {
      message: (s) => `${s} üzenetet küldött Önnek. Jelentkezzen be az ügyfélfelületére az elolvasásához, az „Üzenetek” menüpontban.`,
      document: (s) => `${s} egy dokumentumot kér az ügye továbbviteléhez. Jelentkezzen be az ügyfélfelületére a feltöltéshez, a „Dokumentumaim” menüpontban.`,
      payment: (s) => `${s} fizetési kérést küldött Önnek. A részleteket az ügyfélfelületén, a „Fizetések” menüpontban találja.`,
    },
    button: "Ügyfélfelület megnyitása",
    safety: "Biztonsági okokból ez az e-mail nem tartalmaz részleteket. Soha nem kérjük a belépési adatait, sem e-mailben megadott számlára történő fizetést.",
  },
  pt: {
    subject: { message: "Nova mensagem no seu espaço de cliente", document: "É-lhe pedido um documento", payment: "Novo pedido de pagamento no seu espaço" },
    body: {
      message: (s) => `${s} enviou-lhe uma mensagem. Inicie sessão no seu espaço de cliente para a ler, em «Mensagens».`,
      document: (s) => `${s} precisa de um documento para avançar com o seu processo. Inicie sessão no seu espaço de cliente para o enviar, em «Os meus documentos».`,
      payment: (s) => `${s} enviou-lhe um pedido de pagamento. Consulte o detalhe no seu espaço de cliente, em «Pagamentos».`,
    },
    button: "Abrir o meu espaço de cliente",
    safety: "Por segurança, este e-mail não contém detalhes. Nunca lhe pediremos as suas credenciais nem um pagamento para uma conta comunicada por e-mail.",
  },
  de: {
    subject: { message: "Neue Nachricht in Ihrem Kundenbereich", document: "Ein Dokument wird bei Ihnen angefordert", payment: "Neue Zahlungsaufforderung in Ihrem Kundenbereich" },
    body: {
      message: (s) => `${s} hat Ihnen eine Nachricht gesendet. Melden Sie sich in Ihrem Kundenbereich an, um sie unter „Nachrichten“ zu lesen.`,
      document: (s) => `${s} benötigt ein Dokument, um Ihren Vorgang voranzubringen. Melden Sie sich in Ihrem Kundenbereich an, um es unter „Meine Dokumente“ hochzuladen.`,
      payment: (s) => `${s} hat Ihnen eine Zahlungsaufforderung gesendet. Die Details finden Sie in Ihrem Kundenbereich unter „Zahlungen“.`,
    },
    button: "Meinen Kundenbereich öffnen",
    safety: "Zu Ihrer Sicherheit enthält diese E-Mail keine Details. Wir fragen nie nach Ihren Zugangsdaten oder nach einer Zahlung auf ein per E-Mail genanntes Konto.",
  },
  nl: {
    subject: { message: "Nieuw bericht in uw klantenomgeving", document: "Er wordt een document bij u opgevraagd", payment: "Nieuw betaalverzoek in uw klantenomgeving" },
    body: {
      message: (s) => `${s} heeft u een bericht gestuurd. Meld u aan in uw klantenomgeving om het te lezen, onder "Berichten".`,
      document: (s) => `${s} heeft een document nodig om uw dossier verder te behandelen. Meld u aan in uw klantenomgeving om het te uploaden, onder "Mijn documenten".`,
      payment: (s) => `${s} heeft u een betaalverzoek gestuurd. U vindt de details in uw klantenomgeving, onder "Betalingen".`,
    },
    button: "Mijn klantenomgeving openen",
    safety: "Voor uw veiligheid bevat deze e-mail geen details. We vragen nooit uw inloggegevens of een betaling naar een rekening die per e-mail is meegedeeld.",
  },
};

const NOTICE_PATH: Record<ClientNoticeKind, string> = { message: "/messages", document: "/documents", payment: "/paiements" };

export function sendClientNoticeEmail(user: Recipient & { role?: string }, kind: ClientNoticeKind, senderName: string) {
  const t = textsFor(user.preferredLocale);
  const n = NOTICE_TEXTS[(user.preferredLocale ?? "fr") as Locale] ?? NOTICE_TEXTS.fr;
  const name = user.name ?? user.email;
  // Les pages de l espace investisseur sont sous /investor (sauf les paiements, propres à l emprunteur).
  const prefix = user.role === "INVESTOR" && kind !== "payment" ? "/investor" : "";
  const url = `${webBaseUrl()}${prefix}${NOTICE_PATH[kind]}`;
  const body = n.body[kind](senderName);
  const text = [t.hello(name), "", body, "", url, "", n.safety, "", t.signature].join("\n");
  const html = layout([escapeHtml(t.hello(name)), escapeHtml(body)], { label: n.button, url }, t.signature, escapeHtml(n.safety));
  return sendEmail({ to: user.email, subject: n.subject[kind], text, html, kind: `client.${kind}_notice`, userId: user.id });
}

// ---------------------------------------------------------------------------
// Invitation d'un membre de l'équipe (console super admin, 2026-11-14)
// ---------------------------------------------------------------------------

const INVITE_TEXTS: Record<Locale, { subject: string; body: (inviter: string) => string; button: string; expiry: string }> = {
  fr: { subject: "Votre accès au back-office SODIVA CREDITS", body: (i) => `${i} vous invite à rejoindre l'équipe sur le back-office SODIVA CREDITS. Choisissez votre mot de passe pour activer votre accès.`, button: "Activer mon accès", expiry: "Ce lien est valable 72 heures et ne peut servir qu'une fois. Si vous n'attendiez pas cette invitation, ignorez cet e-mail." },
  en: { subject: "Your access to the SODIVA CREDITS back office", body: (i) => `${i} has invited you to join the team on the SODIVA CREDITS back office. Choose your password to activate your access.`, button: "Activate my access", expiry: "This link is valid for 72 hours and can be used only once. If you were not expecting this invitation, ignore this e-mail." },
  es: { subject: "Su acceso al back-office de SODIVA CREDITS", body: (i) => `${i} le invita a unirse al equipo en el back-office de SODIVA CREDITS. Elija su contraseña para activar su acceso.`, button: "Activar mi acceso", expiry: "Este enlace es válido durante 72 horas y solo puede usarse una vez. Si no esperaba esta invitación, ignore este correo." },
  it: { subject: "Il vostro accesso al back office SODIVA CREDITS", body: (i) => `${i} vi invita a unirvi al team sul back office SODIVA CREDITS. Scegliete la password per attivare l'accesso.`, button: "Attivare il mio accesso", expiry: "Questo link è valido 72 ore e può essere usato una sola volta. Se non aspettavate questo invito, ignorate questa e-mail." },
  hu: { subject: "Hozzáférése a SODIVA CREDITS back office-hoz", body: (i) => `${i} meghívta, hogy csatlakozzon a csapathoz a SODIVA CREDITS back office-ban. Válasszon jelszót a hozzáférés aktiválásához.`, button: "Hozzáférés aktiválása", expiry: "A link 72 óráig érvényes és csak egyszer használható. Ha nem várta ezt a meghívást, hagyja figyelmen kívül ezt az e-mailt." },
  pt: { subject: "O seu acesso ao back-office SODIVA CREDITS", body: (i) => `${i} convida-o a juntar-se à equipa no back-office SODIVA CREDITS. Escolha a sua palavra-passe para ativar o acesso.`, button: "Ativar o meu acesso", expiry: "Esta ligação é válida durante 72 horas e só pode ser usada uma vez. Se não esperava este convite, ignore este e-mail." },
  de: { subject: "Ihr Zugang zum SODIVA CREDITS-Backoffice", body: (i) => `${i} lädt Sie ein, dem Team im SODIVA CREDITS-Backoffice beizutreten. Wählen Sie Ihr Passwort, um Ihren Zugang zu aktivieren.`, button: "Zugang aktivieren", expiry: "Dieser Link ist 72 Stunden gültig und kann nur einmal verwendet werden. Wenn Sie diese Einladung nicht erwartet haben, ignorieren Sie diese E-Mail." },
  nl: { subject: "Uw toegang tot de SODIVA CREDITS-backoffice", body: (i) => `${i} nodigt u uit om het team te vervoegen in de SODIVA CREDITS-backoffice. Kies uw wachtwoord om uw toegang te activeren.`, button: "Mijn toegang activeren", expiry: "Deze link is 72 uur geldig en kan maar één keer worden gebruikt. Verwachtte u deze uitnodiging niet, negeer dan deze e-mail." },
};

export function sendStaffInviteEmail(user: Recipient, url: string, inviterName: string) {
  const t = textsFor(user.preferredLocale);
  const n = INVITE_TEXTS[(user.preferredLocale ?? "fr") as Locale] ?? INVITE_TEXTS.fr;
  const name = user.name ?? user.email;
  const body = n.body(inviterName);
  const text = [t.hello(name), "", body, "", url, "", n.expiry, "", t.signature].join("\n");
  const html = layout([escapeHtml(t.hello(name)), escapeHtml(body)], { label: n.button, url }, t.signature, escapeHtml(n.expiry));
  return sendEmail({ to: user.email, subject: n.subject, text, html, kind: "staff.invite", userId: user.id });
}
