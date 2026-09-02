import { Simulator } from "./Simulator";

export default function SimulateurPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-12">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Simulateur</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Estime ton financement</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Ajuste le montant et la durée pour voir la mensualité et le coût total estimés, avant de déposer une demande.
      </p>
      <div className="mt-8">
        <Simulator />
      </div>
    </main>
  );
}
