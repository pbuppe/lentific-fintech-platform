import type { ContractStrings } from "./types";

export const es: ContractStrings = {
  bannerLabel: "MODELO: documento generado automáticamente, pendiente de validación por un asesor jurídico antes de su uso real",
  bannerRef: "Referencia del expediente: {reference}, generado el {date}",
  articleWord: "ARTÍCULO",
  calloutPrefix: "A CONFIRMAR POR EL ASESOR JURÍDICO",
  durationUnit: "meses",
  signElectronic: "(firma electrónica)",
  noScoreAvailable: "No disponible",

  mp_pdfTitle: "Contrato de préstamo - {reference}",
  mp_mainTitle: "CONTRATO DE PRÉSTAMO DE FINANCIACIÓN PARTICIPATIVA",
  mp_mainSubtitle: "Redactado en aplicación de los artículos L.548-1 y siguientes y R.548-1 y siguientes del Código Monetario y Financiero francés",
  mp_intermediaryHeading: "EL INTERMEDIARIO EN FINANCIACIÓN PARTICIPATIVA",
  mp_intermediaryText:
    "La sociedad Lentific, [forma societaria a completar], con capital social de [montante] euros, [domicilio social a completar], inscrita en el RCS (Registro Mercantil francés) de [ciudad] con el número [SIREN a confirmar], inscrita ante la ORIAS en calidad de intermediario en financiación participativa con el número [número ORIAS a confirmar], en adelante «el Intermediario» o «Lentific», actuando en calidad de mandatario de los Prestamistas, sin ser ella misma parte prestamista.",
  mp_borrowerHeading: "EL PRESTATARIO",
  mp_borrowerText: "{name} ({email}){cityPart}, actuando con carácter profesional, en adelante «el Prestatario».",
  mp_borrowerCityPart: ", con domicilio en {city}",
  mp_lendersHeading: "EL O LOS PRESTAMISTAS",
  mp_lendersText:
    "Las personas físicas o jurídicas cuya identidad, datos de contacto y cuota individualmente prestada figuran en el Anexo 3 (Boletines de suscripción), actuando cada Prestamista individualmente y sin solidaridad entre ellos, en adelante colectivamente los «Prestamistas».",
  mp_preambleHeading: "PREÁMBULO",
  mp_preambleText1:
    "El Prestatario ha presentado en la plataforma Lentific una solicitud de financiación por un importe de {amount} destinada a un uso profesional. Este expediente ha sido objeto de una verificación de identidad, de un análisis de la capacidad de reembolso por el motor de riesgo de la Plataforma{riskPart}, y posteriormente de una revisión por un gestor habilitado, tras la cual se estableció una oferta que fue aceptada por el Prestatario.",
  mp_preambleRiskPart: " (puntuación obtenida: {score}/100)",
  mp_preambleText2:
    "El presente contrato formaliza las condiciones de esta financiación, asegurada por uno o varios Prestamistas en el marketplace P2P de la Plataforma, en las condiciones de financiación fraccionada descritas en el Artículo 5.",
  mp_art1Title: "DEFINICIONES",
  mp_art1Items: [
    "«Plataforma» designa el sitio web y la aplicación explotados por Lentific.",
    "«Financiación participativa mediante préstamo» (crowdlending) designa la operación por la cual uno o varios Prestamistas conceden un préstamo remunerado al Prestatario, de conformidad con los artículos L.548-1 y siguientes del Código Monetario y Financiero francés.",
    "«TAE» designa la tasa anual equivalente.",
    "«Cuadro de Amortización» designa la tabla de amortización que figura en el Anexo 1.",
  ],
  mp_art2Title: "DECLARACIONES Y GARANTÍAS DE LAS PARTES",
  mp_art2Sub1: "2.1 Declaraciones comunes",
  mp_art2Text1:
    "Cada Parte declara tener plena capacidad jurídica para contratar y no encontrarse en situación de cesación de pagos en la fecha de la firma.",
  mp_art2Sub2: "2.2 Declaraciones del Prestatario",
  mp_art2Text2:
    "El Prestatario declara que la información facilitada en el marco de su solicitud es exacta, veraz y está actualizada, y que no se ha producido ningún hecho susceptible de afectar a su capacidad de reembolso sin haber informado de ello a la Plataforma.",
  mp_art2Sub3: "2.3 Declaraciones de los Prestamistas",
  mp_art2Text3:
    "Cada Prestamista declara haber tomado conocimiento de la ficha de información sintética (Anexo 2) y reconoce haber sido informado y advertido sobre los riesgos descritos en el Artículo 10.",
  mp_art3Title: "OBJETO DEL CONTRATO",
  mp_art3Text:
    "El presente contrato fija las condiciones en las que los Prestamistas conceden al Prestatario, por medio de la Plataforma, un préstamo de dinero remunerado, así como las modalidades de su reembolso.",
  mp_art4Title: "CARACTERÍSTICAS FINANCIERAS DEL PRÉSTAMO",
  mp_art4RowLabels: [
    "Importe total del crédito",
    "Duración",
    "Tipo deudor fijo aplicable (anual)",
    "Cuota mensual (sin seguro)",
    "Importe total de los intereses",
    "Coste total del crédito",
  ],
  mp_art4TaegLabel: "TAE",
  mp_art4TaegValue: "a calcular por el Intermediario antes de su difusión",
  mp_art5Title: "PUESTA A DISPOSICIÓN DE LOS FONDOS Y FINANCIACIÓN FRACCIONADA",
  mp_art5Text1:
    "Los fondos se recaudan en el marketplace P2P hasta alcanzar el importe total: cada Prestamista financia una cuota, sin que ningún Prestamista quede obligado más allá de su cuota ni sea solidario con los demás Prestamistas. Una vez recaudado el importe, los fondos se abonan al Prestatario mediante transferencia, previa deducción, en su caso, de los gastos previstos en el Artículo 8.",
  mp_art5Text2:
    "Si el importe total no se recauda dentro del plazo indicado en la Plataforma, la financiación se considerará no realizada y las cantidades ya aportadas serán restituidas a los Prestamistas.",
  mp_art6Title: "AMORTIZACIÓN Y CUADRO DE AMORTIZACIÓN",
  mp_art6Text:
    "El préstamo es reembolsable según una amortización constante, conforme a la tabla que figura en el Anexo 1. Los reembolsos son redistribuidos por el Intermediario a cada Prestamista en proporción a su cuota.",
  mp_art7Title: "REEMBOLSO ANTICIPADO",
  mp_art7Text: "El Prestatario puede en cualquier momento reembolsar anticipadamente, en su totalidad o en parte, las cantidades pendientes de pago.",
  mp_art7Callout: "¿es aplicable una indemnización por reembolso anticipado, y con arreglo a qué límite reglamentario?",
  mp_art8Title: "GASTOS DEL INTERMEDIARIO",
  mp_art8Text:
    "El Intermediario percibe unos gastos cuyo principio y baremo son los definidos por el motor de tarifas (Fee Engine) aplicable al producto en cuestión en la fecha de celebración del presente contrato.",
  mp_art8Callout: "baremo preciso que deberá adjuntarse como anexo antes de su difusión.",
  mp_art9Title: "IMPAGO E INTERESES DE DEMORA",
  mp_art9Text:
    "En caso de impago a su vencimiento, y sin que sea necesario un requerimiento previo, las cantidades impagadas devengarán de pleno derecho intereses al tipo legal vigente incrementado, desde la fecha de exigibilidad hasta su completo pago, sin perjuicio de lo dispuesto en el artículo 1231-6 del Código Civil francés.",
  mp_art10Title: "ADVERTENCIA SOBRE LOS RIESGOS",
  mp_art10Text:
    "Cada Prestamista es advertido, conforme al artículo L.548-6 del Código Monetario y Financiero francés, sobre el modo de funcionamiento de la financiación participativa, y en particular:",
  mp_art10Items: [
    "el riesgo de pérdida total o parcial del capital prestado en caso de incumplimiento del Prestatario;",
    "la ausencia de garantía de reembolso por parte del Intermediario, que no es ni prestamista, ni garante, ni asegurador;",
    "el riesgo de iliquidez de las cantidades prestadas antes del vencimiento acordado;",
    "la necesidad de diversificar sus inversiones.",
  ],
  mp_art11Title: "EXIGIBILIDAD ANTICIPADA",
  mp_art11Text:
    "El Intermediario, en nombre y por cuenta de los Prestamistas, podrá invocar la exigibilidad inmediata del préstamo, sin previo aviso ni formalidad judicial previa, en particular en caso de impago no regularizado en un plazo de 15 días desde el requerimiento, de procedimiento concursal contra el Prestatario, de inexactitud de una declaración o de maniobra fraudulenta.",
  mp_art12Title: "GESTIÓN DEL INCUMPLIMIENTO DEL PRESTATARIO",
  mp_art12Text:
    "En caso de impago, el Intermediario notificará a los Prestamistas y remitirá al Prestatario un recordatorio y, de no regularizarse la situación en un plazo de 15 días, un requerimiento formal. En caso de impago persistente, el Intermediario podrá iniciar cualquier procedimiento de cobro amistoso o judicial por cuenta de los Prestamistas que lo autoricen.",
  mp_art13Title: "DERECHO DE DESISTIMIENTO",
  mp_art13Callout:
    "la existencia y la duración de un derecho de desistimiento dependen del estatuto reglamentario preciso del Intermediario (IFP nacional o PSFP en el sentido del Reglamento (UE) 2020/1503, ECSP) y de la calificación del Prestamista. El artículo R.548-6 exige mencionar este derecho y sus modalidades.",
  mp_art14Title: "FUNCIÓN Y RESPONSABILIDAD DEL INTERMEDIARIO",
  mp_art14Text:
    "El Intermediario actúa en calidad de mandatario de los Prestamistas. En ningún caso es parte prestamista, no garantiza ni el capital ni los intereses, y su responsabilidad no podrá verse comprometida por el mero hecho del incumplimiento del Prestatario, sin perjuicio de sus obligaciones de buena conducta en virtud de los artículos L.548-1 y siguientes.",
  mp_art15Title: "DATOS DE CARÁCTER PERSONAL",
  mp_art15Text:
    "Los datos personales de las Partes son tratados por el Intermediario, responsable del tratamiento, de conformidad con el RGPD y con la Ley francesa n.º 78-17 de 6 de enero de 1978, modificada, con la única finalidad de la ejecución del contrato y del cumplimiento de las obligaciones legales aplicables.",
  mp_art16Title: "DERECHO APLICABLE Y JURISDICCIÓN COMPETENTE",
  mp_art16Text:
    "El presente contrato se rige por el derecho francés. Cualquier controversia relativa a su validez, interpretación o ejecución se someterá a la competencia exclusiva de los tribunales franceses territorialmente competentes, sin perjuicio de las normas de orden público aplicables.",
  mp_signBorrowerLabel: "El Prestatario",
  mp_signIntermediaryLabel: "Por el Intermediario, Lentific",
  mp_annex1Title: "ANEXO 1 - CUADRO DE AMORTIZACIÓN",
  mp_annex1Subtitle: "Préstamo de {amount} · {duration} cuotas mensuales · tipo fijo {rate} % · cuota mensual {monthly}",
  mp_annex1Headers: ["N.º", "Fecha", "Capital", "Intereses", "Cuota", "Capital pendiente"],
  mp_annex2Title: "ANEXO 2 - FICHA DE INFORMACIÓN SINTÉTICA",
  mp_annex2RowLabels: [
    "Prestatario",
    "Importe prestado",
    "Duración",
    "Tipo deudor fijo",
    "Cuota mensual",
    "Coste total del crédito",
    "Puntuación de riesgo interna",
    "Riesgo principal para el Prestamista",
  ],
  mp_annex2MainRiskText: "Pérdida parcial o total del capital prestado (Artículo 10)",
  mp_annex3Title: "ANEXO 3 - BOLETÍN DE SUSCRIPCIÓN (MODELO)",
  mp_annex3Text:
    "El/la abajo firmante [Nombre del Prestamista], declara suscribir la financiación del Prestatario designado en el presente documento por un importe de [importe] EUR, y reconoce haber tomado conocimiento y aceptado sin reservas la totalidad de las estipulaciones del presente contrato con referencia {reference}, en particular la advertencia sobre los riesgos que figura en el Artículo 10.",
  mp_footerNote:
    "Documento generado automáticamente por la plataforma Lentific a partir del expediente {reference}. Las menciones señaladas como «a confirmar» deben completarse con los datos reales de inscripción de la sociedad y ser validadas por un abogado antes de su puesta en producción. Estructura establecida por referencia a los artículos L.548-1 y siguientes y R.548-1 y siguientes (en particular R.548-6) del Código Monetario y Financiero francés.",

  dl_pdfTitle: "Contrato de préstamo directo - {reference}",
  dl_mainTitle: "CONTRATO DE PRÉSTAMO ENTRE PARTICULARES",
  dl_mainSubtitle: "Préstamo directo celebrado entre las partes a raíz de una puesta en contacto a través de la plataforma Lentific",
  dl_borrowerHeading: "EL PRESTATARIO",
  dl_borrowerText: "{name} ({email}){cityPart}, en adelante «el Prestatario».",
  dl_borrowerCityPart: ", con domicilio en {city}",
  dl_lenderHeading: "EL PRESTAMISTA",
  dl_lenderText: "{name} ({email}), en adelante «el Prestamista».",
  dl_preambleHeading: "PREÁMBULO",
  dl_preambleText:
    "{borrowerName} y {lenderName} han sido puestos en contacto a través de la plataforma Lentific, mediante el pago de los gastos de puesta en contacto previstos por la Plataforma. Las Partes han acordado, al margen de cualquier financiación fraccionada o intermediación regulada por la Plataforma, celebrar directamente entre ellas el presente contrato de préstamo por un importe de {amount}. Lentific no es prestamista, ni prestatario, ni intermediario en financiación participativa en relación con el presente contrato: su función se limita a haber puesto en contacto a las Partes y a la generación del presente documento.",
  dl_art1Title: "OBJETO DEL CONTRATO",
  dl_art1Text:
    "El presente contrato fija las condiciones en las que el Prestamista concede al Prestatario, de manera directa, un préstamo de dinero remunerado, así como las modalidades de su reembolso.",
  dl_art2Title: "CARACTERÍSTICAS FINANCIERAS DEL PRÉSTAMO",
  dl_art2RowLabels: ["Importe del préstamo", "Duración", "Tipo de interés anual", "Cuota mensual", "Coste total del crédito"],
  dl_art3Title: "DESEMBOLSO DE LOS FONDOS",
  dl_art3Text:
    "Las Partes acuerdan libremente entre ellas las modalidades de desembolso de los fondos por el Prestamista al Prestatario, sin que la Plataforma intervenga en modo alguno en dicho desembolso.",
  dl_art4Title: "REEMBOLSO Y CUADRO DE AMORTIZACIÓN",
  dl_art4Text:
    "El préstamo es reembolsable según el cuadro de amortización indicativo que figura en el Anexo 1, directamente entre las Partes, sin intervención de la Plataforma.",
  dl_art4Callout:
    "un préstamo entre particulares puede quedar sujeto al Código de Consumo francés (crédito al consumo) según la condición de las Partes y el importe en juego, con obligaciones específicas (oferta previa, plazo de desistimiento): a verificar antes de la firma.",
  dl_art5Title: "REEMBOLSO ANTICIPADO",
  dl_art5Text:
    "El Prestatario puede en cualquier momento reembolsar anticipadamente, en su totalidad o en parte, las cantidades pendientes de pago, salvo estipulación en contrario expresamente acordada entre las Partes.",
  dl_art6Title: "IMPAGO",
  dl_art6Text:
    "En caso de impago a su vencimiento, las cantidades impagadas devengarán de pleno derecho intereses al tipo legal vigente incrementado, desde la fecha de exigibilidad hasta su completo pago, sin perjuicio de lo dispuesto en el artículo 1231-6 del Código Civil francés.",
  dl_art7Title: "ADVERTENCIA SOBRE LOS RIESGOS",
  dl_art7Text: "El Prestamista reconoce haber sido informado y advertido sobre los riesgos inherentes a un préstamo directo a un particular, y en particular:",
  dl_art7Items: [
    "el riesgo de pérdida total o parcial del capital prestado en caso de incumplimiento del Prestatario;",
    "la ausencia de toda garantía de reembolso por parte de Lentific, que no es ni prestamista, ni garante, ni asegurador, ni intermediario en financiación participativa en relación con el presente contrato;",
    "el riesgo de iliquidez de las cantidades prestadas antes del vencimiento acordado;",
    "la conveniencia de hacer revisar el presente contrato por un profesional del derecho antes de la firma, dado que este documento es únicamente un modelo.",
  ],
  dl_art8Title: "FUNCIÓN DE LENTIFIC",
  dl_art8Text:
    "Lentific no es parte, en ningún concepto, del presente contrato, no garantiza ni el capital ni los intereses, y su función se limita a haber puesto en contacto a las Partes. Lo que suceda entre las Partes a partir de la firma del presente contrato tiene lugar fuera de la Plataforma y no compromete la responsabilidad de Lentific.",
  dl_art9Title: "DATOS DE CARÁCTER PERSONAL",
  dl_art9Text:
    "Los datos personales intercambiados en el marco de la puesta en contacto han sido tratados por Lentific de conformidad con el RGPD; las Partes son las únicas responsables del tratamiento que realicen de los datos de la otra Parte una vez puestas en contacto.",
  dl_art10Title: "DERECHO APLICABLE Y JURISDICCIÓN COMPETENTE",
  dl_art10Text:
    "El presente contrato se rige por el derecho francés. Cualquier controversia relativa a su validez, interpretación o ejecución se someterá a la competencia exclusiva de los tribunales franceses territorialmente competentes, sin perjuicio de las normas de orden público aplicables.",
  dl_signBorrowerLabel: "El Prestatario",
  dl_signLenderLabel: "El Prestamista",
  dl_annex1Title: "ANEXO 1 - CUADRO DE AMORTIZACIÓN INDICATIVO",
  dl_annex1Subtitle: "Préstamo de {amount} · {duration} cuotas mensuales · tipo fijo {rate} % · cuota mensual {monthly}",
  dl_annex1Headers: ["N.º", "Fecha", "Capital", "Intereses", "Cuota", "Capital pendiente"],
  dl_footerNote:
    "Documento generado automáticamente por la plataforma Lentific a partir de la puesta en contacto con referencia {reference}. Este contrato es un MODELO: debe ser validado por un profesional del derecho antes de la firma, en particular en lo relativo a su eventual calificación como crédito al consumo (Artículo 4).",
};
