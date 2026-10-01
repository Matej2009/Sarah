/* ==========================================================================
   SARAH — sdílený skript pro všechny stránky.
   Nahoře jsou data, která se dají snadno upravovat (koncerty, videa, fotky).
   ========================================================================== */

/* KONCERTY
   date:  "RRRR-MM-DD" (nebo jen "RRRR", když přesné datum neznáme)
   time:  nepovinné, např. "20:00" (použije se i pro odpočet)
   link:  nepovinné, odkaz na vstupenky / událost
   Budoucí termíny se samy zobrazí nahoře, odehrané se po datu přesunou dolů. */
const GIGS = [
  { date: "2026-09-26", venue: "Letní parket Jílovice", city: "Jílovice u Č. Budějovic", note: "s kapelou Blamage" },
  { date: "2023-09-16", venue: "Jílovice", city: "Jílovice u Č. Budějovic", note: "Původní sestava, 30 let kapely" },
  { date: "2023-04", venue: "Seven Fest", city: "KD Ševětín", note: "Oslava 30. narozenin kapely" },
];

/* VIDEA z YouTube (id je část adresy za "watch?v=") */
const VIDEOS = [
  { id: "YIDTwOcJh58", title: "Křídla", meta: "Jílovice, 16. 9. 2023 · původní sestava" },
  { id: "8QpXZPaKw-g", title: "Vlaky", meta: "Původní sestava po třiceti letech · 2023" },
  { id: "Vr9Ju-DKftQ", title: "Sarah naživo", meta: "Hard rock / České Budějovice" },
];

/* FOTKY do galerie. Vlastní fotky nahrajte do assets/photos/ a přidejte sem
   např. { src: "assets/photos/koncert-1.jpg", caption: "Seven Fest 2023" }.
   Pod nimi se automaticky zobrazí i záběry z videí kapely. */
const PHOTOS = [];

/* -------------------------------------------------------------------------- */

const MONTHS = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];
const MONTHS_FULL = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const yt = (id, kind) => `https://i.ytimg.com/vi/${id}/${kind}.jpg`;

/* --- Images: YouTube frames with quality fallback ------------------------- */
// YouTube answers a missing size with a 120×90 grey placeholder, so check the size.
function smartImage(img) {
  const chain = (img.dataset.chain || "").split(",").filter(Boolean);
  const done = () => img.classList.add("is-loaded");
  const next = () => {
    const src = chain.shift();
    if (src) img.src = src; else img.closest("[data-removable]")?.remove();
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
  if (!nav) return;

  if (!nav.classList.contains("nav--solid")) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    menu.classList.toggle("is-open", open);
    root.classList.toggle("menu-open", open);
  };
  toggle?.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* --- Reveal + pause marquee off-screen ----------------------------------- */
function initObservers() {
  if (!("IntersectionObserver" in window)) {
    root.classList.remove("motion");
    return;
  }
  if (root.classList.contains("motion")) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 3) * 80}ms`;
      io.observe(el);
    });
  }
  const mq = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle("is-paused", !e.isIntersecting));
  });
  $$(".marquee").forEach((m) => mq.observe(m));
}

/* --- Gigs ----------------------------------------------------------------- */
function parseGig(g) {
  const [y, m, d] = g.date.split("-").map(Number);
  let end, start;
  if (!m) end = new Date(y, 11, 31, 23, 59);
  else if (!d) end = new Date(y, m, 0, 23, 59);
  else end = new Date(y, m - 1, d, 23, 59);
  if (d) {
    const [hh, mm] = (g.time || "20:00").split(":").map(Number);
    start = new Date(y, m - 1, d, hh, mm);
  }
  return { ...g, y, m, d, end, start };
}
const allGigs = () => GIGS.map(parseGig).sort((a, b) => a.end - b.end);

function dateParts(g) {
  if (g.d) return { big: `${g.d}. ${MONTHS[g.m - 1]}`, small: g.time ? `${g.y} · ${g.time}` : String(g.y) };
  if (g.m) return { big: MONTHS_FULL[g.m - 1], small: String(g.y) };
  return { big: String(g.y), small: "" };
}

function gigRow(g) {
  const li = document.createElement("li");
  li.className = "gig";
  const p = dateParts(g);
  li.innerHTML = `<div class="gig__date"></div><div class="gig__venue"><span></span></div>`;
  const date = $(".gig__date", li);
  date.textContent = p.big;
  if (p.small) { const s = document.createElement("small"); s.textContent = p.small; date.append(s); }
  const venue = $(".gig__venue", li);
  venue.prepend(g.venue);
  $("span", venue).textContent = [g.city, g.note].filter(Boolean).join(" · ");
  if (g.link) {
    const a = document.createElement("a");
    Object.assign(a, { className: "gig__link", href: g.link, target: "_blank", rel: "noopener", textContent: "Info ↗" });
    li.append(a);
  }
  return li;
}

function renderGigList() {
  const up = $("#gigs-upcoming");
  if (!up) return;
  const now = new Date();
  const gigs = allGigs();
  const upcoming = gigs.filter((g) => g.end >= now);
  const past = gigs.filter((g) => g.end < now).reverse();
  upcoming.forEach((g) => up.append(gigRow(g)));
  past.forEach((g) => $("#gigs-past").append(gigRow(g)));
  up.hidden = !upcoming.length;
  $("#gigs-empty").hidden = !!upcoming.length;
  const next = upcoming.find((g) => g.start);
  if (next) startCountdown(next.start);
}

function startCountdown(target) {
  const box = $("#countdown");
  if (!box) return;
  box.hidden = false;
  const el = Object.fromEntries($$("[data-cd]", box).map((n) => [n.dataset.cd, n]));
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const s = Math.max(0, Math.floor((target - new Date()) / 1000));
    el.d.textContent = pad(Math.floor(s / 86400));
    el.h.textContent = pad(Math.floor((s % 86400) / 3600));
    el.m.textContent = pad(Math.floor((s % 3600) / 60));
  };
  tick();
  setInterval(tick, 30000);
}

// Home page: next gig, or the most recent one if nothing is booked yet
function renderGigBox() {
  const box = $("#gigbox");
  if (!box) return;
  const now = new Date();
  const gigs = allGigs();
  const next = gigs.find((g) => g.end >= now);
  const g = next || gigs.filter((x) => x.end < now).pop();
  if (!g) return;
  const p = dateParts(g);
  $(".gigbox__label", box).textContent = next ? "Další koncert" : "Naposledy jsme hráli";
  $(".gigbox__date", box).innerHTML = "";
  $(".gigbox__date", box).append(g.d ? String(g.d) : p.big);
  const small = document.createElement("small");
  small.textContent = g.d ? `${MONTHS[g.m - 1]} ${g.y}`.toUpperCase() : p.small;
  $(".gigbox__date", box).append(small);
  $(".gigbox__venue", box).textContent = g.venue;
  $(".gigbox__meta", box).textContent = [g.city, g.note].filter(Boolean).join(" · ");
  box.hidden = false;
}

/* --- Videos (YouTube loads only after a click) --------------------------- */
function renderVideos() {
  $$("[data-videos]").forEach((wrap) => {
    const limit = Number(wrap.dataset.videos) || VIDEOS.length;
    VIDEOS.slice(0, limit).forEach((v) => {
      const fig = document.createElement("figure");
      fig.className = "video reveal";
      fig.innerHTML = `
        <button class="video__btn" type="button" aria-label="Přehrát video: ${v.title}">
          <img alt="" loading="lazy" decoding="async" width="480" height="360"
               src="${yt(v.id, "hqdefault")}" data-chain="${yt(v.id, "mqdefault")}">
          <span class="video__play" aria-hidden="true"></span>
          <span class="video__tag" aria-hidden="true">LIVE</span>
        </button>
        <figcaption><strong></strong></figcaption>`;
      $("strong", fig).textContent = v.title;
      $("figcaption", fig).append(v.meta);
      smartImage($("img", fig));
      $("button", fig).addEventListener("click", (e) => {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
        iframe.title = v.title;
        iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        e.currentTarget.replaceWith(iframe);
      });
      wrap.append(fig);
    });
  });
}

/* --- Gallery + lightbox --------------------------------------------------- */
function galleryItems() {
  const frames = [];
  VIDEOS.forEach((v) => {
    ["hqdefault", "hq1", "hq2", "hq3"].forEach((k, i) => {
      frames.push({ src: yt(v.id, k), full: yt(v.id, k === "hqdefault" ? "maxresdefault" : k), caption: `${v.title} · ${v.meta}`, frame: i });
    });
  });
  return [...PHOTOS.map((p) => ({ ...p, full: p.src })), ...frames];
}

function renderGallery() {
  const grid = $("[data-gallery]");
  if (!grid) return;
  const limit = Number(grid.dataset.gallery) || Infinity;
  const items = galleryItems().slice(0, limit);
  items.forEach((it, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "gallery__item" + (i % 7 === 0 ? " gallery__item--big" : "");
    b.setAttribute("aria-label", `Zvětšit fotku: ${it.caption || "Sarah"}`);
    b.dataset.removable = "";
    const img = document.createElement("img");
    Object.assign(img, { alt: it.caption || "", loading: "lazy", decoding: "async", width: 480, height: 360 });
    img.src = it.src;
    smartImage(img);
    b.append(img);
    b.addEventListener("click", () => openLightbox(b));
    grid.append(b);
  });

  const lb = $("#lightbox");
  if (!lb) return;
  const big = $("img", lb);
  const cap = $(".lightbox__cap", lb);
  let cur = 0;
  let lastFocus = null;
  function show(i) {
    const visible = $$(".gallery__item", grid);
    cur = (i + visible.length) % visible.length;
    const thumb = $("img", visible[cur]);
    const item = items.find((x) => x.src === thumb.currentSrc || x.src === thumb.src) || {};
    big.src = thumb.src;
    // try a sharper version, keep the thumbnail if it doesn't exist
    if (item.full && item.full !== thumb.src) {
      const hi = new Image();
      hi.onload = () => { if (hi.naturalWidth > thumb.naturalWidth) big.src = item.full; };
      hi.src = item.full;
    }
    big.alt = item.caption || "";
    cap.textContent = item.caption || "";
  }
  function openLightbox(btn) {
    lastFocus = document.activeElement;
    show(Math.max(0, $$(".gallery__item", grid).indexOf(btn)));
    lb.classList.add("is-open");
    root.classList.add("menu-open");
    $(".lightbox__close", lb).focus();
  }
  function close() {
    lb.classList.remove("is-open");
    root.classList.remove("menu-open");
    lastFocus?.focus();
  }
  $(".lightbox__close", lb).addEventListener("click", close);
  $(".lightbox__prev", lb).addEventListener("click", () => show(cur - 1));
  $(".lightbox__next", lb).addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
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

/* --- Small bits ----------------------------------------------------------- */
function initMisc() {
  const year = new Date().getFullYear();
  $$("[data-year]").forEach((el) => { el.textContent = year; });
  $$("[data-since]").forEach((el) => { el.textContent = year - Number(el.dataset.since); });
  $$("img[data-chain]").forEach(smartImage);
}

initNav();
initMisc();
renderGigList();
renderGigBox();
renderVideos();
renderGallery();
initObservers();
