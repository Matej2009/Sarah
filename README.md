# SARAH — web kapely (sarahcb.cz)

Statický web hardrockové kapely Sarah z Českých Budějovic. Čisté HTML, CSS a JS,
bez build kroku a bez knihoven. Hostuje se na GitHub Pages z větve `main`.

```
index.html      Domů
kapela.html     Příběh a sestava (bio členů)
hudba.html      Album Sarah (2012), repertoár
media.html      Videa a galerie s prohlížečem fotek
koncerty.html   Nadcházející a odehrané koncerty, odpočet
kontakt.html    Booking a kontakty
404.html        Chybová stránka
styles.css      Vzhled všech stránek
script.js       Data (koncerty, videa, fotky) a chování stránek
assets/         favicon, assets/photos/ pro skutečné fotky kapely
```

## Jak upravit obsah

Data jsou nahoře ve `script.js`:

- **Koncerty** – pole `GIGS`. Budoucí termín se sám ukáže na úvodní stránce
  a na stránce Koncerty (s odpočtem), po datu se přesune do „Odehráno“.
- **Videa** – pole `VIDEOS` (id z YouTube adresy za `watch?v=`).
- **Skutečné fotky** (např. z Facebooku kapely) – nahrajte do `assets/photos/`
  (JPG, do 300 kB) a vyplňte ve `script.js`:
  - `HERO_PHOTOS` – velké fotky na pozadí úvodní stránky (na šířku, 1920 px),
  - `MEMBER_PHOTOS` – portréty na kartách členů na stránce Kapela (na výšku, 900 × 1200 px),
  - `PHOTOS` – galerie na stránce Foto a video (šířka 1600 px).
  Dokud jsou seznamy prázdné, web ukazuje záběry z videí kapely.
- **Originální logo** – zatím je překreslené jako SVG (symbol `#sarah-logo`). Až bude
  soubor s originálem, nahradí se v hlavičce, úvodu, patičce a na obalu alba.
- **Booking e-mail/telefon** – v `kontakt.html` je připravené místo (`TODO`).

Hlavička a patička jsou v každé stránce stejné – při změně menu upravte všechny.

## Vzhled

Jednoduchý, čistý web: tmavé pozadí, jedno písmo (Archivo), jeden červený akcent, hodně prostoru.

- **Úvod** – velké logo přes fotku; na počítači za ním tiše běží záznam z koncertu (YouTube).
  Malé tlačítko vpravo dole zapne zvuk. Video se mění v `index.html` (`data-video`, `data-start`).
- **Sekce úvodní stránky** – o kapele s čísly, koncerty, album, videa, sestava, citace z recenze, booking.
- **Animace** – jen jemné: obsah se při posouvání plynule objeví, fotky se pomalu prolínají,
  obal alba při najetí vysune desku.
- **Trsátko místo kurzoru** – červené trsátko, které se naklání podle pohybu myši.
- Menší náhledy z YouTube mají v sobě černé pruhy – web je automaticky ořízne.
- Prohlížeč fotek v galerii (šipky, Esc, na mobilu přejetí prstem).

Logo SARAH je překreslené jako SVG (sdílený symbol `#sarah-logo` na začátku každé stránky).
Úvodní stránka obsahuje strukturovaná data pro vyhledávače (kapela, členové, album).

## Výkon

Žádné knihovny. Animuje se jen transform/opacity/clip-path, smyčky běží jen pro viditelné
prvky. YouTube se načítá až po kliknutí na video (kromě tichého videa v úvodu, které se na mobilu
a při šetření dat nenačítá), obrázky líně. Efekty u kurzoru jen s myší;
při „omezit pohyb“ v systému se všechny animace vypnou.

## Ověřit s kapelou

Obsah je z veřejných zdrojů (Bandzone, Hardmusicbase, Českobudějovický deník,
Musicgate, YouTube, Wikipedie). Zkontrolujte hlavně:

- bia členů (Przeczek: Motorband, Bloody Rose, Starý Extract; Franc: Seven 1996–2006;
  Troup: Kambodža 2022–2024) a doplňte info o Josefu Jakešovi
- přesné datum Seven Festu 2023 (zatím jen „duben 2023“)
- repertoár na stránce Hudba

## Doména

DNS u GoDaddy: 4× A záznam `@` → 185.199.108.153 / .109.153 / .110.153 / .111.153,
CNAME `www` → matej2009.github.io. V Settings → Pages zapnout Enforce HTTPS.
