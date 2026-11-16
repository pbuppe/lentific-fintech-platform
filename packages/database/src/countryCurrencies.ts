/**
 * Devise officielle de chaque pays proposé (ISO 4217), pour créer à la
 * demande la fiche Pays d'un nouvel inscrit (2026-11-16 : ouverture à tous
 * les pays hors Afrique). Pays absent de la liste : euro.
 */
const EUR = ["AD", "AT", "AX", "BE", "BL", "CY", "DE", "EE", "ES", "FI", "FR", "GF", "GP", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MC", "ME", "MF", "MQ", "MT", "NL", "PM", "PT", "SI", "SK", "SM", "VA"];
const USD = ["AS", "BQ", "EC", "FM", "GU", "IO", "MH", "MP", "PR", "PW", "SV", "TC", "TL", "UM", "US", "VG", "VI"];
const XCD = ["AG", "AI", "DM", "GD", "KN", "LC", "MS", "VC"];
const AUD = ["AU", "CC", "CX", "KI", "NF", "NR", "TV"];
const NZD = ["CK", "NU", "NZ", "PN", "TK"];
const XPF = ["NC", "PF", "WF"];
const ANG = ["CW", "SX"];

const OTHERS: Record<string, string> = {
  AE: "AED", AF: "AFN", AL: "ALL", AM: "AMD", AR: "ARS", AW: "AWG", AZ: "AZN", BA: "BAM", BB: "BBD", BD: "BDT",
  BG: "BGN", BH: "BHD", BM: "BMD", BN: "BND", BO: "BOB", BR: "BRL", BS: "BSD", BT: "BTN", BY: "BYN", BZ: "BZD",
  CA: "CAD", CH: "CHF", CL: "CLP", CN: "CNY", CO: "COP", CR: "CRC", CU: "CUP", CZ: "CZK", DK: "DKK", DO: "DOP",
  FJ: "FJD", FK: "FKP", FO: "DKK", GB: "GBP", GE: "GEL", GG: "GBP", GI: "GIP", GL: "DKK", GT: "GTQ", GY: "GYD",
  HK: "HKD", HN: "HNL", HT: "HTG", HU: "HUF", ID: "IDR", IL: "ILS", IM: "GBP", IN: "INR", IQ: "IQD", IR: "IRR",
  IS: "ISK", JE: "GBP", JM: "JMD", JO: "JOD", JP: "JPY", KG: "KGS", KH: "KHR", KP: "KPW", KR: "KRW", KW: "KWD",
  KY: "KYD", KZ: "KZT", LA: "LAK", LB: "LBP", LI: "CHF", LK: "LKR", MD: "MDL", MK: "MKD", MM: "MMK", MN: "MNT",
  MO: "MOP", MV: "MVR", MX: "MXN", MY: "MYR", NI: "NIO", NO: "NOK", NP: "NPR", OM: "OMR", PA: "PAB", PE: "PEN",
  PG: "PGK", PH: "PHP", PK: "PKR", PL: "PLN", PS: "ILS", PY: "PYG", QA: "QAR", RO: "RON", RS: "RSD", RU: "RUB",
  SA: "SAR", SB: "SBD", SE: "SEK", SG: "SGD", SJ: "NOK", SR: "SRD", SY: "SYP", TH: "THB", TJ: "TJS", TM: "TMT",
  TO: "TOP", TR: "TRY", TT: "TTD", TW: "TWD", UA: "UAH", UY: "UYU", UZ: "UZS", VE: "VES", VN: "VND", VU: "VUV",
  WS: "WST", YE: "YER",
};

export function currencyForCountry(code: string): string {
  const c = code.toUpperCase();
  if (EUR.includes(c)) return "EUR";
  if (USD.includes(c)) return "USD";
  if (XCD.includes(c)) return "XCD";
  if (AUD.includes(c)) return "AUD";
  if (NZD.includes(c)) return "NZD";
  if (XPF.includes(c)) return "XPF";
  if (ANG.includes(c)) return "ANG";
  return OTHERS[c] ?? "EUR";
}
