# SARAH — web kapely (sarahcb.cz)

Web hardrockové kapely Sarah z Českých Budějovic. Čisté HTML, CSS a JS bez knihoven,
hostuje se na GitHub Pages z větve `main` (doména v souboru `CNAME`).

Vzhled: tvrdý rock, ale čistý. Téměř černé pozadí, jedna krvavě červená barva, velké fotky
kapely (úvodní fotka přechází do černé, jména členů jsou přímo na portrétech), ostré rohy
a jemné zrno jako na fotce z koncertu. Historie původní Sarah je jen na stránce Historie
v horním menu. Nadpisy písmem Barlow Condensed, text písmem Inter; obě písma jsou
přímo na webu (`assets/fonts/`), takže web neposílá data návštěvníků Googlu. Web
nepoužívá cookies ani měření návštěvnosti.

```
index.html          Úvod: fotka kapely, další koncert, nová Sarah, sestava, odkaz na historii, booking
koncerty.html       Nadcházející a odehrané koncerty dnešní sestavy
kapela.html         Dnešní kapela a sestava
historie.html       Původní Sarah 1992–2023: příběh, rok po roku, album Sarah (2012) s recenzí,
                    videa původní sestavy, její písně a koncerty, odkazy
kontakt.html        Booking (778 885 465), odkazy, co nabízíme, ke stažení pro pořadatele a média
petr-hajek.html …   Stránky členů (kytara, bicí, zpěv, baskytara)
404.html            Chybová stránka (staré adresy hudba.html, media.html a videa.html vedou na Historii)
assets/css/site.css Vzhled
assets/js/site.js   Menu na mobilu, koncerty, videa (Historie), kopírování textu, chat
assets/js/data.js   Data pro prohlížeč (vyrábí ho tools/build.py, neupravovat ručně)
assets/img/         Logo, fotky kapely, portréty členů
assets/press/       Logo ke stažení (PNG)
assets/fonts/       Písma
tools/build.py      VEŠKERÝ obsah webu a šablony stránek
chat-worker/        Volitelný server, díky kterému chat odpovídá pomocí Claude (návod uvnitř)
```

## Jak upravit obsah

Všechny texty, koncerty, videa a údaje o členech jsou nahoře v `tools/build.py`.
Po úpravě spusťte

```
python3 tools/build.py
```

a nahrajte (commitněte) změněné soubory. Skript nepotřebuje nic instalovat.

- **Koncerty** – `GIGS` (jen dnešní sestava). Budoucí termín se ukáže v „Nadcházející“ a na
  úvodní stránce jako „Další koncert“; po datu se sám přesune do „Odehráno“. Chat ho zná taky.
  U koncertu s přesným datem se do stránky přidají i údaje pro Google (MusicEvent).
- **Historie (původní Sarah)** – `HISTORY_STORY`, `TIMELINE`, `ALBUM`, `QUOTE` (recenze Deníku),
  `HISTORY_SONGS`, `HISTORY_VIDEOS` (id z YouTube za `watch?v=`), `HISTORY_GIGS`, `HISTORY_LINKS`.
  Všechno se ukáže na `historie.html`, na úvodní stránce je jen krátký odkaz.
- **Členové** – `MEMBERS`: jméno, nástroj, krátký popis, životopis, fakta. U Petra Hájka
  zatím chybí víc informací – stačí doplnit pár vět do `bio`.
  Portréty jsou v `assets/img/members/` (420 × 560 px, výřezy z úvodní fotky).
- **Telefon na booking** – `PHONE` (778 885 465) a `TEL`.
- **Texty o dnešní kapele** – `STORY`, `FACTS`, `OFFER`, `PRESS_BIO`.
- **Odkazy** – `LINKS` (Facebook, GoOut); odkazy k historii jsou v `HISTORY_LINKS`.
- **Ke stažení pro pořadatele** – `PRESS_FILES`.

## Chat

Tlačítko „Máte dotaz?“ vpravo dole otevře asistenta kapely. Odpovídá na jednoduché dotazy
(kdy hrajete, jak vás pozvat, kdo je v kapele, kde si vás poslechnout, album, historie,
logo a fotky) z údajů kapely – nic si nevymýšlí, a co neví, odkáže na telefon
778 885 465. Rozhovor vydrží při přechodu mezi stránkami. Aby odpovídala umělá inteligence
(Claude), stačí nasadit server ze složky `chat-worker/` (návod v `chat-worker/README.md`).

## Ověřit s kapelou

Obsah je z veřejných zdrojů (Bandzone, Hardmusicbase, Českobudějovický deník, Musicgate,
YouTube). Zkontrolujte hlavně:

- bia členů (Franc: Seven 1996–2006; Troup: Kambodža 2022–2024) a doplňte info
  o Petru Hájkovi a Josefu Jakešovi
- složení kapely na albu Sarah 2012 (Troup, Przeczek, Jakeš, Holčapek)
- jestli dnešní sestava hraje některé písně původní Sarah (Historie) a které covery

## Doména

DNS u GoDaddy: 4× A záznam `@` → 185.199.108.153 / .109.153 / .110.153 / .111.153,
CNAME `www` → matej2009.github.io. Na GitHubu v Settings → Pages musí být zapnuté
publikování z větve `main` (složka `/`) a „Enforce HTTPS“.
