/* ==========================================================================
   SARAH — sdílený skript pro všechny stránky.
   Nahoře jsou data, která se dají snadno upravovat (koncerty, videa, fotky).
   ========================================================================== */

/* KONCERTY
   date:  "RRRR-MM-DD" (nebo "RRRR-MM" / "RRRR", když přesné datum neznáme)
   time:  nepovinné, např. "20:00" (použije se pro odpočet)
   link:  nepovinné, odkaz na vstupenky / událost */
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

/* SKUTEČNÉ FOTKY (např. z Facebooku kapely) – nahrajte do assets/photos/ a vyplňte.
   Dokud je seznam prázdný, použijí se záběry z videí kapely. */

// Úvodní stránka: velké fotky na pozadí (na šířku, ideálně 1920 px)
const HERO_PHOTOS = [
  // "assets/photos/hero-1.jpg",
];

// Členové: portrét na výšku (ideálně 900 × 1200 px)
const MEMBER_PHOTOS = {
  troup: "",    // "assets/photos/clenove/troup.jpg"
  przeczek: "",
  jakes: "",
  franc: "",
};

// Galerie na stránce Foto & video, např.
// { src: "assets/photos/koncert-1.jpg", caption: "Seven Fest 2023" }
const PHOTOS = [];

/* -------------------------------------------------------------------------- */

const MONTHS = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];
const MONTHS_FULL = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const yt = (id, kind) => `https://i.ytimg.com/vi/${id}/${kind}.jpg`;

/* --- Images: YouTube frames with quality fallback ------------------------- */
// A missing YouTube size comes back as a 120×90 grey placeholder, so check the size.
function smartImage(img) {
  const chain = (img.dataset.chain || "").split(",").filter(Boolean);
  const done = () => img.classList.add("is-loaded");
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
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    menu.classList.toggle("is-open", open);
    root.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* --- Hero: real photos or video frames, slow crossfade -------------------- */
function initHero() {
  const box = $(".media--slides");
  if (!box) return;
  if (HERO_PHOTOS.length) {
    box.replaceChildren(...HERO_PHOTOS.map((src, i) => {
      const img = new Image();
      Object.assign(img, { alt: "", decoding: "async", width: 1920, height: 1080 });
      if (i === 0) { img.src = src; img.fetchPriority = "high"; } else img.dataset.src = src;
      img.addEventListener("load", () => img.classList.add("is-loaded"));
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
  if (slides.length > 1 && !reduceMotion) setInterval(() => { if (!document.hidden) show(cur + 1); }, 7000);
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
const gigDate = (g) => (g.d ? `${g.d}. ${g.m}. ${g.y}` : g.m ? `${MONTHS_FULL[g.m - 1]} ${g.y}` : String(g.y));
const gigPlace = (g) => [g.city, g.note].filter(Boolean).join(" · ");

function gigItem(g, past, mixed) {
  const li = document.createElement("li");
  li.className = "gig reveal" + (past ? " gig--past" : "");
  li.innerHTML = '<div class="gig__date"><b></b><span></span></div><div class="gig__info"><strong></strong><span></span></div>';
  $(".gig__date b", li).textContent = g.d || (g.m ? MONTHS[g.m - 1] : g.y);
  $(".gig__date span", li).textContent = g.d ? `${MONTHS[g.m - 1]} ${g.y}` : String(g.y);
  $(".gig__info strong", li).textContent = g.venue;
  $(".gig__info span", li).textContent = gigPlace(g);
  if (g.link && !past) {
    const a = Object.assign(document.createElement("a"), { className: "btn btn--ghost btn--sm", href: g.link, target: "_blank", rel: "noopener", textContent: "Vstupenky" });
    li.append(a);
  } else if (!past || mixed) {
    li.append(Object.assign(document.createElement("span"), { className: "gig__status", textContent: past ? "Odehráno" : "Vstup na místě" }));
  }
  return li;
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
  const pill = $("[data-next-pill]");
  if (pill && next) {
    $("strong", pill).textContent = next.venue;
    $("span", pill).textContent = gigDate(next);
    pill.hidden = false;
  }

  const card = $("[data-next]");
  if (card && next) {
    $(".next__venue", card).textContent = next.venue;
    $(".next__meta", card).textContent = [gigDate(next), gigPlace(next)].filter(Boolean).join(" · ");
    card.hidden = false;
    const box = $(".countdown", card);
    if (next.start && box) {
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
  }
}

/* --- Videos (YouTube loads only after a click) --------------------------- */
function renderVideos() {
  $$("[data-videos]").forEach((wrap) => {
    const limit = Number(wrap.dataset.videos) || VIDEOS.length;
    VIDEOS.slice(0, limit).forEach((v) => {
      const fig = document.createElement("figure");
      fig.className = "video reveal";
      fig.innerHTML = `
        <button class="video__btn" type="button">
          <img alt="" loading="lazy" decoding="async" width="480" height="360" src="${yt(v.id, "hqdefault")}" data-chain="${yt(v.id, "mqdefault")}">
          <span class="video__play" aria-hidden="true"></span>
        </button>
        <figcaption><strong></strong></figcaption>`;
      $("button", fig).setAttribute("aria-label", `Přehrát video: ${v.title}`);
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
  if (PHOTOS.length) return PHOTOS.map((p) => ({ src: p.src, full: p.full || p.src, caption: p.caption || "" }));
  return VIDEOS.flatMap((v) => ["hqdefault", "hq1", "hq2", "hq3"].map((k, i) => ({
    src: yt(v.id, k), full: yt(v.id, i === 0 ? "maxresdefault" : k), caption: `${v.title} · ${v.meta}`,
  })));
}

function renderGallery() {
  const grid = $("[data-gallery]");
  if (!grid) return;
  galleryItems().forEach((it) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "shot reveal";
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
  const big = $("img", lb), cap = $(".lightbox__cap", lb);
  let cur = 0, lastFocus = null;
  const list = () => $$(".shot", grid);
  function show(i) {
    const l = list();
    cur = (i + l.length) % l.length;
    const btn = l[cur], it = btn._item, thumb = $("img", btn);
    big.src = thumb.src;
    big.alt = it.caption;
    cap.textContent = it.caption;
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

/* --- Member photos -------------------------------------------------------- */
function initMembers() {
  $$("[data-member]").forEach((card) => {
    const src = MEMBER_PHOTOS[card.dataset.member];
    if (!src) return;
    const box = $(".member__photo", card);
    const img = Object.assign(new Image(), { alt: "", loading: "lazy", decoding: "async", width: 900, height: 1200, src });
    img.addEventListener("error", () => img.remove());
    box.append(img);
  });
}

/* --- Reveal on scroll ---------------------------------------------------- */
function initReveal() {
  if (!root.classList.contains("motion")) return;
  if (!("IntersectionObserver" in window)) { root.classList.remove("motion"); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 4) * 70}ms`;
    io.observe(el);
  });
}

function initMisc() {
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  $$("img[data-chain]").forEach(smartImage);
}

initNav();
initMisc();
initHero();
renderGigs();
renderVideos();
renderGallery();
initMembers();
initReveal();
