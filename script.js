/* ==========================================================================
   SARAH — sdílený skript pro všechny stránky.
   Nahoře jsou data, která se dají snadno upravovat (koncerty, videa, fotky).
   ========================================================================== */

/* KONCERTY
   date:  "RRRR-MM-DD" (nebo "RRRR-MM" / "RRRR", když přesné datum neznáme)
   time:  nepovinné, např. "20:00" (použije se pro odpočet)
   link:  nepovinné, odkaz na vstupenky / událost */
const GIGS = [
  { date: "2026-09-26", venue: "Letní parket Jílovice", city: "Jílovice u Českých Budějovic", note: "s kapelou Blamage" },
  { date: "2023-09-16", venue: "Jílovice", city: "Jílovice u Českých Budějovic", note: "původní sestava, 30 let kapely" },
  { date: "2023-04", venue: "Seven Fest", city: "KD Ševětín", note: "oslava 30. narozenin kapely" },
];

/* VIDEA z YouTube (id je část adresy za "watch?v=") */
const VIDEOS = [
  { id: "YIDTwOcJh58", title: "Křídla", meta: "Živě v Jílovicích, 16. 9. 2023" },
  { id: "8QpXZPaKw-g", title: "Vlaky", meta: "Původní sestava po třiceti letech, 2023" },
  { id: "Vr9Ju-DKftQ", title: "Sarah naživo", meta: "Záznam z koncertu" },
];

/* SKUTEČNÉ FOTKY (např. z Facebooku kapely) – nahrajte do assets/photos/ a vyplňte.
   Dokud je seznam prázdný, použijí se záběry z videí kapely. */

// Úvodní stránka: velké fotky na pozadí (na šířku, ideálně 1920 px)
const HERO_PHOTOS = [
  // "assets/photos/hero-1.jpg",
];

// Galerie na stránce Foto a video (skutečné fotky jsou první, za nimi záběry z videí), např.
// { src: "assets/photos/koncert-1.jpg", caption: "Seven Fest 2023" }
const PHOTOS = [
  { src: "assets/photos/kapela.jpg", caption: "Sarah: Petr Hájek, Slávek Franc, Zdeněk Troup a Josef Jakeš" },
];

/* SESTAVA a KONTAKT – používá je asistent v chatu (portréty jsou v assets/photos/clenove/) */
const MEMBERS = [
  { name: "Petr Hájek", does: "hraje na kytaru", role: "kytara", page: "petr-hajek.html", words: ["petr", "hajek", "kytar", "kytaris", "guitar"] },
  { name: "Slávek Franc", does: "hraje na bicí", role: "bicí", page: "slavek-franc.html", words: ["slavek", "franc", "bici", "bubn", "bubenik", "drum"] },
  { name: "Zdeněk Troup", does: "zpívá a kapelu v roce 1992 založil", role: "zpěv", page: "zdenek-troup.html", words: ["zdenek", "troup", "zpev", "zpevak", "zpiva", "spiva", "vokal", "sing"] },
  { name: "Josef Jakeš", does: "hraje na baskytaru", role: "baskytara", page: "josef-jakes.html", words: ["josef", "jakes", "bask", "basa", "basak", "basist", "bass"] },
];
const BOOKING_PHONE = "778 885 465";
const FACEBOOK = "https://www.facebook.com/SARAH-%C4%8Deske-bud%C4%9Bjovice-104011628504";
const BANDZONE = "https://bandzone.cz/sarah";

/* Volitelně: adresa serveru s Claude (složka chat-worker/). Prázdné = asistent odpovídá jen z údajů výše. */
const CHAT_API = "";

/* -------------------------------------------------------------------------- */

const MONTHS_FULL = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
const MONTHS_OF = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
const root = document.documentElement;
const motion = () => root.classList.contains("motion");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const yt = (id, kind) => `https://i.ytimg.com/vi/${id}/${kind}.jpg`;
const onScroll = (fn) => {
  let raf = 0;
  window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fn(); }); }, { passive: true });
  window.addEventListener("resize", fn);
  fn();
};

/* --- Images: YouTube frames with quality fallback ------------------------- */
// A missing YouTube size comes back as a 120×90 grey placeholder, so check the size.
// The smaller sizes are 4:3 with black bars around a 16:9 frame; .is-4x3 crops them away.
function smartImage(img) {
  const chain = (img.dataset.chain || "").split(",").filter(Boolean);
  const done = () => {
    const ratio = img.naturalWidth / img.naturalHeight;
    img.classList.toggle("is-4x3", img.src.includes("i.ytimg.com") && Math.abs(ratio - 4 / 3) < 0.02);
  };
  const next = () => {
    const src = chain.shift();
    if (src) img.src = src;
    else img.closest("[data-removable]")?.remove();
  };
  img.addEventListener("load", () => (img.naturalWidth <= 120 ? next() : done()));
  img.addEventListener("error", next);
  if (img.complete && img.naturalWidth > 120) done();
}

/* --- Header + mobile menu ------------------------------------------------- */
function initNav() {
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const menu = $("#menu");
  onScroll(() => nav.classList.toggle("is-scrolled", window.scrollY > 20));
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    menu.classList.toggle("is-open", open);
    root.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* --- The lights-on intro can be skipped by any input ---------------------- */
function initIntro() {
  if (!root.classList.contains("intro")) return;
  const skip = () => {
    root.classList.add("intro-skip");
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((t) => window.removeEventListener(t, skip));
  };
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach((t) => window.addEventListener(t, skip, { passive: true }));
  setTimeout(() => ["wheel", "touchstart", "keydown", "pointerdown"].forEach((t) => window.removeEventListener(t, skip)), 3000);
}

/* --- Hero: real photos or video frames, slow crossfade -------------------- */
function initHero() {
  const box = $(".hero__media");
  if (!box) return;
  if (HERO_PHOTOS.length) {
    $$("img", box).forEach((img) => img.remove());
    box.prepend(...HERO_PHOTOS.map((src, i) => {
      const img = new Image();
      Object.assign(img, { alt: "", decoding: "async", width: 1920, height: 1080 });
      if (i === 0) { img.src = src; img.fetchPriority = "high"; } else img.dataset.src = src;
      return img;
    }));
  }
  const slides = $$("img", box);
  let cur = 0;
  const show = (i) => {
    cur = i % slides.length;
    slides.forEach((s, j) => {
      s.classList.toggle("is-active", j === cur);
      if (j === cur && !s.getAttribute("src") && s.dataset.src) s.src = s.dataset.src;
    });
  };
  show(0);
  if (slides.length > 1 && motion()) setInterval(() => { if (!document.hidden && !box.classList.contains("has-video")) show(cur + 1); }, 7000);

  // while scrolling away, the stage drifts slower than the page and the logo fades
  if (!motion()) return;
  const hero = box.closest(".hero"), content = $(".hero__content", hero);
  onScroll(() => {
    const h = hero.offsetHeight, y = Math.min(window.scrollY, h);
    box.style.transform = `translate3d(0, ${(y * 0.28).toFixed(1)}px, 0)`;
    content.style.opacity = String(Math.max(0, 1 - y / (h * 0.7)).toFixed(3));
  });
}

/* --- Hero: the band plays live behind the logo ---------------------------- */
// The sound button turns the sound on. If the video can't play here (blocked, data saver),
// the button plays the same song on the big screen in the "Naživo" section instead.
function initHeroVideo() {
  const slot = $("[data-video]");
  const btn = $("[data-sound]");
  if (!slot || !btn) return;
  const media = slot.closest(".hero__media");
  const label = $(".sound__text b", btn);
  let f = null, soundOn = false;
  const cmd = (func, args = []) => f?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  const setSound = (on) => {
    soundOn = on;
    btn.setAttribute("aria-pressed", String(on));
    label.textContent = on ? "Ztlumit zvuk" : "Pustit se zvukem";
    if (on) { cmd("unMute"); cmd("setVolume", [80]); cmd("playVideo"); } else cmd("mute");
  };
  btn.addEventListener("click", () => {
    if (media.classList.contains("has-video")) { setSound(!soundOn); return; }
    const big = $("[data-playlist] .video__btn");
    if (!big) return;
    big.closest(".playlist").scrollIntoView({ behavior: motion() ? "smooth" : "auto", block: "center" });
    big.click();
  });
  // another video started playing on the page: the background band goes quiet
  document.addEventListener("sarah:video", () => { if (soundOn) setSound(false); });

  const conn = navigator.connection || {};
  if (!motion() || conn.saveData) return;
  const id = slot.dataset.video;
  const params = new URLSearchParams({ autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: id, playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, disablekb: 1, start: slot.dataset.start || 0, enablejsapi: 1, origin: location.origin });
  f = document.createElement("iframe");
  f.src = `https://www.youtube-nocookie.com/embed/${id}?${params}`;
  f.title = "Sarah naživo";
  f.allow = "autoplay; encrypted-media";
  f.tabIndex = -1;
  slot.append(f);
  // fade the video in only once the player reports it is really playing (never show an error screen)
  f.addEventListener("load", () => f.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*"));
  window.addEventListener("message", (e) => {
    if (e.source !== f.contentWindow || media.classList.contains("has-video")) return;
    let data;
    try { data = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (err) { return; }
    if (data?.info?.playerState === 1) media.classList.add("has-video");
  });
  // off screen and muted there is no reason to play; with the sound on the band keeps playing
  new IntersectionObserver(([e]) => { if (!soundOn) cmd(e.isIntersecting ? "playVideo" : "pauseVideo"); }).observe(slot.closest(".hero"));
}

/* --- Gigs ----------------------------------------------------------------- */
function parseGig(g) {
  const [y, m, d] = g.date.split("-").map(Number);
  const end = !m ? new Date(y, 11, 31, 23, 59) : !d ? new Date(y, m, 0, 23, 59) : new Date(y, m - 1, d, 23, 59);
  let start = null;
  if (d) { const [hh, mm] = (g.time || "20:00").split(":").map(Number); start = new Date(y, m - 1, d, hh, mm); }
  return { ...g, y, m, d, end, start };
}
function splitGigs() {
  const now = new Date();
  const all = GIGS.map(parseGig).sort((a, b) => a.end - b.end);
  return { upcoming: all.filter((g) => g.end >= now), past: all.filter((g) => g.end < now).reverse() };
}
const gigDate = (g) => (g.d ? `${g.d}. ${MONTHS_OF[g.m - 1]} ${g.y}` : g.m ? `${MONTHS_FULL[g.m - 1]} ${g.y}` : String(g.y));
const gigPlace = (g) => [g.city, g.note].filter(Boolean).join(", ");

function gigItem(g, past, mixed) {
  const li = document.createElement("li");
  li.className = "gig" + (past ? " gig--past" : "");
  li.innerHTML = '<div class="gig__date"><b></b><span></span></div><div class="gig__info"><strong></strong><span></span></div>';
  $(".gig__date b", li).textContent = g.d ? `${g.d}. ${g.m}.` : g.y;
  $(".gig__date span", li).textContent = g.d ? String(g.y) : (g.m ? MONTHS_FULL[g.m - 1] : "");
  $(".gig__info strong", li).textContent = g.venue;
  $(".gig__info span", li).textContent = gigPlace(g);
  if (g.link && !past) {
    li.append(Object.assign(document.createElement("a"), { className: "btn btn--line btn--sm", href: g.link, target: "_blank", rel: "noopener", textContent: "Vstupenky" }));
  } else if (!past || mixed) {
    li.append(Object.assign(document.createElement("span"), { className: "gig__status", textContent: past ? "Odehráno" : "Vstup na místě" }));
  }
  return li;
}

// Calendar file for the next show (opens in Google/Apple/Outlook calendar)
function icsLink(g) {
  const pad = (n) => String(n).padStart(2, "0");
  const d = g.start;
  const local = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const esc = (t) => String(t).replace(/([,;\\])/g, "\\$1");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//sarahcb.cz//koncerty//CS", "BEGIN:VEVENT",
    `UID:${local}-${g.venue.replace(/\W+/g, "")}@sarahcb.cz`, `DTSTAMP:${stamp}`, `DTSTART:${local}`, "DURATION:PT3H",
    `SUMMARY:${esc(`Sarah – ${g.venue}`)}`, `LOCATION:${esc([g.venue, g.city].filter(Boolean).join(", "))}`,
    `DESCRIPTION:${esc(g.note || "Koncert kapely Sarah")}`, "URL:https://sarahcb.cz/koncerty.html", "END:VEVENT", "END:VCALENDAR"];
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
}

function renderGigs() {
  const { upcoming, past } = splitGigs();

  // "upcoming" | "past" | "home" (upcoming, or the last shows when nothing is planned)
  $$("[data-gigs]").forEach((list) => {
    const mode = list.dataset.gigs;
    let items = [];
    if (mode === "upcoming") items = upcoming.map((g) => [g, false]);
    else if (mode === "past") items = past.map((g) => [g, true]);
    else items = upcoming.length ? upcoming.slice(0, 4).map((g) => [g, false]) : past.slice(0, 3).map((g) => [g, true]);
    items.forEach(([g, p]) => list.append(gigItem(g, p, mode === "home")));
    list.hidden = !items.length;
  });
  $$("[data-gigs-empty]").forEach((el) => { el.hidden = upcoming.length > 0; });
  $$("[data-gigs-upcoming]").forEach((el) => { el.hidden = !upcoming.length; });

  const next = upcoming[0];
  const card = $("[data-next]");
  if (!card || !next) return;
  $(".next__venue", card).textContent = next.venue;
  $(".next__meta", card).textContent = [gigDate(next), gigPlace(next)].filter(Boolean).join(", ");
  card.hidden = false;
  const cal = $(".next__cal", card);
  if (cal && next.start) { cal.href = icsLink(next); cal.hidden = false; }
  const box = $(".countdown", card);
  if (!next.start || !box) return;
  box.hidden = false;
  const el = Object.fromEntries($$("[data-cd]", box).map((n) => [n.dataset.cd, n]));
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const s = Math.max(0, Math.floor((next.start - new Date()) / 1000));
    el.d.textContent = pad(Math.floor(s / 86400));
    el.h.textContent = pad(Math.floor((s % 86400) / 3600));
    el.m.textContent = pad(Math.floor((s % 3600) / 60));
  };
  tick();
  setInterval(tick, 30000);
}

/* --- Videos: one big screen + a list (YouTube loads only after a click) --- */
function renderPlaylist() {
  $$("[data-playlist]").forEach((box) => {
    box.innerHTML = '<div><div class="playlist__stage"></div><div class="playlist__cap"><strong></strong><span></span></div></div><ol class="playlist__list"></ol>';
    const stage = $(".playlist__stage", box), list = $(".playlist__list", box);
    const play = (v) => {
      document.dispatchEvent(new CustomEvent("sarah:video"));
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
      f.title = v.title;
      f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      stage.replaceChildren(f);
    };
    const show = (i, autoplay) => {
      const v = VIDEOS[i];
      $(".playlist__cap strong", box).textContent = v.title;
      $(".playlist__cap span", box).textContent = v.meta;
      $$("button", list).forEach((b, j) => b.setAttribute("aria-current", String(j === i)));
      if (autoplay) { play(v); return; }
      stage.innerHTML = '<button class="video__btn" type="button"><img alt="" decoding="async" loading="lazy" width="1280" height="720"><span class="video__play" aria-hidden="true"></span></button>';
      const btn = $("button", stage), img = $("img", stage);
      btn.setAttribute("aria-label", `Přehrát video: ${v.title}`);
      img.dataset.chain = `${yt(v.id, "sddefault")},${yt(v.id, "hqdefault")}`;
      img.src = yt(v.id, "maxresdefault");
      smartImage(img);
      btn.addEventListener("click", () => play(v));
    };
    VIDEOS.forEach((v, i) => {
      const li = document.createElement("li");
      li.innerHTML = '<button type="button"><span class="playlist__thumb"><img alt="" loading="lazy" decoding="async" width="320" height="180"></span><span><strong></strong><small></small></span></button>';
      const img = $("img", li);
      img.src = yt(v.id, "mqdefault");
      smartImage(img);
      $("strong", li).textContent = v.title;
      $("small", li).textContent = v.meta;
      $("button", li).addEventListener("click", () => show(i, true));
      list.append(li);
    });
    show(0, false);
  });
}

/* --- Album: the record slides out of the sleeve while you scroll ---------- */
function initAlbum() {
  const section = $("[data-album]");
  if (!section || !motion()) return;
  const art = $(".album__art", section);
  onScroll(() => {
    const r = section.getBoundingClientRect(), vh = window.innerHeight;
    art.style.setProperty("--p", clamp01((vh - r.top) / (vh + r.height * 0.7)).toFixed(3));
  });
}

/* --- Gallery + lightbox --------------------------------------------------- */
function galleryItems() {
  const photos = PHOTOS.map((p) => ({ src: p.src, full: p.full || p.src, caption: p.caption || "" }));
  const frames = VIDEOS.flatMap((v) => ["hqdefault", "hq1", "hq2", "hq3"].map((k, i) => ({
    src: yt(v.id, k), full: yt(v.id, i === 0 ? "maxresdefault" : k), caption: `${v.title}, ${v.meta.charAt(0).toLowerCase()}${v.meta.slice(1)}`,
  })));
  return [...photos, ...frames];
}

function renderGallery() {
  const grid = $("[data-gallery]");
  if (!grid) return;
  galleryItems().forEach((it) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "shot";
    b.dataset.removable = "";
    b.setAttribute("aria-label", `Zvětšit fotku${it.caption ? `: ${it.caption}` : ""}`);
    const img = Object.assign(document.createElement("img"), { alt: "", loading: "lazy", decoding: "async", width: 640, height: 480 });
    img.src = it.src;
    smartImage(img);
    b.append(img);
    b._item = it;
    b.addEventListener("click", () => open(b));
    grid.append(b);
  });

  const lb = $("#lightbox");
  if (!lb) return;
  const big = $("img", lb), cap = $(".lightbox__cap", lb), count = $(".lightbox__count", lb);
  let cur = 0, lastFocus = null;
  const list = () => $$(".shot", grid);
  function show(i) {
    const l = list();
    cur = (i + l.length) % l.length;
    const btn = l[cur], it = btn._item, thumb = $("img", btn);
    big.src = thumb.src;
    big.alt = it.caption;
    cap.textContent = it.caption;
    count.textContent = `${cur + 1} / ${l.length}`;
    if (it.full && it.full !== thumb.src) {
      const hi = new Image();
      hi.onload = () => { if (hi.naturalWidth > thumb.naturalWidth && l[cur] === btn) big.src = it.full; };
      hi.src = it.full;
    }
  }
  function open(btn) {
    lastFocus = btn;
    show(list().indexOf(btn));
    lb.classList.add("is-open");
    root.classList.add("menu-open");
    $(".lightbox__close", lb).focus();
  }
  function close() { lb.classList.remove("is-open"); root.classList.remove("menu-open"); lastFocus?.focus(); }
  $(".lightbox__close", lb).addEventListener("click", close);
  $(".lightbox__prev", lb).addEventListener("click", () => show(cur - 1));
  $(".lightbox__next", lb).addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Tab") { // keep focus inside the viewer
      const btns = $$("button", lb), i = btns.indexOf(document.activeElement);
      e.preventDefault();
      btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

/* --- Chat assistant ------------------------------------------------------- */
// Answers simple questions from the band's own data above (concerts, line-up, phone, album).
// With CHAT_API set, questions go to a small server with Claude (chat-worker/); the answers
// below are then the fallback when that server can't be reached.
const fold = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const TEL_HTML = () => `<a href="tel:+420${BOOKING_PHONE.replace(/\s/g, "")}">${BOOKING_PHONE}</a>`;
const FB_HTML = (label = "Facebooku") => `<a href="${FACEBOOK}" target="_blank" rel="noopener">${label}</a>`;

function gigsAnswer() {
  const { upcoming, past } = splitGigs();
  if (upcoming.length) {
    const g = upcoming[0];
    const more = upcoming.length > 1 ? ` Potom ještě ${upcoming.length - 1}× další.` : "";
    return [`Nejbližší koncert: <b>${gigDate(g)}</b>, ${g.venue}${g.city ? ` (${g.city})` : ""}.${more}`,
      'Všechny termíny jsou na stránce <a href="koncerty.html">Koncerty</a>.'];
  }
  const last = past[0];
  return [`Nové termíny právě domlouváme. Jakmile budou, najdete je na stránce <a href="koncerty.html">Koncerty</a> a na ${FB_HTML()}.`,
    ...(last ? [`Naposledy jsme hráli ${gigDate(last)}: ${last.venue}.`] : [])];
}

const INTENTS = [
  { id: "booking", words: ["objedn", "booking", "pozvat", "pozvani", "pozvem", "zahrat na", "zahrali na", "zahrajete na", "svatb", "oslav", "narozenin", "firemn", "vecir", "ples", "zabav", "rezerv", "domluv", "cena", "cenu", "ceny", "kolik stoj", "kolik by", "kolik chcete", "honorar", "zaplat", "najmout", "u nas"],
    answer: () => [`Rádi přijedeme! Zavolejte na ${TEL_HTML()} a domluvíme termín, program i cenu.`,
      'Hrajeme v klubech, na festivalech, letních parketech i na soukromých a firemních akcích. Víc na stránce <a href="kontakt.html">Booking a kontakt</a>.'] },
  { id: "contact", words: ["kontakt", "telefon", "cislo", "zavolat", "zavolam", "volat", "email", "mail", "napsat", "napis", "sms", "spojit", "ozvat"],
    answer: () => [`Nejrychlejší je zavolat: ${TEL_HTML()} (booking a domluva koncertů).`, `Nebo nám napište zprávu na ${FB_HTML("Facebook")}.`] },
  { id: "gigs", words: ["koncert", "hrajete", "zahrajete", "vystoup", "termin", "kdy hraj", "kde hraj", "kdy budete", "kde budete", "akce", "program", "vstupen", "listk", "tour", "turne", "nejblizsi", "pristi", "kdy vas", "kde vas"],
    answer: gigsAnswer },
  { id: "member", words: MEMBERS.flatMap((m) => m.words), answer: (text) => {
    const m = MEMBERS.find((x) => x.words.some((w) => hit(text, w)));
    return [`<a href="${m.page}">${m.name}</a> ${m.does}.`, `Víc o něm najdete na jeho stránce, stačí kliknout na jméno.`];
  } },
  { id: "members", words: ["clen", "sestav", "kdo hraje", "kdo je v", "kdo jste", "kdo tam", "muzikant", "kapelnik"],
    answer: () => [`Hrajeme ve čtyřech: ${MEMBERS.map((m) => `<a href="${m.page}">${m.name}</a> (${m.role})`).join(", ")}.`,
      'Na stránce <a href="kapela.html">O nás</a> můžete kliknout na kohokoli z nás na fotce.'] },
  { id: "history", words: ["zalozen", "zalozil", "vznik", "histori", "jak dlouho", "od kdy", "kolik let", "1992", "pribeh", "zacat", "zacal"],
    answer: () => ["Sarah založil zpěvák Zdeněk Troup na přelomu let 1992 a 1993 v Českých Budějovicích.",
      'V roce 2012 vyšlo album Sarah, v roce 2014 si kapela dala pauzu a v roce 2023 se vrátila na pódia. Celý příběh je na stránce <a href="kapela.html">O nás</a>.'] },
  { id: "album", words: ["album", "alba", "desk", "cd", "nahravk", "pisn", "pisnick", "skladb", "poslech", "spotify", "bandzone", "youtube", "video", "klip"],
    answer: () => ["Naše album se jmenuje <b>Sarah</b> (2012) a má jedenáct vlastních písní, třeba Srdce-lhář nebo Na křídlech černých vran.",
      `Poslechnout si ho můžete na <a href="${BANDZONE}" target="_blank" rel="noopener">Bandzone</a>, záznamy z koncertů jsou na stránce <a href="media.html">Foto a video</a>.`] },
  { id: "style", words: ["styl", "zanr", "jakou hudb", "jakou muzik", "co hrajete", "cover", "ac dc", "acdc", "metallic", "accept", "scorpions", "repertoar", "rock"],
    answer: () => ["Hrajeme hard rock: hlavně vlastní písně, přímočaré, melodické a nahlas.",
      'K nim přidáváme covery AC/DC, Metallicy, Accept a Scorpions. Co zazní naživo, najdete na stránce <a href="hudba.html">Hudba</a>.'] },
  { id: "photos", words: ["fotk", "foto", "obrazk", "galeri"],
    answer: () => [`Fotky a videa jsou na stránce <a href="media.html">Foto a video</a>. Máte fotky z našeho koncertu? Pošlete nám je přes ${FB_HTML("Facebook")}.`] },
  { id: "where", words: ["odkud", "budejovic", "mesto", "z jakeho"],
    answer: () => ["Jsme z Českých Budějovic a hrajeme hlavně po jižních Čechách."] },
  { id: "hello", words: ["ahoj", "cau", "cus", "nazdar", "zdravim", "dobry den", "dobry vecer", "hello", "hi", "hey"],
    answer: () => ["Ahoj! Zeptejte se třeba, kdy hrajeme, jak nás pozvat na akci nebo kdo je v kapele."] },
  { id: "thanks", words: ["dik", "dekuj", "super", "parad", "skvel", "fajn", "thanks", "nashled"],
    answer: () => [`Rádo se stalo! Kdybyste nás chtěli na akci, volejte ${TEL_HTML()}.`] },
];
const FALLBACK = () => [`Na tohle vám spolehlivě neodpovím. Zeptejte se přímo kapely: zavolejte na ${TEL_HTML()} nebo napište na ${FB_HTML("Facebook")}.`];
const CHIPS = ["Kdy hrajete?", "Jak vás pozvat na akci?", "Kdo je v kapele?", "Kde si vás poslechnout?"];

// a keyword with a space must appear as written; a single word matches the start of any word
function hit(text, w) { return w.includes(" ") ? ` ${text} `.includes(` ${w}`) : text.split(" ").some((t) => t.startsWith(w)); }

function localAnswer(question) {
  const text = fold(question);
  let best = null, score = 0;
  INTENTS.forEach((it) => {
    const n = it.words.filter((w) => hit(text, w)).length;
    if (n > score) { best = it; score = n; }
  });
  return best ? best.answer(text) : FALLBACK();
}

function initChat() {
  const box = $("[data-chat]");
  if (!box) return;
  const openBtn = $(".chat__open", box), panel = $(".chat__panel", box), log = $(".chat__log", box);
  const chips = $(".chat__chips", box), form = $(".chat__form", box), input = $("input", form);
  let history = [];
  try { history = JSON.parse(sessionStorage.getItem("sarah-chat") || "[]"); } catch (e) { history = []; }
  const save = () => { try { sessionStorage.setItem("sarah-chat", JSON.stringify(history.slice(-30))); } catch (e) { /* storage blocked */ } };

  const bubble = (who, html) => {
    const el = document.createElement("div");
    el.className = `chat__msg chat__msg--${who}`;
    el.innerHTML = html;
    log.append(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };
  const render = (m) => bubble(m.who, m.who === "me" ? `<p>${esc(m.text)}</p>` : m.html);
  const renderChips = () => {
    chips.replaceChildren(...CHIPS.map((c) => {
      const b = Object.assign(document.createElement("button"), { type: "button", textContent: c });
      b.addEventListener("click", () => ask(c));
      return b;
    }));
  };
  const greet = () => {
    if (history.length) { history.forEach(render); return; }
    const html = "<p>Ahoj! Jsem asistent kapely Sarah. Poradím vám s koncerty, kapelou, hudbou i s tím, jak nás pozvat na akci.</p>";
    history.push({ who: "bot", html, text: "Ahoj! Jsem asistent kapely Sarah." });
    render(history[0]);
    save();
  };

  async function remoteAnswer(question) {
    const messages = history.slice(-8).map((m) => ({ role: m.who === "me" ? "user" : "assistant", content: m.text }));
    messages.push({ role: "user", content: question });
    while (messages.length && messages[0].role !== "user") messages.shift();
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(CHAT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }), signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.answer) throw new Error("empty answer");
      // the server's text is shown as text; only the booking number becomes a link
      return data.answer.split(/\n{2,}/).map((p) => esc(p).replace(BOOKING_PHONE, TEL_HTML()));
    } finally { clearTimeout(t); }
  }

  async function ask(question) {
    question = question.trim().slice(0, 300);
    if (!question) return;
    const me = { who: "me", text: question };
    render(me);
    const typing = bubble("bot", '<span class="chat__typing" aria-label="Píšu odpověď"><i></i><i></i><i></i></span>');
    let paras;
    if (CHAT_API) {
      try { paras = await remoteAnswer(question); } catch (e) { paras = localAnswer(question); }
    } else {
      await new Promise((r) => setTimeout(r, motion() ? 550 : 0));
      paras = localAnswer(question);
    }
    const html = paras.map((p) => `<p>${p}</p>`).join("");
    typing.innerHTML = html;
    log.scrollTop = log.scrollHeight;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    history.push(me, { who: "bot", html, text: tmp.textContent });
    save();
  }

  const setOpen = (open) => {
    panel.hidden = !open;
    box.classList.toggle("is-open", open);
    openBtn.setAttribute("aria-expanded", String(open));
    if (open) {
      if (!log.children.length) { greet(); renderChips(); }
      input.focus();
    } else openBtn.focus();
  };
  openBtn.addEventListener("click", () => setOpen(true));
  $(".chat__close", box).addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) setOpen(false); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value;
    input.value = "";
    ask(q);
  });
}

/* --- Guitar pick instead of the mouse pointer --------------------------- */
const PICK_SVG = `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="pick-g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#ff6d60"/><stop offset=".55" stop-color="#d42a1e"/><stop offset="1" stop-color="#8c0d12"/></linearGradient></defs>
<g transform="translate(24 24) rotate(145) translate(-20 -23)"><path d="M20 45C13 38 2 24 2 13 2 5 10 1 20 1s18 4 18 12c0 11-11 25-18 32z" fill="url(#pick-g)" stroke="rgba(0,0,0,.55)" stroke-width="1.2"/>
<path d="M9 9c3-3.5 7-5 12-5" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2" stroke-linecap="round"/></g></svg>`;

function initPick() {
  if (!finePointer) return;
  const pick = document.createElement("div");
  pick.className = "pick";
  pick.setAttribute("aria-hidden", "true");
  pick.innerHTML = PICK_SVG;
  document.body.append(pick);
  root.classList.add("has-pick");
  const smooth = motion();
  let x = -100, y = -100, tx = -100, ty = -100, tilt = 0, raf = 0;
  const loop = () => {
    const dx = tx - x;
    x += dx * (smooth ? 0.5 : 1);
    y += (ty - y) * (smooth ? 0.5 : 1);
    const want = smooth ? Math.max(-24, Math.min(24, dx * 1.2)) : 0; // leans into the movement
    tilt += (want - tilt) * 0.18;
    pick.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    pick.style.setProperty("--tilt", `${tilt.toFixed(2)}deg`);
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 || Math.abs(tilt - want) > 0.1 ? requestAnimationFrame(loop) : 0;
  };
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX; ty = e.clientY;
    if (!pick.classList.contains("is-on")) { x = tx; y = ty; pick.classList.add("is-on"); }
    pick.classList.toggle("is-hot", Boolean(e.target.closest?.("a, button, [role=button], summary, label")));
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  // the page can't draw over a YouTube player or outside the window – hide the pick there
  document.addEventListener("pointerover", (e) => { if (e.target.tagName === "IFRAME") pick.classList.remove("is-on"); });
  document.documentElement.addEventListener("mouseleave", () => pick.classList.remove("is-on"));
  window.addEventListener("blur", () => pick.classList.remove("is-on"));
}

function initMisc() {
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  $$("img[data-chain]").forEach(smartImage);
}

initNav();
initIntro();
initMisc();
initHero();
renderGigs();
renderPlaylist();
initHeroVideo();
initAlbum();
renderGallery();
initChat();
initPick();
