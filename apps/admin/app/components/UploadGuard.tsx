"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/**
 * Envoi de fichiers depuis le back-office (correctif 2026-11-16 : « on appuie
 * sur le bouton, rien ne se passe »). Le serveur refuse les fichiers trop
 * lourds ; on prévient donc AVANT l'envoi, avec un message clair, au lieu
 * d'une requête qui échoue en silence, et le bouton indique l'envoi en cours.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function FileField({ name, accept, tooLarge, className }: { name: string; accept: string; tooLarge: string; className?: string }) {
  return (
    <input
      type="file"
      name={name}
      required
      accept={accept}
      className={className}
      onChange={(e) => {
        const input = e.currentTarget;
        const file = input.files?.[0];
        input.setCustomValidity(file && file.size > MAX_UPLOAD_BYTES ? tooLarge : "");
        input.reportValidity();
      }}
    />
  );
}

export function PendingButton({ children, pendingLabel, className }: { children: ReactNode; pendingLabel: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${className ?? ""} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
