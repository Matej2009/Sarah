# Tuning Sport Praha — nový web

Jednostránkový web ve stejném formátu a vzhledu jako pepegarage.cz: stejná kostra
(menu s telefonem → úvod → výstražný pruh → O nás → Služby → Ceník → Kontakt s mapou → patička),
stejné barvy (ocelová modrá, žlutá, červená), písmo Archivo, žádné knihovny ani build krok.

Stačí nahrát obsah této složky na hosting nebo do vlastního repozitáře na GitHub Pages.

## Fotky

Web vypadá hotově i bez fotek: místo nich jsou navržené panely (otáčkoměr v úvodu,
nápis SERVIS / STK / EMISE / LAK, dlaždice s ikonami). Jakmile do `images/` nahrajete
soubor s níže uvedeným názvem, ukáže se místo panelu skutečná fotka:

| Soubor            | Kde                                   | Formát             |
|-------------------|---------------------------------------|--------------------|
| `hero.jpg`        | pozadí úvodu (otáčkoměr zmizí)        | na šířku, 1920 px  |
| `dilna.jpg`       | sekce O nás                           | na výšku 4:5       |
| `emise.jpg`       | pás fotek u služeb, 1.                | na výšku 3:4       |
| `lesteni.jpg`     | pás fotek u služeb, 2.                | na výšku 3:4       |
| `diagnostika.jpg` | pás fotek u služeb, 3.                | na výšku 3:4       |
| `vjezd.jpg`       | pod mapou (bez fotky se neukazuje)    | na šířku 16:9      |

JPG do ~300 kB.

## K ověření s majitelem

Údaje jsou z veřejných zdrojů (stávající web, katalogy firem):

- **Otevírací doba** – známe jen měření emisí (denně 7–16 h). Ostatní služby jsou
  „po telefonické domluvě“, dokud nedodá přesnou dobu.
- **Reference** – Pe&Pe Garage má sekci s recenzemi zákazníků; tady je na jejím místě ceník.
  Až budou skutečné recenze (Google, Firmy.cz), dají se doplnit ve stejném stylu.
- **Logo** – zatím textové s ikonou otáčkoměru; originál se vloží do `.nav-brand`.
- **IČO** – nenašli jsme, v kontaktech chybí.
