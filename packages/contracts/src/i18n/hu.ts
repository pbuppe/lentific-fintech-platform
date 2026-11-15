import type { ContractStrings } from "./types";

export const hu: ContractStrings = {
  bannerLabel: "MINTA: automatikusan generált dokumentum, éles használat előtt jogásszal jóváhagyandó",
  bannerRef: "Ügyiratszám: {reference}, generálva: {date}",
  articleWord: "CIKK",
  calloutPrefix: "JOGI TANÁCSADÓ ÁLTAL MEGERŐSÍTENDŐ",
  durationUnit: "hónap",
  signElectronic: "(elektronikus aláírás)",
  noScoreAvailable: "Nem elérhető",

  mp_pdfTitle: "Kölcsönszerződés - {reference}",
  mp_mainTitle: "KÖZÖSSÉGI FINANSZÍROZÁSÚ KÖLCSÖNSZERZŐDÉS",
  mp_mainSubtitle:
    "A francia Monetáris és Pénzügyi Törvénykönyv L.548-1. és azt követő, valamint R.548-1. és azt követő cikkei alapján készült",
  mp_intermediaryHeading: "A KÖZÖSSÉGI FINANSZÍROZÁS KÖZVETÍTŐJE",
  mp_intermediaryText:
    "A Lentific társaság, [kiegészítendő: társasági forma], [kiegészítendő: összeg] euró alaptőkével, [kiegészítendő: székhely címe], a [város] RCS-nél (a francia cégjegyzékben) [megerősítendő: SIREN-szám] szám alatt bejegyezve, az ORIAS-nál közösségi finanszírozási közvetítőként [megerősítendő: ORIAS-szám] szám alatt nyilvántartva, a továbbiakban: „a Közvetítő” vagy „Lentific”, amely a Kölcsönadók megbízottjaként jár el, anélkül hogy maga kölcsönadó félként szerepelne.",
  mp_borrowerHeading: "AZ ADÓS",
  mp_borrowerText: "{name} ({email}){cityPart}, szakmai minőségében eljárva, a továbbiakban: „az Adós”.",
  mp_borrowerCityPart: ", lakóhelye: {city}",
  mp_lendersHeading: "A KÖLCSÖNADÓ(K)",
  mp_lendersText:
    "Azok a természetes vagy jogi személyek, akiknek személyazonossága, elérhetőségei és az általuk egyénileg kölcsönzött részesedés a 3. mellékletben (Jegyzési ívek) szerepel, amely Kölcsönadók mindegyike egyénileg és egymás között egyetemlegesség nélkül jár el, a továbbiakban együttesen: „a Kölcsönadók”.",
  mp_preambleHeading: "PREAMBULUM",
  mp_preambleText1:
    "Az Adós a Lentific platformon {amount} összegű, szakmai célú felhasználásra szánt finanszírozási kérelmet nyújtott be. Ez az ügyirat személyazonosság-ellenőrzésen, a Platform kockázatelemző motorja által végzett visszafizetési képesség vizsgálatán{riskPart}, majd egy arra jogosult ügyintéző általi felülvizsgálaton esett át, amelynek eredményeként ajánlat került kidolgozásra, amelyet az Adós elfogadott.",
  mp_preambleRiskPart: " (elért pontszám: {score}/100)",
  mp_preambleText2:
    "A jelen szerződés rögzíti e finanszírozás feltételeit, amelyet egy vagy több Kölcsönadó biztosít a Platform P2P piacterén, az 5. Cikkben leírt megosztott finanszírozási feltételek szerint.",
  mp_art1Title: "FOGALOMMEGHATÁROZÁSOK",
  mp_art1Items: [
    "„a Platform” a Lentific által üzemeltetett weboldalt és alkalmazást jelenti.",
    "„a kölcsönalapú közösségi finanszírozás” (crowdlending) azt a műveletet jelenti, amelynek keretében egy vagy több Kölcsönadó kamatozó kölcsönt nyújt az Adósnak, a francia Monetáris és Pénzügyi Törvénykönyv L.548-1. és azt követő cikkeivel összhangban.",
    "„a THM” a teljes hiteldíj mutatót jelenti.",
    "„a Törlesztési Ütemterv” az 1. mellékletben szereplő törlesztési táblázatot jelenti.",
  ],
  mp_art2Title: "A FELEK NYILATKOZATAI ÉS SZAVATOSSÁGVÁLLALÁSAI",
  mp_art2Sub1: "2.1 Közös nyilatkozatok",
  mp_art2Text1:
    "Mindegyik Fél kijelenti, hogy teljes jogi cselekvőképességgel rendelkezik a szerződéskötéshez, és az aláírás időpontjában nincs fizetésképtelenségi helyzetben.",
  mp_art2Sub2: "2.2 Az Adós nyilatkozatai",
  mp_art2Text2:
    "Az Adós kijelenti, hogy a kérelme keretében megadott információk pontosak, valósághűek és naprakészek, és hogy nem következett be olyan esemény, amely befolyásolhatná a visszafizetési képességét, anélkül hogy erről a Platformot tájékoztatta volna.",
  mp_art2Sub3: "2.3 A Kölcsönadók nyilatkozatai",
  mp_art2Text3:
    "Mindegyik Kölcsönadó kijelenti, hogy megismerte az összefoglaló tájékoztatót (2. melléklet), és elismeri, hogy tájékoztatták és figyelmeztették a 10. Cikkben leírt kockázatokra.",
  mp_art3Title: "A SZERZŐDÉS TÁRGYA",
  mp_art3Text:
    "A jelen szerződés rögzíti azokat a feltételeket, amelyek szerint a Kölcsönadók a Platform közvetítésével kamatozó pénzkölcsönt nyújtanak az Adósnak, valamint annak visszafizetési módját.",
  mp_art4Title: "A KÖLCSÖN PÉNZÜGYI JELLEMZŐI",
  mp_art4RowLabels: [
    "A hitel teljes összege",
    "Futamidő",
    "Alkalmazandó rögzített hitelkamatláb (éves)",
    "Havi törlesztőrészlet (biztosítás nélkül)",
    "A kamatok teljes összege",
    "A hitel teljes költsége",
  ],
  mp_art4TaegLabel: "THM",
  mp_art4TaegValue: "a Közvetítő által a közzététel előtt kiszámítandó",
  mp_art5Title: "A PÉNZESZKÖZÖK RENDELKEZÉSRE BOCSÁTÁSA ÉS A MEGOSZTOTT FINANSZÍROZÁS",
  mp_art5Text1:
    "A pénzeszközöket a P2P piactéren gyűjtik össze a teljes összeg eléréséig: mindegyik Kölcsönadó egy részesedést finanszíroz, anélkül hogy bármelyik Kölcsönadó a saját részesedésén túl felelne, vagy a többi Kölcsönadóval egyetemlegesen felelne. Az összeg összegyűjtését követően a pénzeszközöket átutalással folyósítják az Adósnak, adott esetben a 8. Cikkben említett díjak levonásával.",
  mp_art5Text2:
    "Ha a teljes összeg nem gyűlik össze a Platformon feltüntetett határidőn belül, a finanszírozás meghiúsultnak minősül, és a már befizetett összegeket visszatérítik a Kölcsönadóknak.",
  mp_art6Title: "TÖRLESZTÉS ÉS TÖRLESZTÉSI ÜTEMTERV",
  mp_art6Text:
    "A kölcsön állandó törlesztés szerint fizetendő vissza, az 1. mellékletben szereplő táblázatnak megfelelően. A törlesztéseket a Közvetítő osztja szét mindegyik Kölcsönadó között a részesedésük arányában.",
  mp_art7Title: "ELŐTÖRLESZTÉS",
  mp_art7Text: "Az Adós bármikor jogosult a fennálló tartozás egészét vagy egy részét előtörleszteni.",
  mp_art7Callout: "alkalmazandó-e előtörlesztési díj, és ha igen, milyen jogszabályi felső korlát szerint?",
  mp_art8Title: "A KÖZVETÍTŐ DÍJAI",
  mp_art8Text:
    "A Közvetítő olyan díjakat szed, amelyek elve és díjtáblázata megegyezik az érintett termékre a jelen szerződés megkötésének napján alkalmazandó díjszámító motor (Fee Engine) által meghatározottakkal.",
  mp_art8Callout: "a pontos díjtáblázatot a közzététel előtt mellékletként csatolni kell.",
  mp_art9Title: "FIZETÉSI KÉSEDELEM ÉS KÉSEDELMI KAMAT",
  mp_art9Text:
    "Esedékességkori fizetés elmaradása esetén, előzetes felszólítás szükségessége nélkül, a meg nem fizetett összegek a jog erejénél fogva a hatályos, felemelt törvényes kamatláb szerinti kamatot viselik az esedékesség napjától a teljes megfizetésig, a francia Polgári Törvénykönyv 1231-6. cikkének sérelme nélkül.",
  mp_art10Title: "KOCKÁZATI FIGYELMEZTETÉS",
  mp_art10Text:
    "Mindegyik Kölcsönadót a francia Monetáris és Pénzügyi Törvénykönyv L.548-6. cikkével összhangban tájékoztatják és figyelmeztetik a közösségi finanszírozás működési módjáról, így különösen:",
  mp_art10Items: [
    "a kölcsönzött tőke teljes vagy részleges elvesztésének kockázatáról az Adós nemteljesítése esetén;",
    "arról, hogy a Közvetítő nem vállal garanciát a visszafizetésre, mivel nem kölcsönadó, nem kezes és nem biztosító;",
    "a kölcsönzött összegek illikviditásának kockázatáról a megállapodott lejárat előtt;",
    "a befektetései diverzifikálásának szükségességéről.",
  ],
  mp_art11Title: "ELŐREHOZOTT ESEDÉKESSÉ VÁLÁS",
  mp_art11Text:
    "A Közvetítő a Kölcsönadók nevében és javára hivatkozhat a kölcsön azonnali esedékességére, előzetes értesítés vagy előzetes bírósági formalitás nélkül, így különösen a felszólítást követő 15 napon belül nem rendezett nemfizetés, az Adóst érintő fizetésképtelenségi eljárás, egy nyilatkozat pontatlansága vagy csalárd magatartás esetén.",
  mp_art12Title: "AZ ADÓS NEMTELJESÍTÉSÉNEK KEZELÉSE",
  mp_art12Text:
    "Nemfizetés esetén a Közvetítő értesíti a Kölcsönadókat, és fizetési felszólítást küld az Adósnak, majd a 15 napon belüli rendezés elmaradása esetén felszólítást. Fizetés hiányában a Közvetítő az erre felhatalmazó Kölcsönadók javára peren kívüli vagy bírósági behajtást kezdeményezhet.",
  mp_art13Title: "ELÁLLÁSI JOG",
  mp_art13Callout:
    "az elállási jog fennállása és időtartama a Közvetítő pontos szabályozói státuszától (nemzeti IFP vagy az (EU) 2020/1503 rendelet (ECSP) szerinti PSFP) és a Kölcsönadó minősítésétől függ. A R.548-6. cikk előírja e jog és annak feltételei feltüntetését.",
  mp_art14Title: "A KÖZVETÍTŐ SZEREPE ÉS FELELŐSSÉGE",
  mp_art14Text:
    "A Közvetítő a Kölcsönadók megbízottjaként jár el. Semmilyen esetben nem minősül kölcsönadó félnek, nem szavatolja sem a tőkét, sem a kamatokat, és felelőssége önmagában az Adós nemteljesítése miatt nem állapítható meg, a francia Monetáris és Pénzügyi Törvénykönyv L.548-1. és azt követő cikkei szerinti magatartási kötelezettségeinek fenntartásával.",
  mp_art15Title: "SZEMÉLYES ADATOK",
  mp_art15Text:
    "A Felek személyes adatait az adatkezelőnek minősülő Közvetítő kezeli, a GDPR-nak és az 1978. január 6-i 78-17. sz. francia törvénynek (módosított formájában) megfelelően, kizárólag a szerződés teljesítése és az alkalmazandó jogi kötelezettségek betartása céljából.",
  mp_art16Title: "ALKALMAZANDÓ JOG ÉS ILLETÉKES BÍRÓSÁG",
  mp_art16Text:
    "A jelen szerződésre a francia jog irányadó. Az érvényességével, értelmezésével vagy teljesítésével kapcsolatos bármely jogvita a területileg illetékes francia bíróságok kizárólagos hatáskörébe tartozik, az alkalmazandó közrendi szabályok fenntartásával.",
  mp_signBorrowerLabel: "Az Adós",
  mp_signIntermediaryLabel: "A Közvetítő nevében, Lentific",
  mp_annex1Title: "1. MELLÉKLET - TÖRLESZTÉSI ÜTEMTERV",
  mp_annex1Subtitle: "{amount} összegű kölcsön · {duration} havi törlesztőrészlet · {rate} %-os rögzített kamatláb · havi törlesztőrészlet: {monthly}",
  mp_annex1Headers: ["Törl.szám", "Dátum", "Tőke", "Kamat", "Törlesztőrészlet", "Egyenleg"],
  mp_annex2Title: "2. MELLÉKLET - ÖSSZEFOGLALÓ TÁJÉKOZTATÓ",
  mp_annex2RowLabels: [
    "Adós",
    "Kölcsönzött összeg",
    "Futamidő",
    "Rögzített hitelkamatláb",
    "Havi törlesztőrészlet",
    "A hitel teljes költsége",
    "Belső kockázati pontszám",
    "A Kölcsönadót érintő fő kockázat",
  ],
  mp_annex2MainRiskText: "A kölcsönzött tőke részleges vagy teljes elvesztése (10. Cikk)",
  mp_annex3Title: "3. MELLÉKLET - JEGYZÉSI ÍV (MINTA)",
  mp_annex3Text:
    "Alulírott [Kölcsönadó neve] kijelentem, hogy jegyzem a jelen okiratban megjelölt Adós finanszírozását [összeg] EUR összegben, és elismerem, hogy megismertem és fenntartás nélkül elfogadtam a {reference} hivatkozási számú jelen szerződés valamennyi rendelkezését, különös tekintettel a 10. Cikkben szereplő kockázati figyelmeztetésre.",
  mp_footerNote:
    "Ezt a dokumentumot a Lentific platform automatikusan generálta a {reference} ügyirat alapján. A „megerősítendő” jelöléssel ellátott adatokat a társaság tényleges cégbejegyzési adataival kell kiegészíteni, és éles használatba állítás előtt ügyvéddel kell egyeztetni. A szerkezet a francia Monetáris és Pénzügyi Törvénykönyv L.548-1. és azt követő, valamint R.548-1. és azt követő cikkei (különösen az R.548-6. cikk) alapján készült.",

  dl_pdfTitle: "Közvetlen kölcsönszerződés - {reference}",
  dl_mainTitle: "MAGÁNSZEMÉLYEK KÖZÖTTI KÖLCSÖNSZERZŐDÉS",
  dl_mainSubtitle: "A Felek között közvetlenül létrejött kölcsön, a Lentific platformon keresztül történő kapcsolatba hozást követően",
  dl_borrowerHeading: "AZ ADÓS",
  dl_borrowerText: "{name} ({email}){cityPart}, a továbbiakban: „az Adós”.",
  dl_borrowerCityPart: ", lakóhelye: {city}",
  dl_lenderHeading: "A KÖLCSÖNADÓ",
  dl_lenderText: "{name} ({email}), a továbbiakban: „a Kölcsönadó”.",
  dl_preambleHeading: "PREAMBULUM",
  dl_preambleText:
    "{borrowerName} és {lenderName} a Lentific platformon keresztül kerültek kapcsolatba egymással, a Platform által előírt kapcsolatba hozási díj megfizetése ellenében. A Felek megállapodtak abban, hogy a Platform által szabályozott bármely megosztott finanszírozáson vagy közvetítésen kívül, közvetlenül egymás között kötik meg a jelen, {amount} összegű kölcsönszerződést. A Lentific a jelen szerződés tekintetében nem kölcsönadó, nem adós és nem közösségi finanszírozási közvetítő: szerepe kizárólag a Felek kapcsolatba hozására és a jelen dokumentum előállítására korlátozódik.",
  dl_art1Title: "A SZERZŐDÉS TÁRGYA",
  dl_art1Text:
    "A jelen szerződés rögzíti azokat a feltételeket, amelyek szerint a Kölcsönadó közvetlenül kamatozó pénzkölcsönt nyújt az Adósnak, valamint annak visszafizetési módját.",
  dl_art2Title: "A KÖLCSÖN PÉNZÜGYI JELLEMZŐI",
  dl_art2RowLabels: ["A kölcsön összege", "Futamidő", "Éves kamatláb", "Havi törlesztőrészlet", "A hitel teljes költsége"],
  dl_art3Title: "A PÉNZESZKÖZÖK FOLYÓSÍTÁSA",
  dl_art3Text:
    "A Felek szabadon állapodnak meg egymás között a pénzeszközöknek a Kölcsönadó által az Adós részére történő folyósítási módjáról, a Platform e folyósításban semmilyen minőségben nem vesz részt.",
  dl_art4Title: "VISSZAFIZETÉS ÉS TÖRLESZTÉSI ÜTEMTERV",
  dl_art4Text:
    "A kölcsön az 1. mellékletben szereplő tájékoztató jellegű törlesztési ütemterv szerint fizetendő vissza, közvetlenül a Felek között, a Platform igénybevétele nélkül.",
  dl_art4Callout:
    "a magánszemélyek közötti kölcsön a Felek minőségétől és az érintett összegtől függően a francia Fogyasztóvédelmi Törvénykönyv (fogyasztói hitel) hatálya alá tartozhat, sajátos kötelezettségekkel (előzetes ajánlat, elállási határidő): aláírás előtt ellenőrizendő.",
  dl_art5Title: "ELŐTÖRLESZTÉS",
  dl_art5Text:
    "Az Adós bármikor jogosult a fennálló tartozás egészét vagy egy részét előtörleszteni, kivéve ha a Felek ettől kifejezetten eltérően állapodtak meg.",
  dl_art6Title: "FIZETÉSI KÉSEDELEM",
  dl_art6Text:
    "Esedékességkori fizetés elmaradása esetén a meg nem fizetett összegek a jog erejénél fogva a hatályos, felemelt törvényes kamatláb szerinti kamatot viselik az esedékesség napjától a teljes megfizetésig, a francia Polgári Törvénykönyv 1231-6. cikkének sérelme nélkül.",
  dl_art7Title: "KOCKÁZATI FIGYELMEZTETÉS",
  dl_art7Text: "A Kölcsönadó elismeri, hogy tájékoztatták és figyelmeztették a magánszemélynek nyújtott közvetlen kölcsönnel járó kockázatokra, így különösen:",
  dl_art7Items: [
    "a kölcsönzött tőke teljes vagy részleges elvesztésének kockázatáról az Adós nemteljesítése esetén;",
    "arról, hogy a Lentific semmilyen garanciát nem vállal a visszafizetésre, mivel a jelen szerződés tekintetében nem kölcsönadó, nem kezes, nem biztosító és nem közösségi finanszírozási közvetítő;",
    "a kölcsönzött összegek illikviditásának kockázatáról a megállapodott lejárat előtt;",
    "annak hasznosságáról, hogy a jelen szerződést aláírás előtt jogi szakemberrel ellenőriztessék, mivel ez a dokumentum kizárólag minta.",
  ],
  dl_art8Title: "A LENTIFIC SZEREPE",
  dl_art8Text:
    "A Lentific semmilyen minőségben nem részes fele a jelen szerződésnek, nem szavatolja sem a tőkét, sem a kamatokat, és szerepe kizárólag a Felek kapcsolatba hozására korlátozódik. Mindaz, ami a Felek között a jelen szerződés aláírásától kezdve történik, a Platformon kívül zajlik, és nem vonja maga után a Lentific felelősségét.",
  dl_art9Title: "SZEMÉLYES ADATOK",
  dl_art9Text:
    "A kapcsolatba hozás keretében megosztott személyes adatokat a Lentific a GDPR-nak megfelelően kezelte; a Felek kizárólagosan felelősek a másik Fél adatainak az általuk a kapcsolatba hozást követően végzett kezeléséért.",
  dl_art10Title: "ALKALMAZANDÓ JOG ÉS ILLETÉKES BÍRÓSÁG",
  dl_art10Text:
    "A jelen szerződésre a francia jog irányadó. Az érvényességével, értelmezésével vagy teljesítésével kapcsolatos bármely jogvita a területileg illetékes francia bíróságok kizárólagos hatáskörébe tartozik, az alkalmazandó közrendi szabályok fenntartásával.",
  dl_signBorrowerLabel: "Az Adós",
  dl_signLenderLabel: "A Kölcsönadó",
  dl_annex1Title: "1. MELLÉKLET - TÁJÉKOZTATÓ JELLEGŰ TÖRLESZTÉSI ÜTEMTERV",
  dl_annex1Subtitle: "{amount} összegű kölcsön · {duration} havi törlesztőrészlet · {rate} %-os rögzített kamatláb · havi törlesztőrészlet: {monthly}",
  dl_annex1Headers: ["Törl.szám", "Dátum", "Tőke", "Kamat", "Törlesztőrészlet", "Egyenleg"],
  dl_footerNote:
    "Ezt a dokumentumot a Lentific platform automatikusan generálta a {reference} hivatkozási számú kapcsolatba hozás alapján. Ez a szerződés MINTA: aláírás előtt jogi szakemberrel jóváhagyandó, különös tekintettel az esetleges fogyasztói hitelnek minősítésre (4. Cikk).",
};
