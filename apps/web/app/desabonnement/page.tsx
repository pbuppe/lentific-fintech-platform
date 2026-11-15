import { redirect } from "next/navigation";
import { marketingContactLocale, unsubscribeMarketingContact } from "@fintech/auth";
import { Card, StatusPill } from "@fintech/ui";

/**
 * Page ouverte depuis le lien « Ne plus recevoir nos e-mails » des e-mails
 * marketing (demande produit 2026-11-15). Un bouton confirme la désinscription :
 * ainsi, les antivirus qui ouvrent les liens des e-mails ne désinscrivent
 * personne par erreur. Textes dans la langue du contact.
 */
export const dynamic = "force-dynamic";

const TEXTS = {
  fr: { kicker: "Lentific · E-mails", title: "Se désinscrire", ask: "Vous ne recevrez plus nos e-mails d'information et de promotion. Les e-mails liés à votre compte, s'il existe, continueront de vous parvenir.", button: "Confirmer la désinscription", doneTitle: "C'est fait", done: "Votre adresse a bien été retirée de notre liste : vous ne recevrez plus nos e-mails d'information et de promotion.", invalid: "Ce lien n'est pas valide. Si vous continuez à recevoir nos e-mails, répondez simplement à l'un d'eux pour nous le signaler.", home: "Retour au site" },
  en: { kicker: "Lentific · E-mails", title: "Unsubscribe", ask: "You will no longer receive our news and promotional e-mails. E-mails about your account, if you have one, will still be sent.", button: "Confirm unsubscription", doneTitle: "Done", done: "Your address has been removed from our list: you will no longer receive our news and promotional e-mails.", invalid: "This link is not valid. If you keep receiving our e-mails, simply reply to one of them to let us know.", home: "Back to the website" },
  es: { kicker: "Lentific · Correos", title: "Darse de baja", ask: "Dejará de recibir nuestros correos informativos y promocionales. Los correos relacionados con su cuenta, si la tiene, seguirán llegándole.", button: "Confirmar la baja", doneTitle: "Hecho", done: "Su dirección se ha eliminado de nuestra lista: dejará de recibir nuestros correos informativos y promocionales.", invalid: "Este enlace no es válido. Si sigue recibiendo nuestros correos, responda a uno de ellos para indicárnoslo.", home: "Volver al sitio" },
  it: { kicker: "Lentific · E-mail", title: "Annullare l'iscrizione", ask: "Non riceverà più le nostre e-mail informative e promozionali. Le e-mail relative al suo account, se ne ha uno, continueranno ad arrivarle.", button: "Confermare la disiscrizione", doneTitle: "Fatto", done: "Il suo indirizzo è stato rimosso dal nostro elenco: non riceverà più le nostre e-mail informative e promozionali.", invalid: "Questo link non è valido. Se continua a ricevere le nostre e-mail, risponda a una di esse per segnalarcelo.", home: "Torna al sito" },
  hu: { kicker: "Lentific · E-mailek", title: "Leiratkozás", ask: "Többé nem kap tőlünk tájékoztató és promóciós e-maileket. A fiókjával kapcsolatos e-maileket (ha van fiókja) továbbra is megkapja.", button: "Leiratkozás megerősítése", doneTitle: "Kész", done: "Címét eltávolítottuk listánkról: többé nem kap tőlünk tájékoztató és promóciós e-maileket.", invalid: "Ez a link érvénytelen. Ha továbbra is kap tőlünk e-maileket, válaszoljon valamelyikre, és jelezze nekünk.", home: "Vissza az oldalra" },
  pt: { kicker: "Lentific · E-mails", title: "Cancelar a subscrição", ask: "Deixará de receber os nossos e-mails informativos e promocionais. Os e-mails relacionados com a sua conta, se a tiver, continuarão a ser enviados.", button: "Confirmar o cancelamento", doneTitle: "Concluído", done: "O seu endereço foi retirado da nossa lista: deixará de receber os nossos e-mails informativos e promocionais.", invalid: "Este link não é válido. Se continuar a receber os nossos e-mails, basta responder a um deles para nos informar.", home: "Voltar ao site" },
  de: { kicker: "Lentific · E-Mails", title: "Abmelden", ask: "Sie erhalten dann keine Informations- und Werbe-E-Mails mehr von uns. E-Mails zu Ihrem Konto (falls vorhanden) erhalten Sie weiterhin.", button: "Abmeldung bestätigen", doneTitle: "Erledigt", done: "Ihre Adresse wurde aus unserer Liste entfernt: Sie erhalten keine Informations- und Werbe-E-Mails mehr von uns.", invalid: "Dieser Link ist ungültig. Falls Sie weiterhin E-Mails von uns erhalten, antworten Sie einfach auf eine davon.", home: "Zurück zur Website" },
  nl: { kicker: "Lentific · E-mails", title: "Afmelden", ask: "U ontvangt dan geen informatieve en promotionele e-mails meer van ons. E-mails over uw account, als u er een heeft, blijft u ontvangen.", button: "Afmelding bevestigen", doneTitle: "Gelukt", done: "Uw adres is van onze lijst verwijderd: u ontvangt geen informatieve en promotionele e-mails meer van ons.", invalid: "Deze link is niet geldig. Blijft u onze e-mails ontvangen? Beantwoord er dan een om het ons te laten weten.", home: "Terug naar de website" },
} as const;

async function confirmAction(formData: FormData) {
  "use server";
  const token = String(formData.get("t") ?? "");
  await unsubscribeMarketingContact(token);
  redirect(`/desabonnement?t=${encodeURIComponent(token)}`);
}

export default async function UnsubscribePage({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t ?? "";
  const contact = await marketingContactLocale(token);
  const t = TEXTS[(contact?.locale ?? "fr") as keyof typeof TEXTS] ?? TEXTS.fr;
  const done = contact?.status === "UNSUBSCRIBED";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t.kicker}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{done ? t.doneTitle : t.title}</h1>
      <Card className="mt-6">
        {!contact ? (
          <p className="text-sm text-ink-soft">{t.invalid}</p>
        ) : done ? (
          <>
            <div className="mb-3"><StatusPill tone="ok">{t.doneTitle}</StatusPill></div>
            <p className="text-sm text-ink-soft">{t.done}</p>
          </>
        ) : (
          <form action={confirmAction}>
            <input type="hidden" name="t" value={token} />
            <p className="text-sm text-ink-soft">{t.ask}</p>
            <button className="mt-4 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">{t.button}</button>
          </form>
        )}
        <a href="/" className="mt-4 block text-sm font-semibold text-brand underline">{t.home}</a>
      </Card>
    </main>
  );
}
