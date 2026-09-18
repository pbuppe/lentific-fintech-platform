import type { ContractStrings } from "./types";
import { fr } from "./fr";
import { en } from "./en";
import { es } from "./es";
import { it } from "./it";
import { hu } from "./hu";
import { pt } from "./pt";
import { de } from "./de";
import { nl } from "./nl";

export type ContractLocale = "fr" | "en" | "es" | "it" | "hu" | "pt" | "de" | "nl";

const REGISTRY: Record<ContractLocale, ContractStrings> = { fr, en, es, it, hu, pt, de, nl };

export function getContractStrings(locale: string | null | undefined): ContractStrings {
  return REGISTRY[(locale as ContractLocale) ?? "fr"] ?? fr;
}

export type { ContractStrings } from "./types";
