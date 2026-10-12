# SARAH — web kapely (sarahcb.cz)

Statický web hardrockové kapely Sarah z Českých Budějovic. Čisté HTML, CSS a JS,
bez build kroku a bez knihoven. Hostuje se na GitHub Pages z větve `main`.

```
index.html        Domů
kapela.html       O nás: fotka kapely (každý člen je odkaz), příběh, historie
petr-hajek.html   Stránky členů (kytara, bicí, zpěv, baskytara)
slavek-franc.html
zdenek-troup.html
josef-jakes.html
hudba.html        Album Sarah (2012), repertoár
media.html        Videa a galerie s prohlížečem fotek
koncerty.html     Nadcházející a odehrané koncerty, odpočet
kontakt.html      Booking: telefon 778 885 465 a další kontakty
404.html          Chybová stránka
styles.css        Vzhled všech stránek
script.js         Data (koncerty, videa, fotky, sestava, telefon) a chování stránek, chat
assets/           logo, ikona webu, fotky kapely (assets/photos/)
chat-worker/      Volitelný server, díky kterému chat odpovídá pomocí Claude (návod uvnitř)
```

## Jak upravit obsah

Data jsou nahoře ve `script.js`:

- **Koncerty** – pole `GIGS`. Budoucí termín se sám ukáže na úvodní stránce
  a na stránce Koncerty (s odpočtem), po datu se přesune do „Odehráno“. Chat ho zná taky.
- **Videa** – pole `VIDEOS` (id z YouTube adresy za `watch?v=`).
- **Fotky** – nahrajte do `assets/photos/` (JPG, do 300 kB) a doplňte do `PHOTOS`
  (galerie, skutečné fotky jsou před záběry z videí).
- **Úvodní banner** – `assets/photos/banner.jpg` (1600 × 592). Kde na něm kdo stojí (světla
  a klikací místa) je ve zdrojovém skriptu stránek v `STAGE`, kam kamera na mobilu jede je
  ve `script.js` v `initStage` (`CENTER`). Při výměně banneru je potřeba obojí upravit.
- **Sestava** – fotka kapely je `assets/photos/kapela.jpg`, portréty `assets/photos/clenove/`
  (400 × 540 px). Kdo kde na fotce stojí a texty o členech jsou ve zdrojovém skriptu stránek
  (`MEMBERS`); jména a nástroje pro chat jsou ve `script.js` (`MEMBERS`).
  U Petra Hájka zatím chybí víc informací – stačí doplnit pár vět.
- **Booking telefon** – 778 885 465 (`BOOKING_PHONE` ve `script.js`, v HTML na stránce
  Kontakt, v patičce, v menu na mobilu a v sekci „Zahrajeme i u vás“).
- **Logo** – originální logo kapely. Písmena a „Hard rock“ jsou převedené do vektorů
  (`assets/logo.svg`, ostré v jakékoli velikosti), žena je výřez `assets/logo-woman.webp`.
  V hlavičce je jen nápis SARAH, na úvodu, na obalu alba a v patičce celé logo.

Hlavička a patička jsou v každé stránce stejné – při změně menu upravte všechny.

## Chat

Tlačítko „Máte dotaz?“ vpravo dole otevře asistenta kapely. Odpovídá na jednoduché dotazy
(kdy hrajete, jak vás pozvat, kdo je v kapele, kde si vás poslechnout, album, historie)
z údajů ve `script.js` – nic si nevymýšlí, a co neví, odkáže na telefon 778 885 465.
Rozhovor vydrží při přechodu mezi stránkami.

Aby odpovídala skutečná umělá inteligence (Claude), stačí nasadit server ze složky
`chat-worker/` a jeho adresu vložit do `CHAT_API` ve `script.js` – návod je
v `chat-worker/README.md`. Potřebuje API klíč od Anthropicu (platí se podle použití).

## Vzhled

Web je pódium: černá scéna, logo SARAH visí jako backdrop, červené a jantarové světlo
reflektorů a kapela hraje naživo v pozadí. Jedno písmo (Archivo), velké a dobře čitelné.

- **Úvod: světla na pódium** – přes celou obrazovku banner s kapelou. Při posouvání dolů
  červené pozadí potemní a postupně se rozsvítí reflektory: nejdřív na logo, pak na Petra,
  Slávka, Zdeňka a Josefa – každý reflektor se přihoupne ze strany, naskočí s pár záškuby
  jako unavené světlo, dopadne bílým zábleskem a obraz sebou lehce cukne; občas ještě
  zabliká. Scéna jde za kolečkem myši plynule, ne po skocích. Když svítí všichni, všechna
  světla naráz zazáří a objeví se jména a každý je odkaz na svou stránku; po najetí
  myší jeho světlo zesílí a ostatní potemní. Na mobilu kamera přejíždí od jednoho k druhému
  a nakonec ukáže celou kapelu se jmény.
- **Pustit se zvukem** – jantarové tlačítko pustí Křídla živě z Jílovic (YouTube se načte až
  po kliknutí a zůstane skryté, na obrazovce dál svítí pódium). Malý přepínač zvuku pak
  zůstane vlevo dole. Když se přehrávač nespustí, stejná písnička se pustí na velké obrazovce
  v sekci Naživo. Video se mění v `index.html` (`data-audio`, `data-start`).
- **Naše cesta** – roky 1992, 2012, 2014, 2023 a dnes na lince, která se při posouvání vybarví.
- **Naživo** – velká obrazovka a seznam videí vedle.
- **Album** – při posouvání vyjíždí z obalu deska.
- **O nás** – fotka kapely: po najetí myší se ostatní ztlumí jako pod reflektorem a kliknutím
  se otevře stránka člena. Na mobilu jsou pod fotkou jména s portréty.
- **Chat** – asistent kapely vpravo dole (viz výše).
- Mezi stránkami se plynule prolíná (View Transitions v Chrome, Edge a Safari).
- **Trsátko místo kurzoru** – červené trsátko, které se naklání podle pohybu myši.
- Menší náhledy z YouTube mají v sobě černé pruhy – web je automaticky ořízne.

Úvodní stránka obsahuje strukturovaná data pro vyhledávače (kapela, členové, album).

## Výkon

Žádné knihovny. Animuje se jen transform/opacity/clip-path, smyčky běží jen pro viditelné
prvky. YouTube se načítá až po kliknutí (i zvuk v úvodu), obrázky líně. Efekty u kurzoru jen s myší;
při „omezit pohyb“ v systému se všechny animace vypnou.

## Ověřit s kapelou

Obsah je z veřejných zdrojů (Bandzone, Hardmusicbase, Českobudějovický deník,
Musicgate, YouTube, Wikipedie). Zkontrolujte hlavně:

- bia členů (Franc: Seven 1996–2006; Troup: Kambodža 2022–2024) a doplňte info
  o Petru Hájkovi a Josefu Jakešovi
- složení kapely na albu Sarah 2012 (Troup, Przeczek, Jakeš, Holčapek)
- přesné datum Seven Festu 2023 (zatím jen „duben 2023“)
- repertoár na stránce Hudba

## Doména

DNS u GoDaddy: 4× A záznam `@` → 185.199.108.153 / .109.153 / .110.153 / .111.153,
CNAME `www` → matej2009.github.io. V Settings → Pages zapnout Enforce HTTPS.
