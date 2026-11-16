/**
 * Identité légale de l'exploitant du site (fournie par le propriétaire le
 * 2026-11-16). Les variables d'environnement SITE_* restent prioritaires si
 * elles sont renseignées sur Vercel.
 */
export interface LegalIdentity {
  company: string;
  companyNumber: string;
  address: string;
  orias?: string;
  phone?: string;
  email: string;
  mediator?: string;
  manager?: string;
}

export function legalIdentity(): LegalIdentity {
  return {
    company: process.env.SITE_COMPANY_NAME || "COVPAC LIMITED",
    companyNumber: process.env.SITE_COMPANY_NUMBER || "15063162",
    address: process.env.SITE_ADDRESS || "49 Heol Cae-Rhys, Cardiff CF14 6AP, UK",
    orias: process.env.SITE_ORIAS_NUMBER,
    phone: process.env.SITE_PHONE,
    email: process.env.SITE_CONTACT_EMAIL || "info@lentific.com",
    mediator: process.env.SITE_MEDIATOR,
    manager: process.env.SITE_MANAGER,
  };
}
