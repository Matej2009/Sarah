/* ==========================================================================
   KONCERTY — sem přidávejte nové termíny.
   date:  "RRRR-MM-DD" (nebo jen "RRRR", když přesné datum neznáme)
   time:  nepovinné, např. "20:00" (použije se i pro odpočet)
   link:  nepovinné, odkaz na vstupenky / událost
   Budoucí termíny se automaticky zobrazí nahoře (s odpočtem), odehrané dole.
   ========================================================================== */
const GIGS = [
  {
    date: "2026-09-26",
    venue: "Letní parket Jílovice",
    city: "Jílovice",
    note: "s kapelou Blamage",
  },
  {
    date: "2023",
    venue: "Seven Fest",
    city: "Ševětín",
    note: "Oslava 30 let kapely v původní sestavě",
  },
];

/* ==========================================================================
   GALERIE — fotky nahrajte do složky assets/photos/ a přidejte je sem, např.:
   { src: "assets/photos/koncert-1.jpg", alt: "Sarah na Seven Festu 2023" },
   Dokud je seznam prázdný, sekce galerie se nezobrazí.
   ========================================================================== */
const GALLERY = [];

const SONGS = ["Mrazík", "Se mnou nepočítej", "Křídla", "Vlaky", "Střílej", "Sarah", "Modrá erekce impotenta", "Noc vládne nám"];

const MONTHS = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const root = document.documentElement;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* --- Intro ---------------------------------------------------------------- */
function initIntro(onDone) {
  let seen = false;
  try { seen = sessionStorage.getItem("sarah-intro") === "1"; } catch (e) { /* storage blocked */ }
  if (reduceMotion || seen) {
    root.classList.add("no-intro", "is-loaded", "is-ready");
    onDone();
    return;
  }
  try { sessionStorage.setItem("sarah-intro", "1"); } catch (e) { /* ignore */ }
  setTimeout(() => root.classList.add("is-loaded"), 1500);
  setTimeout(() => { root.classList.add("is-ready"); onDone(); }, 1750);
}

/* --- Hero photo (YouTube frame with low-res fallback) -------------------- */
function initHeroPhoto() {
  const img = document.querySelector(".hero__photo");
  if (!img) return;
  const ready = () => {
    // YouTube returns a 120×90 placeholder when maxres doesn't exist
    if (img.naturalWidth <= 120 && img.dataset.fallback && img.src !== img.dataset.fallback) {
      img.src = img.dataset.fallback;
      return;
    }
    img.classList.add("is-loaded");
  };
  img.addEventListener("load", ready);
  img.addEventListener("error", () => {
    if (img.dataset.fallback && img.src !== img.dataset.fallback) img.src = img.dataset.fallback;
  });
  if (img.complete && img.naturalWidth) ready();
}

/* --- Gigs + countdown ----------------------------------------------------- */
function gigDate(gig, endOfDay = true) {
  if (/^\d{4}$/.test(gig.date)) return new Date(Number(gig.date), 11, 31, 23, 59);
  const [y, m, d] = gig.date.split("-").map(Number);
  if (!endOfDay && gig.time) {
    const [hh, mm] = gig.time.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }
  return endOfDay ? new Date(y, m - 1, d, 23, 59) : new Date(y, m - 1, d, 20, 0);
}

function renderGig(gig) {
  const li = document.createElement("li");
  li.className = "gig reveal";

  const date = document.createElement("div");
  date.className = "gig__date";
  if (/^\d{4}$/.test(gig.date)) {
    date.textContent = gig.date;
  } else {
    const [y, m, d] = gig.date.split("-").map(Number);
    date.textContent = `${d}. ${MONTHS[m - 1]}`;
    const small = document.createElement("small");
    small.textContent = gig.time ? `${y} · ${gig.time}` : String(y);
    date.append(small);
  }

  const venue = document.createElement("div");
  venue.className = "gig__venue";
  venue.textContent = gig.venue;
  const sub = document.createElement("span");
  sub.textContent = [gig.city, gig.note].filter(Boolean).join(" · ");
  venue.append(sub);

  li.append(date, venue);

  if (gig.link) {
    const a = document.createElement("a");
    a.className = "gig__link";
    a.href = gig.link;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Info ↗";
    li.append(a);
  }
  return li;
}

function renderGigs() {
  const now = new Date();
  const sorted = [...GIGS].sort((a, b) => gigDate(a) - gigDate(b));
  const upcoming = sorted.filter((g) => gigDate(g) >= now);
  const past = sorted.filter((g) => gigDate(g) < now).reverse();

  const upEl = document.getElementById("gigs-upcoming");
  const pastEl = document.getElementById("gigs-past");
  upcoming.forEach((g) => upEl.append(renderGig(g)));
  past.forEach((g) => pastEl.append(renderGig(g)));
  document.getElementById("gigs-empty").hidden = upcoming.length > 0;
  upEl.hidden = upcoming.length === 0;

  const next = upcoming.find((g) => !/^\d{4}$/.test(g.date));
  if (next) startCountdown(gigDate(next, false));
}

function startCountdown(target) {
  const box = document.getElementById("countdown");
  box.hidden = false;
  const el = Object.fromEntries([...box.querySelectorAll("[data-cd]")].map((n) => [n.dataset.cd, n]));
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const diff = Math.max(0, target - new Date());
    const s = Math.floor(diff / 1000);
    el.d.textContent = pad(Math.floor(s / 86400));
    el.h.textContent = pad(Math.floor((s % 86400) / 3600));
    el.m.textContent = pad(Math.floor((s % 3600) / 60));
    el.s.textContent = pad(s % 60);
  };
  tick();
  setInterval(tick, 1000);
}

/* --- Gallery -------------------------------------------------------------- */
function initGallery() {
  if (!GALLERY.length) return;
  const section = document.getElementById("galerie");
  const strip = document.getElementById("gallery-strip");
  GALLERY.forEach((p) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.src = p.src;
    img.alt = p.alt || "";
    img.loading = "lazy";
    fig.append(img);
    strip.append(fig);
  });
  section.hidden = false;

  // drag to scroll on desktop
  let down = false, startX = 0, startScroll = 0;
  strip.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; startX = e.clientX; startScroll = strip.scrollLeft;
    strip.classList.add("is-dragging");
  });
  window.addEventListener("pointermove", (e) => { if (down) strip.scrollLeft = startScroll - (e.clientX - startX); });
  window.addEventListener("pointerup", () => { down = false; strip.classList.remove("is-dragging"); });
}

/* --- Nav ------------------------------------------------------------------ */
function initNav() {
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    menu.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));
}

/* --- Text scramble -------------------------------------------------------- */
function scramble(el) {
  const final = el.textContent;
  const chars = "ABCDEFGHIJKLMNOPRSTUVZ0123456789#%&*/";
  let frame = 0;
  const total = 22;
  const run = () => {
    el.textContent = final.split("").map((c, i) => {
      if (c === " " || i < (frame / total) * final.length) return c;
      return chars[Math.floor(Math.random() * chars.length)];
    }).join("");
    if (++frame <= total) requestAnimationFrame(run);
    else el.textContent = final;
  };
  run();
}

/* --- Reveal on scroll ----------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("is-visible");
      if (el.classList.contains("scramble")) scramble(el);
      if (el.classList.contains("setlist")) {
        el.querySelectorAll(".setlist__list li").forEach((li, i) => { li.style.transitionDelay = `${200 + i * 70}ms`; });
      }
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  // stagger siblings that enter together
  items.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 90}ms`;
    io.observe(el);
  });
}

/* --- Count-up ------------------------------------------------------------- */
function countUp() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-count-since]").forEach((el) => {
    el.dataset.count = year - Number(el.dataset.countSince);
    el.dataset.from = 0;
  });
  document.querySelectorAll("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count);
    const from = Number(el.dataset.from || 0);
    if (reduceMotion) { el.textContent = to; return; }
    const start = performance.now() + 700;
    const dur = 1400;
    const step = (t) => {
      const p = clamp((t - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = from;
    requestAnimationFrame(step);
  });
}

/* --- Statement: split into words lit by scroll ---------------------------- */
function splitWords() {
  const el = document.querySelector("[data-words]");
  if (!el) return [];
  const hot = ["1992", "hard", "rock", "kompromisy."];
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", words.join(" "));
  el.textContent = "";
  return words.map((w, i) => {
    const span = document.createElement("span");
    span.className = "w" + (hot.includes(w) ? " hot" : "");
    span.setAttribute("aria-hidden", "true");
    span.textContent = w;
    el.append(span);
    if (i < words.length - 1) el.append(" ");
    return span;
  });
}

/* --- Marquees ------------------------------------------------------------- */
function buildMarquees() {
  return [...document.querySelectorAll("[data-songs]")].map((track) => {
    const set = SONGS.map((s) => `<span>${s}</span>`).join("");
    track.innerHTML = set + set + set + set;
    return { track, x: 0, dir: track.hasAttribute("data-reverse") ? 1 : -1 };
  });
}

/* --- Sparks (canvas) ------------------------------------------------------ */
function initSparks() {
  const canvas = document.querySelector(".hero__sparks");
  if (!canvas || reduceMotion) return () => {};
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const count = w < 600 ? 28 : 60;
  const spawn = (p = {}) => Object.assign(p, {
    x: w * (0.35 + Math.random() * 0.65),
    y: h + Math.random() * h * 0.5,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -(0.4 + Math.random() * 1.2),
    r: 0.6 + Math.random() * 1.8,
    life: 0,
    max: 200 + Math.random() * 260,
    hue: 10 + Math.random() * 30,
  });
  const parts = Array.from({ length: count }, () => {
    const p = spawn();
    p.y = Math.random() * h;
    return p;
  });

  return function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (const p of parts) {
      p.life++;
      p.x += p.vx + Math.sin((p.life + p.max) * 0.02) * 0.3;
      p.y += p.vy;
      const a = Math.sin(Math.PI * clamp(p.life / p.max, 0, 1));
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${a * 0.85})`;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 55%, 1)`;
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      if (p.life > p.max || p.y < -10) spawn(p);
    }
  };
}

/* --- Pointer effects: spotlight, tilt, magnetic, footer glow -------------- */
function initPointer() {
  if (!finePointer || reduceMotion) return;

  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
    hero.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  document.querySelectorAll(".tilt").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.classList.add("is-tilting");
      el.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
    });
    el.addEventListener("pointerleave", () => {
      el.classList.remove("is-tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });

  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  const footer = document.querySelector(".footer__big");
  window.addEventListener("pointermove", (e) => {
    footer.style.setProperty("--fx", `${(e.clientX / window.innerWidth) * 100}%`);
  }, { passive: true });
}

/* --- Videos: load YouTube only after a click ----------------------------- */
function initVideos() {
  document.querySelectorAll(".video__facade").forEach((btn) => {
    const thumb = btn.querySelector("img");
    thumb.addEventListener("error", () => { thumb.style.visibility = "hidden"; });
    btn.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0`;
      iframe.title = btn.getAttribute("aria-label").replace("Přehrát video: ", "");
      iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });
}

/* --- Main loop: scroll-driven effects ------------------------------------ */
function startLoop() {
  const nav = document.querySelector(".nav");
  const progress = document.querySelector(".progress");
  const heroMedia = document.querySelector(".hero__media");
  const hero = document.querySelector(".hero");
  const words = splitWords();
  const statement = document.querySelector("[data-words]");
  const timeline = document.querySelector(".timeline");
  const tlItems = [...document.querySelectorAll(".timeline__item")];
  const fills = [...document.querySelectorAll(".fill-on-scroll")];
  const marquees = buildMarquees();
  const drawSparks = initSparks();

  let lastY = window.scrollY;
  let velocity = 0;
  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  const frame = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const delta = y - lastY;
    lastY = y;
    velocity += (delta - velocity) * 0.15;

    // progress bar + nav
    const max = document.documentElement.scrollHeight - vh;
    progress.style.setProperty("--p", max > 0 ? y / max : 0);
    nav.classList.toggle("is-scrolled", y > 24);
    const menuOpen = document.getElementById("menu").classList.contains("is-open");
    if (!menuOpen) nav.classList.toggle("is-hidden", delta > 4 && y > vh * 0.8 ? true : delta < -4 ? false : nav.classList.contains("is-hidden"));

    if (!reduceMotion) {
      // hero parallax + sparks
      if (heroVisible) {
        heroMedia.style.setProperty("--py", `${y * 0.35}px`);
        drawSparks();
      }

      // marquees react to scroll speed and direction
      const boost = clamp(Math.abs(velocity) * 0.6, 0, 18);
      const flip = velocity < -0.5 ? -1 : 1;
      for (const m of marquees) {
        const half = m.track.scrollWidth / 2;
        m.x += m.dir * flip * (0.6 + boost);
        if (half > 0) {
          if (m.x <= -half) m.x += half;
          if (m.x > 0) m.x -= half;
        }
        m.track.style.transform = `translate3d(${m.x}px, 0, 0)`;
      }

      // statement words light up as it scrolls through the viewport
      if (statement) {
        const r = statement.getBoundingClientRect();
        const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
        const lit = Math.floor(p * words.length * 1.05);
        words.forEach((w, i) => w.classList.toggle("on", i < lit));
      }

      // timeline line draws with scroll
      if (timeline) {
        const r = timeline.getBoundingClientRect();
        const p = clamp((vh * 0.7 - r.top) / r.height, 0, 1);
        timeline.style.setProperty("--tl", p.toFixed(3));
        tlItems.forEach((it) => {
          const ir = it.getBoundingClientRect();
          it.classList.toggle("is-lit", ir.top + 14 < vh * 0.7);
        });
      }

      // booking headline fills in
      fills.forEach((f) => {
        const r = f.getBoundingClientRect();
        const p = clamp((vh * 0.9 - r.top) / (vh * 0.45), 0, 1);
        f.style.setProperty("--fill", `${(p * 100).toFixed(1)}%`);
      });
    }

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* --- Boot ----------------------------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear();
renderGigs();
initGallery();
initNav();
initHeroPhoto();
initVideos();
initPointer();
initReveal();
startLoop();
initIntro(countUp);
