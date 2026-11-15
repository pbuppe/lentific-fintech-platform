import type { ContractStrings } from "./types";

export const pt: ContractStrings = {
  bannerLabel: "MODELO: documento gerado automaticamente, a validar por um jurista antes de qualquer utilização real",
  bannerRef: "Referência do processo: {reference}, gerado em {date}",
  articleWord: "ARTIGO",
  calloutPrefix: "A CONFIRMAR PELO CONSULTOR JURÍDICO",
  durationUnit: "meses",
  signElectronic: "(assinatura eletrónica)",
  noScoreAvailable: "Não disponível",

  mp_pdfTitle: "Contrato de mútuo - {reference}",
  mp_mainTitle: "CONTRATO DE MÚTUO DE FINANCIAMENTO COLABORATIVO",
  mp_mainSubtitle: "Elaborado em aplicação dos artigos L.548-1 e seguintes e R.548-1 e seguintes do Código Monetário e Financeiro francês",
  mp_intermediaryHeading: "O INTERMEDIÁRIO DE FINANCIAMENTO COLABORATIVO",
  mp_intermediaryText:
    "A sociedade Lentific, [forma societária a completar], com o capital de [montante] euros, [morada da sede social a completar], registada no RCS (registo comercial francês) de [cidade] sob o número [SIREN a confirmar], registada junto da ORIAS na qualidade de intermediário de financiamento colaborativo sob o número [número ORIAS a confirmar], doravante «o Intermediário» ou «Lentific», atuando na qualidade de mandatário dos Mutuantes, sem ser ela própria parte mutuante.",
  mp_borrowerHeading: "O MUTUÁRIO",
  mp_borrowerText: "{name} ({email}){cityPart}, atuando a título profissional, doravante «o Mutuário».",
  mp_borrowerCityPart: ", domiciliado(a) em {city}",
  mp_lendersHeading: "O(S) MUTUANTE(S)",
  mp_lendersText:
    "As pessoas singulares ou coletivas cuja identidade, dados de contacto e quota-parte individualmente mutuada constam do Anexo 3 (Boletins de Subscrição), atuando cada Mutuante individualmente e sem solidariedade entre si, doravante designadas coletivamente por «Mutuantes».",
  mp_preambleHeading: "PREÂMBULO",
  mp_preambleText1:
    "O Mutuário submeteu na plataforma Lentific um pedido de financiamento no montante de {amount} destinado a uso profissional. Este processo foi objeto de uma verificação de identidade, de uma análise da capacidade de reembolso pelo motor de risco da Plataforma{riskPart}, seguida de uma revisão por um gestor habilitado, no termo da qual foi elaborada uma oferta e aceite pelo Mutuário.",
  mp_preambleRiskPart: " (pontuação obtida: {score}/100)",
  mp_preambleText2:
    "O presente contrato formaliza as condições deste financiamento, assegurado por um ou vários Mutuantes no marketplace P2P da Plataforma, nas condições de financiamento fracionado descritas no Artigo 5.",
  mp_art1Title: "DEFINIÇÕES",
  mp_art1Items: [
    "«Plataforma» designa o sítio (website) e a aplicação explorados pela Lentific.",
    "«Financiamento colaborativo por empréstimo» (crowdlending) designa a operação pela qual um ou vários Mutuantes concedem um empréstimo remunerado ao Mutuário, em conformidade com os artigos L.548-1 e seguintes do Código Monetário e Financeiro francês.",
    "«TAEG» designa a taxa anual de encargos efetiva global.",
    "«Plano de Amortização» designa o quadro de amortização constante do Anexo 1.",
  ],
  mp_art2Title: "DECLARAÇÕES E GARANTIAS DAS PARTES",
  mp_art2Sub1: "2.1 Declarações comuns",
  mp_art2Text1:
    "Cada Parte declara ter plena capacidade jurídica para contratar e não se encontrar em situação de cessação de pagamentos à data da assinatura.",
  mp_art2Sub2: "2.2 Declarações do Mutuário",
  mp_art2Text2:
    "O Mutuário declara que as informações transmitidas no âmbito do seu pedido são exatas, verdadeiras e atuais, e que não ocorreu qualquer facto suscetível de afetar a sua capacidade de reembolso sem que a Plataforma tenha sido informada.",
  mp_art2Sub3: "2.3 Declarações dos Mutuantes",
  mp_art2Text3:
    "Cada Mutuante declara ter tomado conhecimento da ficha de informação sintética (Anexo 2) e reconhece ter sido informado e alertado sobre os riscos descritos no Artigo 10.",
  mp_art3Title: "OBJETO DO CONTRATO",
  mp_art3Text:
    "O presente contrato fixa as condições segundo as quais os Mutuantes concedem ao Mutuário, por intermédio da Plataforma, um empréstimo de dinheiro remunerado, bem como as modalidades do seu reembolso.",
  mp_art4Title: "CARACTERÍSTICAS FINANCEIRAS DO EMPRÉSTIMO",
  mp_art4RowLabels: [
    "Montante total do crédito",
    "Duração",
    "Taxa devedora fixa aplicável (anual)",
    "Mensalidade (sem seguro)",
    "Montante total dos juros",
    "Custo total do crédito",
  ],
  mp_art4TaegLabel: "TAEG",
  mp_art4TaegValue: "a calcular pelo Intermediário antes da divulgação",
  mp_art5Title: "DISPONIBILIZAÇÃO DOS FUNDOS E FINANCIAMENTO FRACIONADO",
  mp_art5Text1:
    "Os fundos são recolhidos no marketplace P2P até à obtenção do montante total: cada Mutuante financia uma quota-parte, sem que nenhum Mutuante seja obrigado além da sua quota-parte nem solidário com os demais Mutuantes. Uma vez recolhido o montante, os fundos são transferidos ao Mutuário por transferência bancária, deduzidos, se aplicável, dos encargos referidos no Artigo 8.",
  mp_art5Text2:
    "Se o montante total não for recolhido no prazo indicado na Plataforma, o financiamento considera-se não concluído e as quantias já entregues são restituídas aos Mutuantes.",
  mp_art6Title: "AMORTIZAÇÃO E PLANO DE AMORTIZAÇÃO",
  mp_art6Text:
    "O empréstimo é reembolsável segundo uma amortização constante, em conformidade com o quadro constante do Anexo 1. Os reembolsos são redistribuídos pelo Intermediário a cada Mutuante proporcionalmente à sua quota-parte.",
  mp_art7Title: "REEMBOLSO ANTECIPADO",
  mp_art7Text: "O Mutuário pode, a qualquer momento, reembolsar antecipadamente, no todo ou em parte, as quantias em dívida.",
  mp_art7Callout: "é aplicável uma indemnização por reembolso antecipado e, em caso afirmativo, segundo que limite regulamentar?",
  mp_art8Title: "ENCARGOS DO INTERMEDIÁRIO",
  mp_art8Text:
    "O Intermediário cobra encargos cujo princípio e tabela são os definidos pelo motor de encargos (Fee Engine) aplicável ao produto em causa na data de celebração do presente contrato.",
  mp_art8Callout: "tabela precisa a anexar antes da divulgação.",
  mp_art9Title: "INCUMPRIMENTO DE PAGAMENTO E JUROS DE MORA",
  mp_art9Text:
    "Em caso de incumprimento no respetivo vencimento, e sem necessidade de interpelação prévia, as quantias em dívida vencerão automaticamente juros à taxa legal em vigor, majorada, a contar da data de exigibilidade até ao pagamento integral, sem prejuízo do disposto no artigo 1231-6 do Código Civil francês.",
  mp_art10Title: "ADVERTÊNCIA SOBRE OS RISCOS",
  mp_art10Text:
    "Cada Mutuante é avisado e alertado, em conformidade com o artigo L.548-6 do Código Monetário e Financeiro francês, sobre o modo de funcionamento do financiamento colaborativo, e nomeadamente:",
  mp_art10Items: [
    "o risco de perda total ou parcial do capital mutuado em caso de incumprimento do Mutuário;",
    "a ausência de garantia de reembolso pelo Intermediário, que não é mutuante, nem fiador, nem segurador;",
    "o risco de iliquidez das quantias mutuadas antes do vencimento convencionado;",
    "a necessidade de diversificar os seus investimentos.",
  ],
  mp_art11Title: "EXIGIBILIDADE ANTECIPADA",
  mp_art11Text:
    "O Intermediário, em nome e por conta dos Mutuantes, poderá invocar a exigibilidade imediata do empréstimo, sem pré-aviso nem formalidade judicial prévia, nomeadamente em caso de não pagamento não regularizado no prazo de 15 dias após interpelação, de processo de insolvência que vise o Mutuário, de inexatidão de uma declaração ou de manobra fraudulenta.",
  mp_art12Title: "GESTÃO DO INCUMPRIMENTO DO MUTUÁRIO",
  mp_art12Text:
    "Em caso de incumprimento, o Intermediário notifica os Mutuantes e envia ao Mutuário um aviso de cobrança e, na falta de regularização no prazo de 15 dias, uma interpelação. Na falta de pagamento, o Intermediário poderá promover qualquer cobrança amigável ou judicial por conta dos Mutuantes que para tal o autorizem.",
  mp_art13Title: "DIREITO DE LIVRE REVOGAÇÃO",
  mp_art13Callout:
    "a existência e a duração de um direito de livre revogação dependem do estatuto regulamentar preciso do Intermediário (IFP nacional ou PSFP na aceção do Regulamento ECSP 2020/1503) e da qualificação do Mutuante. O artigo R.548-6 impõe a menção deste direito e das suas modalidades.",
  mp_art14Title: "PAPEL E RESPONSABILIDADE DO INTERMEDIÁRIO",
  mp_art14Text:
    "O Intermediário atua na qualidade de mandatário dos Mutuantes. Não é, em caso algum, parte mutuante, não garante nem o capital nem os juros, e a sua responsabilidade não poderá ser acionada pelo simples facto do incumprimento do Mutuário, sem prejuízo das suas obrigações de boa conduta nos termos dos artigos L.548-1 e seguintes.",
  mp_art15Title: "DADOS PESSOAIS",
  mp_art15Text:
    "Os dados pessoais das Partes são tratados pelo Intermediário, responsável pelo tratamento, em conformidade com o RGPD e com a Lei francesa n.º 78-17, de 6 de janeiro de 1978, alterada, exclusivamente para efeitos de execução do contrato e de cumprimento das obrigações legais aplicáveis.",
  mp_art16Title: "LEI APLICÁVEL E JURISDIÇÃO COMPETENTE",
  mp_art16Text:
    "O presente contrato rege-se pelo direito francês. Qualquer litígio relativo à sua validade, interpretação ou execução será submetido à competência exclusiva dos tribunais franceses territorialmente competentes, sem prejuízo das normas de ordem pública aplicáveis.",
  mp_signBorrowerLabel: "O Mutuário",
  mp_signIntermediaryLabel: "Pelo Intermediário, Lentific",
  mp_annex1Title: "ANEXO 1 - PLANO DE AMORTIZAÇÃO",
  mp_annex1Subtitle: "Empréstimo de {amount} · {duration} mensalidades · taxa fixa {rate} % · mensalidade {monthly}",
  mp_annex1Headers: ["Prest.", "Data", "Capital", "Juros", "Mensalidade", "Capital em dívida"],
  mp_annex2Title: "ANEXO 2 - FICHA DE INFORMAÇÃO SINTÉTICA",
  mp_annex2RowLabels: [
    "Mutuário",
    "Montante mutuado",
    "Duração",
    "Taxa devedora fixa",
    "Mensalidade",
    "Custo total do crédito",
    "Pontuação de risco interna",
    "Risco principal para o Mutuante",
  ],
  mp_annex2MainRiskText: "Perda parcial ou total do capital mutuado (Artigo 10)",
  mp_annex3Title: "ANEXO 3 - BOLETIM DE SUBSCRIÇÃO (MODELO)",
  mp_annex3Text:
    "Eu, abaixo assinado(a), [Nome do Mutuante], declaro subscrever o financiamento do Mutuário designado no presente documento, pelo montante de [montante] EUR, e reconheço ter tomado conhecimento e aceitado, sem reservas, a totalidade das estipulações do presente contrato referenciado {reference}, nomeadamente a advertência sobre os riscos constante do Artigo 10.",
  mp_footerNote:
    "Documento gerado automaticamente pela plataforma Lentific a partir do processo {reference}. As menções assinaladas «a confirmar» devem ser completadas com os dados de registo reais da sociedade e validadas por um advogado antes de qualquer utilização em produção. Estrutura estabelecida por referência aos artigos L.548-1 e seguintes e R.548-1 e seguintes (nomeadamente R.548-6) do Código Monetário e Financeiro francês.",

  dl_pdfTitle: "Contrato de mútuo direto - {reference}",
  dl_mainTitle: "CONTRATO DE MÚTUO ENTRE PARTICULARES",
  dl_mainSubtitle: "Empréstimo direto celebrado entre as partes na sequência de um contacto estabelecido através da plataforma Lentific",
  dl_borrowerHeading: "O MUTUÁRIO",
  dl_borrowerText: "{name} ({email}){cityPart}, doravante «o Mutuário».",
  dl_borrowerCityPart: ", domiciliado(a) em {city}",
  dl_lenderHeading: "O MUTUANTE",
  dl_lenderText: "{name} ({email}), doravante «o Mutuante».",
  dl_preambleHeading: "PREÂMBULO",
  dl_preambleText:
    "{borrowerName} e {lenderName} foram postos em contacto através da plataforma Lentific, mediante o pagamento dos encargos de intermediação previstos pela Plataforma. As Partes acordaram, fora de qualquer financiamento fracionado ou intermediação regulada pela Plataforma, celebrar diretamente entre si o presente contrato de mútuo no montante de {amount}. A Lentific não é mutuante, nem mutuária, nem intermediário de financiamento colaborativo no âmbito do presente contrato: o seu papel limita-se a ter posto as Partes em contacto e à geração do presente documento.",
  dl_art1Title: "OBJETO DO CONTRATO",
  dl_art1Text:
    "O presente contrato fixa as condições segundo as quais o Mutuante concede ao Mutuário, diretamente, um empréstimo de dinheiro remunerado, bem como as modalidades do seu reembolso.",
  dl_art2Title: "CARACTERÍSTICAS FINANCEIRAS DO EMPRÉSTIMO",
  dl_art2RowLabels: ["Montante do empréstimo", "Duração", "Taxa de juro anual", "Mensalidade", "Custo total do crédito"],
  dl_art3Title: "ENTREGA DOS FUNDOS",
  dl_art3Text:
    "As Partes acordam livremente entre si as modalidades de entrega dos fundos pelo Mutuante ao Mutuário, não intervindo a Plataforma, a qualquer título, nessa entrega.",
  dl_art4Title: "REEMBOLSO E PLANO DE AMORTIZAÇÃO",
  dl_art4Text:
    "O empréstimo é reembolsável segundo o plano de amortização indicativo constante do Anexo 1, diretamente entre as Partes, sem intervenção da Plataforma.",
  dl_art4Callout:
    "um empréstimo entre particulares pode estar sujeito ao Código do Consumo francês (crédito ao consumo), consoante a qualidade das Partes e o montante em causa, com obrigações específicas (oferta prévia, prazo de livre revogação): a verificar antes da assinatura.",
  dl_art5Title: "REEMBOLSO ANTECIPADO",
  dl_art5Text:
    "O Mutuário pode, a qualquer momento, reembolsar antecipadamente, no todo ou em parte, as quantias em dívida, salvo estipulação em contrário expressamente acordada entre as Partes.",
  dl_art6Title: "INCUMPRIMENTO DE PAGAMENTO",
  dl_art6Text:
    "Em caso de incumprimento no respetivo vencimento, as quantias em dívida vencerão automaticamente juros à taxa legal em vigor, majorada, a contar da data de exigibilidade até ao pagamento integral, sem prejuízo do disposto no artigo 1231-6 do Código Civil francês.",
  dl_art7Title: "ADVERTÊNCIA SOBRE OS RISCOS",
  dl_art7Text: "O Mutuante reconhece ter sido informado e alertado sobre os riscos inerentes a um empréstimo direto a um particular, e nomeadamente:",
  dl_art7Items: [
    "o risco de perda total ou parcial do capital mutuado em caso de incumprimento do Mutuário;",
    "a ausência de qualquer garantia de reembolso pela Lentific, que não é mutuante, nem fiadora, nem seguradora, nem intermediário de financiamento colaborativo no âmbito do presente contrato;",
    "o risco de iliquidez das quantias mutuadas antes do vencimento convencionado;",
    "o interesse em fazer verificar o presente contrato por um profissional do direito antes da assinatura, sendo este documento apenas um modelo.",
  ],
  dl_art8Title: "PAPEL DA LENTIFIC",
  dl_art8Text:
    "A Lentific não é parte, a qualquer título, no presente contrato, não garante nem o capital nem os juros, e o seu papel limita-se a ter posto as Partes em contacto. O que ocorrer entre as Partes a partir da assinatura do presente contrato tem lugar fora da Plataforma e não responsabiliza a Lentific.",
  dl_art9Title: "DADOS PESSOAIS",
  dl_art9Text:
    "Os dados pessoais trocados no âmbito do contacto estabelecido foram tratados pela Lentific em conformidade com o RGPD; as Partes permanecem as únicas responsáveis pelo tratamento que fazem dos dados da outra Parte, uma vez estabelecido o contacto.",
  dl_art10Title: "LEI APLICÁVEL E JURISDIÇÃO COMPETENTE",
  dl_art10Text:
    "O presente contrato rege-se pelo direito francês. Qualquer litígio relativo à sua validade, interpretação ou execução será submetido à competência exclusiva dos tribunais franceses territorialmente competentes, sem prejuízo das normas de ordem pública aplicáveis.",
  dl_signBorrowerLabel: "O Mutuário",
  dl_signLenderLabel: "O Mutuante",
  dl_annex1Title: "ANEXO 1 - PLANO DE AMORTIZAÇÃO INDICATIVO",
  dl_annex1Subtitle: "Empréstimo de {amount} · {duration} mensalidades · taxa fixa {rate} % · mensalidade {monthly}",
  dl_annex1Headers: ["Prest.", "Data", "Capital", "Juros", "Mensalidade", "Capital em dívida"],
  dl_footerNote:
    "Documento gerado automaticamente pela plataforma Lentific a partir do contacto referenciado {reference}. Este contrato é um MODELO: a validar por um profissional do direito antes da assinatura, nomeadamente quanto à eventual qualificação como crédito ao consumo (Artigo 4).",
};
