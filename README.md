# SARAH — web kapely (sarahcb.cz)

Statický web hardrockové kapely Sarah z Českých Budějovic. Čisté HTML, CSS a JS,
bez build kroku. Stačí otevřít `index.html` v prohlížeči.

```
index.html        obsah stránky (texty, sestava, písně, videa, booking)
styles.css        vzhled
script.js         koncerty (seznam GIGS nahoře v souboru), menu, animace, videa
assets/           favicon
CNAME             vlastní doména pro GitHub Pages (sarahcb.cz)
```

## Jak upravit obsah

- **Koncerty:** v `script.js` doplňte položku do pole `GIGS`. Budoucí termíny se
  samy zobrazí nahoře, odehrané se po datu přesunou do „Odehráno“.
- **Texty, sestava, písně:** přímo v `index.html` (sekce `#kapela`, `#sestava`, `#pisne`).
- **Fotky:** nahrajte je do `assets/photos/` a přidejte do pole `GALLERY` ve `script.js`, galerie se pak sama zobrazí. Fotku členů vložte do jejich karty v `index.html` (návod je v komentáři u sekce `#sestava`), úvodní fotku změníte u `hero__photo`.
- **Videa:** v sekci `#videa` změňte `data-yt` a URL obrázku na ID videa z YouTube.
- **Booking kontakt:** v sekci `#booking` je připravené místo (`TODO`) pro e-mail a telefon.

## Před spuštěním ověřit s kapelou

Obsah jsem sestavil z veřejných zdrojů (Bandzone, Facebook, Českobudějovický deník,
YouTube, GoOut). Zkontrolujte prosím:

- aktuální sestavu (Zdeněk Troup, Martin Przeczek, Josef Jakeš, Slávek Franc)
- rok založení (zdroje uvádějí 1992 i přelom 1992/1993)
- výběr písní v setlistu
- koncerty: Jílovice 26. 9. 2026 (s Blamage) a Seven Fest Ševětín 2023
- booking e-mail / telefon (zatím odkaz jen na Facebook)
- fotky kapely, které zatím nejsou k dispozici (sestava používá iniciály)

## Zveřejnění na sarahcb.cz (GitHub Pages)

1. Sloučit tuto větev do `main`.
2. Na GitHubu: **Settings → Pages → Build and deployment → Deploy from a branch**,
   vybrat `main` a složku `/ (root)`. Vlastní doména `sarahcb.cz` se načte ze souboru `CNAME`.
   (U soukromého repozitáře vyžaduje GitHub Pages placený tarif. Jinak repozitář
   zveřejněte, nebo použijte Netlify či Cloudflare Pages.)
3. U registrátora domény nastavit DNS:

   | Typ   | Název | Hodnota              |
   |-------|-------|----------------------|
   | A     | @     | 185.199.108.153      |
   | A     | @     | 185.199.109.153      |
   | A     | @     | 185.199.110.153      |
   | A     | @     | 185.199.111.153      |
   | CNAME | www   | matej2009.github.io. |

   Případné staré A/CNAME záznamy pro `@` a `www` (parkovací stránka registrátora) smažte.
4. Po propagaci DNS (minuty až hodiny) zapnout v **Settings → Pages** volbu **Enforce HTTPS**.
