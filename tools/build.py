#!/usr/bin/env python3
"""Builds the SARAH website (sarahcb.cz).

    python3 tools/build.py

All content is in the first part of this file. The script writes every page, sitemap.xml and
assets/js/data.js (the data the chat and the concert list need in the browser). No dependencies.
"""
import datetime
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://sarahcb.cz"
TODAY = datetime.date.today()

# ============================================================================================
# Content
# ============================================================================================

PHONE = "778 885 465"
TEL = "tel:+420778885465"
FACEBOOK = "https://www.facebook.com/SARAH-%C4%8Deske-bud%C4%9Bjovice-104011628504"
FACEBOOK_ORIGINAL = "https://www.facebook.com/p/SARAH-%C4%8CB-p%C5%AFvodn%C3%AD-sestava-1992-61551588285638/"
BANDZONE = "https://bandzone.cz/sarah"
GOOUT = "https://goout.net/en/sarah/pzodprf/"
REVIEW = "https://ceskobudejovicky.denik.cz/volny-cas/recenze-nova-deska-rockovych-sarah-u-publika-zaboduje-20120611.html"

TAGLINE = "Hard rock z Českých Budějovic"
DESCRIPTION = ("Sarah je hardrocková kapela z Českých Budějovic, na pódiích od roku 1992. "
               "Vlastní písně, album Sarah, koncerty a booking na telefonu 778 885 465.")

MEMBERS = [
    {"key": "hajek", "page": "petr-hajek.html", "name": "Petr Hájek", "role": "Kytara", "instrument": "kytara",
     "does": "hraje na kytaru", "short": "Kytarista Sarah.",
     "bio": ["Petr Hájek hraje v Sarah na kytaru."], "facts": [],
     "words": ["petr", "hajek", "kytar", "kytaris", "guitar"]},
    {"key": "franc", "page": "slavek-franc.html", "name": "Slávek Franc", "role": "Bicí", "instrument": "bicí",
     "does": "hraje na bicí", "short": "Bubeník s kořeny v budějovickém metalu.",
     "bio": ["Za bicími drží celou kapelu pohromadě. V letech 1996–2006 hrál v zakládající sestavě budějovické "
             "progresivně metalové kapely Seven, která dnes pořádá Seven Fest v Ševětíně."],
     "facts": [("Seven", "1996–2006")],
     "words": ["slavek", "franc", "bici", "bubn", "bubenik", "drum"]},
    {"key": "troup", "page": "zdenek-troup.html", "name": "Zdeněk Troup", "role": "Zpěv", "instrument": "zpěv",
     "does": "zpívá a kapelu v roce 1992 založil", "short": "Zakladatel kapely a její hlas od roku 1992.",
     "bio": ["Sarah dal dohromady na přelomu let 1992 a 1993 a zpíval v ní do roku 2014. K třicetinám kapely "
             "ji v roce 2023 znovu postavil na pódium.",
             "V letech 2022–2024 zpíval i v budějovické kapele Kambodža."],
     "facts": [("Sarah", "od 1992"), ("Kambodža", "2022–2024")],
     "words": ["zdenek", "troup", "zpev", "zpevak", "zpiva", "spiva", "vokal", "sing"]},
    {"key": "jakes", "page": "josef-jakes.html", "name": "Josef Jakeš", "role": "Baskytara", "instrument": "baskytara",
     "does": "hraje na baskytaru", "short": "Basová páteř kapely, hrál i na albu Sarah.",
     "bio": ["Spolu s bicími drží rytmus, na kterém stojí riffy i Troupův zpěv. Hrál na albu Sarah z roku 2012."],
     "facts": [("Album Sarah", "2012")],
     "words": ["josef", "jakes", "bask", "basa", "basak", "basist", "bass"]},
]

STORY = [
    "Kapelu Sarah založil zpěvák Zdeněk Troup na přelomu let 1992 a 1993 v Českých Budějovicích. "
    "Hrajeme hlavně vlastní písně, přímočaré, melodické a nahlas, a k nim covery kapel, na kterých jsme "
    "vyrostli: AC/DC, Metallica, Accept a Scorpions.",
    "V roce 2012 jsme vydali album Sarah, v roce 2014 jsme si dali pauzu a v roce 2023 se vrátili na pódia. "
    "Fanoušky máme po celých jižních Čechách i na Moravě, a na konci koncertu umíme zahrát Mrazíka, "
    "klidně i v kostýmech.",
]
TIMELINE = [
    ("1992", "Začátek", "Zdeněk Troup zakládá v Budějovicích kapelu Sarah."),
    ("90. léta", "Kluby a vlastní písně", "Koncerty po celém jihu Čech a první věrní fanoušci."),
    ("2012", "Album Sarah", "Jedenáct vlastních písní. Deník desce předpověděl úspěch u publika."),
    ("2014", "Pauza", "Zakladatel Zdeněk Troup odchází a Sarah na čas utichá."),
    ("2023", "Návrat", "V dubnu Seven Fest v Ševětíně, v září Jílovice."),
    ("Dnes", "Zpátky na pódiích", "Hrajeme naživo, od letních parketů po kluby."),
]
FACTS = [("1992", "založení kapely"), ("11", "písní na albu Sarah"), ("30+", "let na pódiích")]

ALBUM = {
    "title": "Sarah", "year": 2012,
    "intro": "Jedenáct vlastních písní, které jsme v roce 2012 natočili v sestavě Zdeněk Troup, Martin Przeczek, "
             "Josef Jakeš a Rosťa Holčapek. Českobudějovický deník desku přirovnal k Iron Maiden, Accept "
             "i Pražskému výběru.",
    "tracks": ["Srdce-lhář", "Nechápu", "Jinej svět", "Na křídlech černých vran", "V prázdným těle", "Tisíce lží",
               "Kudy a kam", "Sobě sám", "Smíření", "Kdo z nás to ví", "Pohřebiště citů"],
}
QUOTE = ("Nová deska rockových Sarah u publika zaboduje.", "Českobudějovický deník", "recenze alba Sarah, červen 2012")
LIVE_SONGS = ["Křídla", "Vlaky", "Se mnou nepočítej", "Střílej", "Noc vládne nám", "Sarah", "Notorik", "Bezdomáč",
              "Krásnej den", "Milionkrát", "Ta žízeň", "Ještě nespi", "Modrá erekce impotenta", "Mrazík"]
COVERS = ["AC/DC", "Metallica", "Accept", "Scorpions"]

# Concerts. date: "YYYY-MM-DD" (or "YYYY-MM" / "YYYY" when the day isn't known),
# time: optional "20:00", link: optional tickets / event page.
GIGS = [
    {"date": "2026-09-26", "venue": "Letní parket Jílovice", "city": "Jílovice u Českých Budějovic", "note": "s kapelou Blamage"},
    {"date": "2023-09-16", "venue": "Jílovice", "city": "Jílovice u Českých Budějovic", "note": "původní sestava, 30 let kapely"},
    {"date": "2023-04", "venue": "Seven Fest", "city": "KD Ševětín", "note": "oslava 30. narozenin kapely"},
]

OFFER = [
    ("Vlastní písně i známé covery", "Hard rock z vlastní tvorby a k tomu AC/DC, Metallica, Accept a Scorpions."),
    ("Program podle akce", "Od klubového setu po celovečerní koncert, venku i v sále."),
    ("Ověřeno na pódiích", "Festivaly, letní parkety i kluby po celých jižních Čechách."),
    ("Přes třicet let zkušeností", "Domluvíme se rychle a přijedeme připravení."),
]
EVENTS = ["Kluby", "Festivaly", "Letní parkety", "Firemní akce", "Narozeniny a oslavy", "Plesy a zábavy"]

LINKS = [
    ("fb", FACEBOOK, "Facebook", "Novinky a zprávy pro kapelu"),
    ("fb", FACEBOOK_ORIGINAL, "Facebook původní sestavy", "Návrat na pódia po 30 letech"),
    ("note", BANDZONE, "Bandzone", "Písně a texty"),
    ("ticket", GOOUT, "GoOut", "Vstupenky a akce"),
]

PRESS_BIO = ("Sarah je hardrocková kapela z Českých Budějovic. Založil ji zpěvák Zdeněk Troup na přelomu let "
             "1992 a 1993. Hraje hlavně vlastní písně a k nim covery AC/DC, Metallicy, Accept a Scorpions. "
             "V roce 2012 vydala album Sarah, v roce 2023 se po pauze vrátila na pódia. Sestava: Petr Hájek "
             "(kytara), Slávek Franc (bicí), Zdeněk Troup (zpěv), Josef Jakeš (baskytara). Booking: 778 885 465.")
PRESS_FILES = [
    ("assets/press/sarah-logo.png", "Logo s ženou", "PNG 2000 px, průhledné pozadí, na tmavý podklad"),
    ("assets/img/logo.svg", "Logo, nápis", "SVG, vektor pro tisk"),
    ("assets/img/banner.jpg", "Fotka kapely na červeném pozadí", "JPG, 1600 × 592 px"),
    ("assets/img/kapela.jpg", "Fotka kapely ve zkušebně", "JPG, 1440 × 600 px"),
]

PAGES = [  # main menu
    ("koncerty.html", "Koncerty"),
    ("hudba.html", "Hudba"),
    ("kapela.html", "Kapela"),
    ("kontakt.html", "Kontakt"),
]

# ============================================================================================
# Helpers
# ============================================================================================

e = html.escape
VERSION = "2"
MONTHS = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"]
MONTHS_OF = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"]
MON = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"]

ICONS = {
    "fb": '<path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21z"/>',
    "note": '<path d="M11 3h9v4.5h-6V17a4 4 0 1 1-3-3.87z"/>',
    "ticket": '<path d="M2 6.5h20V10a2 2 0 0 0 0 4v3.5H2V14a2 2 0 0 0 0-4zm13 1.5v1.6h1.6V8zm0 3.2v1.6h1.6v-1.6zm0 3.2V16h1.6v-1.6z"/>',
    "phone": '<path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/>',
    "chat": '<path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 6.5a1.5 1.5 0 1 0 0 .01zm5 0a1.5 1.5 0 1 0 0 .01zm5 0a1.5 1.5 0 1 0 0 .01z"/>',
    "play": '<path d="M8 5.5v13l11-6.5z"/>',
    "arrow": '<path d="M13.2 5.3 19.9 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.1l-4.3-4.3z"/>',
    "cal": '<path d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm12 8H5v9h14zM5 6v2h14V6z"/>',
    "down": '<path d="M11 3h2v11.2l4.3-4.3 1.4 1.4L12 18l-6.7-6.7 1.4-1.4 4.3 4.3zM4 19h16v2H4z"/>',
    "send": '<path d="M3 11.5 21 3l-8.5 18-2-7.5z"/>',
    "close": '<path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/>',
    "copy": '<path d="M8 3h11a2 2 0 0 1 2 2v11h-2V5H8zM5 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm0 2v10h10V9z"/>',
}
SPRITE = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'
          + "".join(f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k, v in ICONS.items())
          + "</defs></svg>")


def icon(name):
    return f'<svg aria-hidden="true"><use href="#i-{name}"/></svg>'


def ext(url, inner, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f'<a{c} href="{e(url)}" target="_blank" rel="noopener">{inner}</a>'


LOGO_WORD = '<svg viewBox="39 122 566 115" aria-hidden="true"><use href="assets/img/logo.svg#word"/></svg>'
LOGO_FULL = ('<svg viewBox="39 28 566 273" aria-hidden="true"><use href="assets/img/logo.svg#word"/>'
             '<image href="assets/img/logo-woman.webp" x="233" y="30" width="358" height="165"/>'
             '<use href="assets/img/logo.svg#script"/></svg>')


def parse_date(g):
    parts = [int(p) for p in g["date"].split("-")]
    y, m, d = (parts + [None, None])[:3]
    if d:
        end = datetime.date(y, m, d)
    elif m:
        end = datetime.date(y + (m == 12), m % 12 + 1, 1) - datetime.timedelta(days=1)
    else:
        end = datetime.date(y, 12, 31)
    return y, m, d, end


def gig_when(g):
    y, m, d, _ = parse_date(g)
    return f"{d}. {MONTHS_OF[m - 1]} {y}" if d else f"{MONTHS[m - 1]} {y}" if m else str(y)


def split_gigs():
    rows = sorted(GIGS, key=lambda g: parse_date(g)[3])
    upcoming = [g for g in rows if parse_date(g)[3] >= TODAY]
    past = [g for g in reversed(rows) if parse_date(g)[3] < TODAY]
    return upcoming, past


def gig_row(g):
    y, m, d, end = parse_date(g)
    day = str(d) if d else (MON[m - 1] if m else str(y))
    sub = f"{MON[m - 1]} {y}" if d else (str(y) if m else "")
    where = " · ".join(e(x) for x in (g.get("city"), g.get("note")) if x)
    link = ext(g["link"], "Vstupenky" + icon("arrow"), "gig__link") if g.get("link") else ""
    return (f'          <li class="gig" data-end="{end.isoformat()}">'
            f'<span class="gig__date"><b>{day}</b><span>{sub}</span></span>'
            f'<span class="gig__info"><b>{e(g["venue"])}</b><span>{where}</span></span>{link}</li>')


# ============================================================================================
# Page frame
# ============================================================================================

def head(title, description, path, image="assets/img/banner.jpg", extra="", base=False):
    url = f"{SITE}/{path}"
    base_tag = '  <base href="/">\n' if base else ""
    return f"""<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
{base_tag}  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{e(title)}</title>
  <meta name="description" content="{e(description)}">
  <meta name="theme-color" content="#ffffff">
  <link rel="canonical" href="{url}">
  <link rel="icon" href="assets/img/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SARAH">
  <meta property="og:locale" content="cs_CZ">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(description)}">
  <meta property="og:image" content="{SITE}/{image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preload" href="assets/fonts/inter-400-700-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/barlow-condensed-700-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/site.css?v={VERSION}">
{extra}</head>
<body>
  {SPRITE}
  <a class="skip" href="#main">Přeskočit na obsah</a>
"""


def header(current=None):
    here = ' aria-current="page"'
    links = "\n".join(f'        <a href="{href}"{here if href == current else ""}>{label}</a>' for href, label in PAGES)
    return f"""  <header class="header" data-header>
    <div class="container header__inner">
      <a class="header__logo" href="index.html" aria-label="Sarah, úvodní stránka">{LOGO_WORD}</a>
      <nav class="header__nav" id="menu" aria-label="Hlavní navigace">
{links}
        <a class="header__call" href="{TEL}">{icon("phone")}{PHONE}</a>
      </nav>
      <a class="btn btn--accent btn--sm header__cta" href="kontakt.html">Booking</a>
      <button class="header__toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Otevřít menu"><span></span><span></span><span></span></button>
    </div>
  </header>
"""


def footer():
    nav = "\n".join(f'          <li><a href="{h}">{t}</a></li>' for h, t in PAGES)
    social = "\n".join(f'          <li>{ext(u, icon(i) + e(t))}</li>' for i, u, t, _ in LINKS)
    return f"""  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a class="footer__logo" href="index.html" aria-label="Sarah, úvodní stránka">{LOGO_FULL}</a>
        <p>Hardrocková kapela z Českých Budějovic. Na pódiích od roku 1992.</p>
      </div>
      <div>
        <h2 class="footer__title">Web</h2>
        <ul class="footer__list">
{nav}
        </ul>
      </div>
      <div>
        <h2 class="footer__title">Sledujte nás</h2>
        <ul class="footer__list footer__list--icons">
{social}
        </ul>
      </div>
      <div>
        <h2 class="footer__title">Booking</h2>
        <a class="footer__phone" href="{TEL}">{PHONE}</a>
        <p class="footer__note">Zavolejte nebo pošlete SMS. Domluvíme termín, program i cenu.</p>
      </div>
    </div>
    <div class="container footer__bottom">
      <span>© <span data-year>{TODAY.year}</span> Sarah, České Budějovice</span>
      <a href="kontakt.html#pro-poradatele">Pro pořadatele a média</a>
    </div>
  </footer>
"""


CHAT = f"""  <div class="chat" data-chat>
    <button class="chat__open" type="button" aria-expanded="false" aria-controls="chat-panel">{icon("chat")}<span>Máte dotaz?</span></button>
    <section class="chat__panel" id="chat-panel" aria-label="Asistent kapely Sarah" hidden>
      <header class="chat__head">
        <span class="chat__avatar" aria-hidden="true">S</span>
        <p><b>Asistent kapely Sarah</b><small>Odpovím na jednoduché dotazy</small></p>
        <button class="chat__close" type="button" aria-label="Zavřít">{icon("close")}</button>
      </header>
      <div class="chat__log" aria-live="polite"></div>
      <div class="chat__chips"></div>
      <form class="chat__form">
        <input name="q" type="text" autocomplete="off" maxlength="300" placeholder="Napište dotaz…" aria-label="Váš dotaz">
        <button type="submit" aria-label="Odeslat">{icon("send")}</button>
      </form>
    </section>
  </div>
"""


def page(title, description, path, body, current=None, image="assets/img/banner.jpg", extra="", base=False):
    return (head(title, description, path, image=image, extra=extra, base=base) + header(current)
            + f'\n  <main id="main">\n{body}  </main>\n\n' + footer() + CHAT
            + f'  <script src="assets/js/data.js?v={VERSION}" defer></script>\n'
            + f'  <script src="assets/js/site.js?v={VERSION}" defer></script>\n</body>\n</html>\n')


def page_head(label, title, lead):
    return f"""    <section class="pagehead">
      <div class="container">
        <p class="label">{label}</p>
        <h1 class="display">{title}</h1>
        <p class="lead">{lead}</p>
      </div>
    </section>
"""


# ============================================================================================
# Building blocks
# ============================================================================================

def member_card(m, heading="h3"):
    return f"""          <a class="member" href="{m['page']}">
            <span class="member__photo"><img src="assets/img/members/{m['key']}.jpg" alt="{e(m['name'])}" width="420" height="560" loading="lazy" decoding="async"></span>
            <{heading} class="member__name">{e(m['name'])}</{heading}>
            <span class="member__role">{e(m['role'])}</span>
          </a>"""


def members_grid(exclude=None):
    cards = "\n".join(member_card(m) for m in MEMBERS if m is not exclude)
    cls = "members members--3" if exclude else "members"
    return f'        <div class="{cls}">\n{cards}\n        </div>\n'


def album_block(full):
    tracks = ALBUM["tracks"] if full else ALBUM["tracks"][:6]
    items = "".join(f"<li>{e(t)}</li>" for t in tracks)
    more = "" if full else f'<p class="album__more">a dalších {len(ALBUM["tracks"]) - len(tracks)} písní</p>'
    second = "" if full else '<a class="btn btn--ghost" href="hudba.html">Celé album</a>'
    return f"""        <div class="album">
          <div class="album__art" aria-hidden="true">
            {LOGO_FULL}
            <span>{ALBUM['year']} · {len(ALBUM['tracks'])} písní</span>
          </div>
          <div class="album__text">
            <p class="label">Album</p>
            <h2 class="h2">{e(ALBUM['title'])} <span class="muted">{ALBUM['year']}</span></h2>
            <p>{e(ALBUM['intro'])}</p>
            <ol class="tracks">{items}</ol>
            {more}
            <div class="btns">
              {ext(BANDZONE, icon("play") + "Poslechnout na Bandzone", "btn btn--accent")}
              {second}
            </div>
          </div>
        </div>
"""


def quote_block():
    return f"""        <figure class="quote">
          <blockquote><p>„{e(QUOTE[0])}“</p></blockquote>
          <figcaption>{ext(REVIEW, e(QUOTE[1]))}, {e(QUOTE[2])}</figcaption>
        </figure>
"""


def booking_band():
    return f"""    <section class="band">
      <div class="container band__inner">
        <div>
          <p class="label label--light">Booking</p>
          <h2 class="h2">Hledáte kapelu na svou akci?</h2>
          <p>Kluby, festivaly, letní parkety, firemní večírky i narozeniny. Zavolejte, domluvíme termín, program i cenu.</p>
        </div>
        <div class="band__actions">
          <a class="btn btn--light btn--lg" href="{TEL}">{icon("phone")}{PHONE}</a>
          <a class="btn btn--outline btn--lg" href="kontakt.html">Více o bookingu</a>
        </div>
      </div>
    </section>
"""


def gigs_block():
    upcoming, past = split_gigs()
    up_rows = "\n".join(gig_row(g) for g in upcoming)
    past_rows = "\n".join(gig_row(g) for g in past)
    fb = ext(FACEBOOK, "Facebooku")
    return f"""        <div class="gigs" data-gigs>
          <h2 class="h3">Nadcházející</h2>
          <ul class="gigs__list" data-upcoming>
{up_rows}
          </ul>
          <div class="empty" data-empty{"" if not upcoming else " hidden"}>
            <p><b>Nové termíny právě domlouváme.</b> Jakmile budou, najdete je tady a na {fb}.</p>
            <a class="btn btn--dark btn--sm" href="kontakt.html">Pozvěte nás k vám</a>
          </div>
          <h2 class="h3 gigs__past-title">Odehráno</h2>
          <ul class="gigs__list gigs__list--past" data-past>
{past_rows}
          </ul>
        </div>
"""


# ============================================================================================
# Pages
# ============================================================================================

def home():
    upcoming, _ = split_gigs()
    if upcoming:
        g = upcoming[0]
        next_gig = f'<b>{gig_when(g)}</b><span>{e(g["venue"])}</span>'
        next_end = f' data-end="{parse_date(g)[3].isoformat()}"'
    else:
        next_gig, next_end = "<b>Termíny domlouváme</b><span>Sledujte nás na Facebooku</span>", ""
    facts = "".join(f"<li><b>{n}</b><span>{e(t)}</span></li>" for n, t in FACTS)
    ld = {
        "@context": "https://schema.org", "@type": "MusicGroup", "name": "Sarah", "url": f"{SITE}/",
        "genre": "Hard rock", "foundingDate": "1992", "telephone": "+420778885465",
        "image": f"{SITE}/assets/img/banner.jpg", "logo": f"{SITE}/assets/press/sarah-logo.png",
        "foundingLocation": {"@type": "Place", "name": "České Budějovice"}, "description": DESCRIPTION,
        "member": [{"@type": "OrganizationRole", "roleName": m["role"],
                    "member": {"@type": "Person", "name": m["name"], "url": f"{SITE}/{m['page']}"}} for m in MEMBERS],
        "album": {"@type": "MusicAlbum", "name": ALBUM["title"], "datePublished": str(ALBUM["year"]),
                  "numTracks": len(ALBUM["tracks"]), "track": [{"@type": "MusicRecording", "name": t} for t in ALBUM["tracks"]]},
        "sameAs": [FACEBOOK, FACEBOOK_ORIGINAL, BANDZONE, GOOUT],
    }
    extra = (f'  <link rel="preload" as="image" href="assets/img/banner.jpg" fetchpriority="high">\n'
             f'  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n')
    alt = "Kapela Sarah: zleva Petr Hájek, Slávek Franc, Zdeněk Troup a Josef Jakeš, nad nimi logo Sarah Hard rock"
    album_quick = (f'<span class="quick__icon">{icon("note")}</span><span class="quick__text"><small>Album</small>'
                   f'<span><b>Sarah (2012)</b><span>11 vlastních písní na Bandzone</span></span></span>'
                   f'<span class="quick__go">{icon("arrow")}</span>')
    body = f"""    <section class="hero">
      <div class="hero__photo"><img src="assets/img/banner.jpg" alt="{e(alt)}" width="1600" height="592" fetchpriority="high"></div>
      <div class="container hero__text">
        <p class="label">České Budějovice · od roku 1992</p>
        <h1 class="display">{TAGLINE}</h1>
        <div class="hero__row">
          <p class="lead">Vlastní písně, přímočaré a nahlas, a k nim AC/DC, Metallica, Accept a Scorpions. Zahrajeme v klubu, na festivalu i na vaší akci.</p>
          <div class="btns">
            <a class="btn btn--accent" href="kontakt.html">Pozvěte nás na akci</a>
            <a class="btn btn--ghost" href="koncerty.html">Koncerty</a>
          </div>
        </div>
      </div>
    </section>

    <section class="container quick" aria-label="Ve zkratce">
      <a class="quick__item" href="koncerty.html"{next_end} data-next>
        <span class="quick__icon">{icon("cal")}</span>
        <span class="quick__text"><small>Další koncert</small><span>{next_gig}</span></span>
        <span class="quick__go">{icon("arrow")}</span>
      </a>
      {ext(BANDZONE, album_quick, "quick__item")}
      <a class="quick__item quick__item--accent" href="{TEL}">
        <span class="quick__icon">{icon("phone")}</span>
        <span class="quick__text"><small>Booking</small><span><b>{PHONE}</b><span>Volejte nebo pište SMS</span></span></span>
        <span class="quick__go">{icon("arrow")}</span>
      </a>
    </section>

    <section class="section">
      <div class="container split">
        <figure class="split__photo"><img src="assets/img/kapela.jpg" alt="Kapela Sarah ve zkušebně" width="1440" height="600" loading="lazy" decoding="async"></figure>
        <div class="split__text">
          <p class="label">O kapele</p>
          <h2 class="h2">Přes třicet let na pódiích</h2>
          <p>{e(STORY[0])}</p>
          <ul class="facts">{facts}</ul>
          <a class="link" href="kapela.html">Celý příběh kapely{icon("arrow")}</a>
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container">
        <div class="section__head">
          <div><p class="label">Sestava</p><h2 class="h2">Kdo hraje v Sarah</h2></div>
          <a class="link" href="kapela.html#sestava">Víc o kapele{icon("arrow")}</a>
        </div>
{members_grid()}      </div>
    </section>

    <section class="section">
      <div class="container">
{album_block(full=False)}
{quote_block()}      </div>
    </section>

{booking_band()}"""
    return page("SARAH — hard rock z Českých Budějovic", DESCRIPTION, "", body, extra=extra)


def concerts():
    upcoming, _ = split_gigs()
    events = [{"@context": "https://schema.org", "@type": "MusicEvent", "name": f"Sarah – {g['venue']}",
               "startDate": g["date"] + (f"T{g['time']}" if g.get("time") else ""),
               "location": {"@type": "Place", "name": g["venue"], "address": g.get("city", "")},
               "performer": {"@type": "MusicGroup", "name": "Sarah", "url": f"{SITE}/"}}
              for g in upcoming if parse_date(g)[2]]
    extra = "".join(f'  <script type="application/ld+json">{json.dumps(ev, ensure_ascii=False)}</script>\n' for ev in events)
    body = (page_head("Koncerty", "Kde hrajeme", "Hrajeme po jižních Čechách: v klubech, na festivalech i letních parketech. Nové termíny přidáváme sem a na Facebook.")
            + f"""    <section class="section section--tight">
      <div class="container">
{gigs_block()}      </div>
    </section>

{booking_band()}""")
    return page("Koncerty — SARAH", "Nadcházející a odehrané koncerty hardrockové kapely Sarah z Českých Budějovic.",
                "koncerty.html", body, current="koncerty.html", extra=extra)


def music():
    songs = "".join(f"<li>{e(s)}</li>" for s in LIVE_SONGS)
    body = (page_head("Hudba", "Písně a album", "Vlastní tvorba je srdcem kapely. Poslechněte si album, nebo přijďte naživo.")
            + f"""    <section class="section section--tight">
      <div class="container">
{album_block(full=True)}
{quote_block()}      </div>
    </section>

    <section class="section section--white">
      <div class="container narrow">
        <p class="label">Naživo</p>
        <h2 class="h2">Co zazní na koncertě</h2>
        <p>Koncert stojí hlavně na vlastních písních. K nim přidáváme covery {", ".join(COVERS[:-1])} a {COVERS[-1]}, a na závěr klidně Mrazíka.</p>
        <ul class="chips">{songs}</ul>
        <div class="btns"><a class="btn btn--dark" href="koncerty.html">Kde hrajeme</a></div>
      </div>
    </section>

{booking_band()}""")
    return page("Hudba — SARAH", "Album Sarah (2012) a písně, které kapela Sarah hraje naživo.", "hudba.html", body, current="hudba.html")


def band():
    story = "\n".join(f"            <p>{e(p)}</p>" for p in STORY)
    timeline = "\n".join(f'          <li><b>{e(y)}</b><div><h3>{e(t)}</h3><p>{e(d)}</p></div></li>' for y, t, d in TIMELINE)
    body = (page_head("O kapele", "Sarah", "Budějovický hard rock od roku 1992.")
            + f"""    <section class="section section--tight">
      <div class="container">
        <figure class="wide"><img src="assets/img/kapela.jpg" alt="Kapela Sarah ve zkušebně: Petr Hájek, Slávek Franc, Zdeněk Troup a Josef Jakeš" width="1440" height="600" loading="lazy" decoding="async"><figcaption>Zleva Petr Hájek, Slávek Franc, Zdeněk Troup a Josef Jakeš.</figcaption></figure>
        <div class="columns">
          <div><p class="label">Příběh</p><h2 class="h2">Od klubů po festivaly</h2></div>
          <div class="prose">
{story}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--white" id="sestava">
      <div class="container">
        <div class="section__head">
          <div><p class="label">Sestava</p><h2 class="h2">Kdo hraje v Sarah</h2></div>
          <p class="muted">Klikněte na kohokoli z nás.</p>
        </div>
{members_grid()}      </div>
    </section>

    <section class="section">
      <div class="container columns">
        <div><p class="label">Historie</p><h2 class="h2">Rok po roku</h2></div>
        <ol class="timeline">
{timeline}
        </ol>
      </div>
    </section>

{booking_band()}""")
    return page("O kapele — SARAH", "Příběh a sestava hardrockové kapely Sarah z Českých Budějovic.", "kapela.html", body, current="kapela.html")


def contact():
    offer = "\n".join(f'          <li><h3>{e(t)}</h3><p>{e(d)}</p></li>' for t, d in OFFER)
    events = "".join(f"<li>{e(x)}</li>" for x in EVENTS)
    links = "\n".join(f'            <li>{ext(u, f"{icon(i)}<span><b>{e(t)}</b><small>{e(d)}</small></span>")}</li>' for i, u, t, d in LINKS)
    files = "\n".join(f'            <li><a href="{p}" download>{icon("down")}<span><b>{e(t)}</b><small>{e(d)}</small></span></a></li>' for p, t, d in PRESS_FILES)
    body = (page_head("Booking a kontakt", "Pozvěte nás hrát", "Kluby, festivaly, letní parkety, firemní i soukromé akce. Nejrychlejší je zavolat.")
            + f"""    <section class="section section--tight">
      <div class="container contact">
        <div class="callcard">
          <p class="label label--light">Booking a domluva koncertů</p>
          <a class="callcard__phone" href="{TEL}">{PHONE}</a>
          <p>Zavolejte nebo pošlete SMS, ozveme se. Domluvíme termín, program i cenu.</p>
          <a class="btn btn--accent btn--lg" href="{TEL}">{icon("phone")}Zavolat</a>
        </div>
        <div class="contact__side">
          <h2 class="h3">Napište nám</h2>
          <ul class="links">
{links}
          </ul>
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container">
        <div class="section__head"><div><p class="label">Co nabízíme</p><h2 class="h2">Zahrajeme i u vás</h2></div></div>
        <ul class="offer">
{offer}
        </ul>
        <ul class="chips chips--quiet" aria-label="Kde hrajeme">{events}</ul>
      </div>
    </section>

    <section class="section" id="pro-poradatele">
      <div class="container columns">
        <div>
          <p class="label">Pro pořadatele a média</p>
          <h2 class="h2">Ke stažení</h2>
          <p class="muted">Logo, fotky a krátký text o kapele pro plakáty, programy a články.</p>
        </div>
        <div>
          <ul class="files">
{files}
          </ul>
          <div class="presstext">
            <div class="presstext__head"><h3>Text o kapele</h3><button class="btn btn--ghost btn--sm" type="button" data-copy="#press-bio">{icon("copy")}<span>Kopírovat</span></button></div>
            <p id="press-bio">{e(PRESS_BIO)}</p>
          </div>
        </div>
      </div>
    </section>
""")
    return page("Booking a kontakt — SARAH", "Pozvěte hardrockovou kapelu Sarah na koncert nebo akci. Booking: 778 885 465.",
                "kontakt.html", body, current="kontakt.html")


def member_page(i):
    m = MEMBERS[i]
    prev, nxt = MEMBERS[i - 1], MEMBERS[(i + 1) % len(MEMBERS)]
    bio = "\n".join(f"            <p>{e(p)}</p>" for p in m["bio"])
    facts = ""
    if m["facts"]:
        facts = ('            <dl class="mfacts">'
                 + "".join(f"<div><dt>{e(a)}</dt><dd>{e(b)}</dd></div>" for a, b in m["facts"]) + "</dl>\n")
    image = f"assets/img/members/{m['key']}.jpg"
    body = f"""    <section class="person">
      <div class="container">
        <nav class="crumbs" aria-label="Drobečková navigace"><a href="kapela.html">Kapela</a><span aria-hidden="true">/</span><span aria-current="page">{e(m['name'])}</span></nav>
        <div class="person__grid">
          <div class="person__photo"><img src="{image}" alt="{e(m['name'])}" width="420" height="560" fetchpriority="high"></div>
          <div class="person__text">
            <p class="label">{e(m['role'])}</p>
            <h1 class="display">{e(m['name'])}</h1>
            <p class="lead">{e(m['short'])}</p>
{bio}
{facts}            <nav class="pager" aria-label="Další členové">
              <a href="{prev['page']}"><small>Předchozí</small><b>{e(prev['name'])}</b></a>
              <a href="{nxt['page']}"><small>Další</small><b>{e(nxt['name'])}</b></a>
            </nav>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--white">
      <div class="container">
        <div class="section__head">
          <div><p class="label">Sestava</p><h2 class="h2">Další v kapele</h2></div>
          <a class="link" href="kapela.html">O kapele{icon("arrow")}</a>
        </div>
{members_grid(exclude=m)}      </div>
    </section>

{booking_band()}"""
    title = f"{m['name']} ({m['instrument']}) — SARAH"
    desc = f"{m['name']}, {m['instrument']} v hardrockové kapele Sarah z Českých Budějovic. {m['short']}"
    return page(title, desc, m["page"], body, current="kapela.html", image=image)


def not_found():
    redirect = """  <script>(function(){var m={"media":"/hudba.html","videa":"/hudba.html"};var p=location.pathname.replace(/^\\/|\\.html$/g,"");if(m[p])location.replace(m[p]);})()</script>
"""
    body = """    <section class="lost">
      <div class="container">
        <p class="label">Chyba 404</p>
        <h1 class="display">Tahle píseň tu nehraje</h1>
        <p class="lead">Stránka, kterou hledáte, neexistuje nebo se přestěhovala.</p>
        <div class="btns"><a class="btn btn--accent" href="index.html">Na úvodní stránku</a><a class="btn btn--ghost" href="koncerty.html">Koncerty</a></div>
      </div>
    </section>
"""
    return page("Stránka nenalezena — SARAH", DESCRIPTION, "404.html", body, extra=redirect, base=True)


def data_js():
    data = {
        "phone": PHONE, "tel": TEL, "facebook": FACEBOOK, "bandzone": BANDZONE,
        "gigs": GIGS,
        "album": {"year": ALBUM["year"], "tracks": ALBUM["tracks"]},
        "members": [{k: m[k] for k in ("key", "name", "instrument", "does", "page", "words")} for m in MEMBERS],
        # optional: address of the chat server from chat-worker/ (empty = answers from the data here)
        "chatApi": "",
    }
    return ("/* Generated by tools/build.py from the content there. Do not edit by hand. */\n"
            f"window.SARAH = {json.dumps(data, ensure_ascii=False, indent=1)};\n")


def sitemap(pages):
    rows = "\n".join(f"  <url><loc>{SITE}/{'' if p == 'index.html' else p}</loc></url>" for p in pages if p != "404.html")
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}\n</urlset>\n'


def main():
    out = {"index.html": home(), "koncerty.html": concerts(), "hudba.html": music(),
           "kapela.html": band(), "kontakt.html": contact(), "404.html": not_found()}
    for i, m in enumerate(MEMBERS):
        out[m["page"]] = member_page(i)
    out["sitemap.xml"] = sitemap([p for p in out if p.endswith(".html")])
    out["assets/js/data.js"] = data_js()
    for name, text in out.items():
        (ROOT / name).write_text(text, encoding="utf-8")
        print(f"wrote {name} ({len(text.encode())} bytes)")


if __name__ == "__main__":
    main()
