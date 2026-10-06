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
  - `MEMBER_PHOTOS` – portréty na kartách členů (na výšku, 900 × 1200 px),
  - `PHOTOS` – galerie na stránce Foto a video (šířka 1600 px).
  Dokud jsou seznamy prázdné, web ukazuje záběry z videí kapely.
- **Originální logo** – zatím je překreslené jako SVG (symbol `#sarah-logo`). Až bude
  soubor s originálem, nahradí se v hlavičce, úvodu, patičce a na obalu alba.
- **Booking e-mail/telefon** – v `kontakt.html` je připravené místo (`TODO`).

Hlavička a patička jsou v každé stránce stejné – při změně menu upravte všechny.

## Vzhled

Tmavý, moderní „editorial“ web: jedno písmo (Archivo), jeden červený akcent, velká
typografie a pohyb řízený posouváním.

- **Intro** (úvod, jednou za návštěvu) – logo se nakreslí tah po tahu s počítadlem 0–100.
- **Živé video v úvodu** – na počítači za logem tiše běží záznam z koncertu (YouTube, bez zvuku).
  Tlačítko **Pustit se zvukem** zapne zvuk; když video odjede z obrazovky, zastaví se.
  Video pro úvod se mění v `index.html` (`data-video` a `data-start` u `.hero__video`).
- **Červený pás** s názvy písní a **červená recenze** – výrazné barevné předěly mezi sekcemi.
- **Plakáty koncertů** – každý termín z `GIGS` má vlastní plakát (logo, datum, razítko
  „Odehráno“ / „Přijď!“). Na úvodu je vedle termínů, na stránce Koncerty celá nástěnka.
- **Kreslené nástroje** – dokud nejsou fotky členů, karty ukazují mikrofon, kytaru, basu a bicí.
- **Facebook** – sekce s příspěvky kapely; obsah z Facebooku se načte až po kliknutí (cookies).
- **Videa** – velký přehrávač a seznam dalších videí vedle.
- **Úvod** – logo přes celou šířku s červeným odleskem po obrysu, houpající se reflektory,
  filmové zrno; fotka a logo se s myší posouvají proti sobě, při posouvání se fotka zpomalí.
- **Pás písní** – obří názvy písní jedou do strany, rychleji a ve směru posouvání.
- **Úvodní text** se rozsvěcuje slovo po slovu, čísla se dopočítají.
- **Koncerty** – po najetí myší se u kurzoru objeví fotka. Když není ohlášený koncert, ukáže se
  panel „Nové termíny“; jinak karta s odpočtem a tlačítkem **Přidat do kalendáře** (soubor .ics).
- **Album** – obal stojí na místě a při posouvání z něj vyjíždí deska.
- **Recenze** – velká citace Českobudějovického deníku, slova vyjíždějí postupně.
- **Sestava** – velká jména; po najetí se u kurzoru ukáže portrét (z `MEMBER_PHOTOS`).
  Na stránce Kapela se karty členů naklánějí za myší.
- **Z pódia** – na počítači se posouváním jede pás fotek a let do strany (s ukazatelem),
  na mobilu se posouvá prstem.
- **Trsátko místo kurzoru** – červené trsátko se naklání podle pohybu, nad odkazy se zvětší, při kliknutí
  „brnkne“ a nad videi a fotkami ukáže „Přehrát“ / „Zvětšit“. Prohlížeč fotek s počítadlem.
- **Ruční poznámky** – červeným fixem psané poznámky (písmo Caveat Brush) se při posouvání „dopíšou“
  a nakreslí si šipku; slovo „nahlas“ se podtrhne, „zaboduje“ zakroužkuje. Na stránce Hudba je
  ručně psaný setlist přilepený páskou, fotky v pásu Z pódia jsou nalepené trochu nakřivo.
- **Přechod mezi stránkami** – černá opona s logem; červená linka nahoře ukazuje postup čtení.
- Text odkazů a tlačítek při najetí „odroluje“, tlačítka se přitahují ke kurzoru,
  patička s velkým logem se odkryje zpod stránky, hlavička se při posouvání dolů schová.
- Menší náhledy z YouTube mají v sobě černé pruhy – web je automaticky ořízne.

Logo SARAH je překreslené jako SVG (sdílený symbol `#sarah-logo` na začátku každé stránky).
Úvodní stránka obsahuje strukturovaná data pro vyhledávače (kapela, členové, album).

## Výkon

Žádné knihovny. Animuje se jen transform/opacity/clip-path, smyčky běží jen pro viditelné
prvky. YouTube se načítá až po kliknutí na video (kromě tichého videa v úvodu, které se na mobilu
a při šetření dat nenačítá), Facebook až po kliknutí, obrázky líně. Efekty u kurzoru jen s myší;
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
