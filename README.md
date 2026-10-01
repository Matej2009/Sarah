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
assets/         favicon, assets/photos/ pro vlastní fotky
```

## Jak upravit obsah

Data jsou nahoře ve `script.js`:

- **Koncerty** – pole `GIGS`. Budoucí termín se sám ukáže nahoře i na úvodní stránce
  (s odpočtem), po datu se přesune do „Odehráno“.
- **Videa** – pole `VIDEOS` (id z YouTube adresy za `watch?v=`).
- **Fotky** – nahrajte do `assets/photos/` a přidejte do pole `PHOTOS`. Ideálně JPG
  šířky 1600 px, do 300 kB. Galerie zatím ukazuje záběry z videí kapely.
- **Fotky členů** – v `kapela.html` vložte `<img src="assets/photos/jmeno.jpg" alt="">`
  do příslušného `.member__pic`.
- **Booking e-mail/telefon** – v `kontakt.html` je připravené místo (`TODO`).

Hlavička a patička jsou v každé stránce stejné – při změně menu upravte všechny.

## Interaktivní prvky

- **Zesilovač (úvod)** – knoflík hlasitosti 0–11 (táhnout, kolečko myši, šipky). Na 11 se stránka otřese a vyšlehnou plameny.
- **Zahraj riff** – kytarový riff syntetizovaný přímo v prohlížeči (Web Audio, žádné soubory), hlasitost podle knoflíku.
- **Deska** – kliknutím na píseň se roztočí, dá se chytit a „scratchovat“.
- **Karty členů** – kliknutím se otočí a ukážou bio.
- **Historie** – posuvná časová osa (táhnout / šipky).
- **Zapalovače** – v sekci Booking, počet se pamatuje v prohlížeči.
- **Easter egg** – na klávesnici napište „sarah“.
- Logo SARAH je překreslené jako SVG (sdílený symbol `#sarah-logo` na začátku každé stránky).

## Výkon

Žádné knihovny ani canvas, animace jen přes CSS (opacity/transform), zvuk až po kliknutí. Na slabých
zařízeních, při úsporném režimu dat nebo při „omezit pohyb“ se animace a dekorace
vypnou. YouTube se načítá až po kliknutí na video, obrázky líně.

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
