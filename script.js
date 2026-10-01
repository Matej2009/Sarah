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

/* VLASTNÍ FOTKY – nahrajte do assets/photos/ a přidejte sem, např.
   { src: "assets/photos/koncert-1.jpg", caption: "Seven Fest 2023" }
   Pod nimi se automaticky zobrazí i záběry z videí kapely. */
const PHOTOS = [];

/* -------------------------------------------------------------------------- */

const MONTHS = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];
const MONTHS_FULL = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
const root = document.documentElement;
const motion = () => root.classList.contains("motion");
const lite = root.classList.contains("lite");
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const yt = (id, kind) => `https://i.ytimg.com/vi/${id}/${kind}.jpg`;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
};

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

/* --- Toast + pyro --------------------------------------------------------- */
let toastTimer;
function toast(msg) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("is-shown"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-shown"), 2600);
}

function pyro(count = 12) {
  if (!motion()) return;
  let box = $(".pyro");
  if (!box) { box = document.createElement("div"); box.className = "pyro"; box.setAttribute("aria-hidden", "true"); document.body.append(box); }
  const n = lite ? Math.ceil(count / 3) : count;
  for (let i = 0; i < n; i++) {
    const f = document.createElement("span");
    f.className = "flame";
    f.style.left = `${(i + 0.5) * (100 / n) + (Math.random() - 0.5) * 4}%`;
    f.style.animationDelay = `${Math.random() * 0.25}s`;
    f.style.height = `${110 + Math.random() * 90}px`;
    box.append(f);
    setTimeout(() => f.remove(), 1500);
  }
}

/* --- Guitar riff (Web Audio, synthesised – no audio files) --------------- */
let audioCtx;
function playRiff() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audioCtx = audioCtx || new AC();
  const ctx = audioCtx;
  if (ctx.state === "suspended") ctx.resume();
  const vol = parseFloat(getComputedStyle(root).getPropertyValue("--vol")) || 0.45;

  const shaper = ctx.createWaveShaper();
  const k = 60 + vol * 340;
  const curve = new Float32Array(2048);
  for (let i = 0; i < curve.length; i++) {
    const x = (i * 2) / curve.length - 1;
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  shaper.curve = curve;
  shaper.oversample = "4x";
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass"; tone.frequency.value = 2600 + vol * 1800; tone.Q.value = 0.8;
  const cab = ctx.createBiquadFilter();
  cab.type = "peaking"; cab.frequency.value = 900; cab.gain.value = 4;
  const master = ctx.createGain();
  master.gain.value = 0.06 + vol * 0.22;
  shaper.connect(tone).connect(cab).connect(master).connect(ctx.destination);

  // E5 E5 E5 G5 A5 … E5  (root + fifth + octave, palm-muted chugs then a ring-out)
  const E = 82.41, G = 98.0, A = 110.0, D = 73.42;
  const riff = [[0, 0.11, E, 1], [0.14, 0.11, E, 1], [0.28, 0.11, E, 1], [0.42, 0.28, G, 0], [0.74, 0.28, A, 0],
    [1.06, 0.11, E, 1], [1.2, 0.11, E, 1], [1.34, 0.26, D, 0], [1.62, 1.3, E, 0]];
  const t0 = ctx.currentTime + 0.02;
  riff.forEach(([at, dur, f, muted]) => {
    const env = ctx.createGain();
    env.connect(shaper);
    const start = t0 + at;
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(1, start + 0.006);
    env.gain.exponentialRampToValueAtTime(muted ? 0.05 : 0.5, start + dur * (muted ? 0.6 : 0.5));
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur + (muted ? 0.04 : 0.35));
    [1, 1.4983, 2].forEach((mult, j) => {
      [-6, 6].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f * mult;
        o.detune.value = det + j * 2;
        o.connect(env);
        o.start(start);
        o.stop(start + dur + 0.45);
      });
    });
  });

  root.classList.add("is-riffing");
  setTimeout(() => root.classList.remove("is-riffing"), 1100);
  if (vol > 0.95) pyro(10);
}

/* --- Amp knob (0–11) ------------------------------------------------------ */
function initAmp() {
  const amp = $("[data-amp]");
  if (!amp) return;
  const knob = $(".amp__knob", amp);
  const ticks = $(".amp__ticks", amp);
  const out = $("[data-amp-value]", amp);
  const MIN_A = -135, MAX_A = 135;
  for (let i = 0; i <= 11; i++) {
    const s = document.createElement("span");
    s.textContent = i;
    s.style.setProperty("--a", `${MIN_A + (i * (MAX_A - MIN_A)) / 11}deg`);
    ticks.append(s);
  }
  const tickEls = $$("span", ticks);
  let value = Number(store.get("sarah-vol") ?? 5);
  let eleven = false;

  const set = (v, fromUser) => {
    value = Math.max(0, Math.min(11, Math.round(v * 2) / 2));
    const a = MIN_A + (value * (MAX_A - MIN_A)) / 11;
    knob.style.setProperty("--knob", `${a}deg`);
    root.style.setProperty("--vol", (value / 11).toFixed(3));
    knob.setAttribute("aria-valuenow", value);
    knob.setAttribute("aria-valuetext", `${value} z 11`);
    out.textContent = value;
    tickEls.forEach((t, i) => t.classList.toggle("on", i <= value));
    amp.classList.toggle("is-hot", value >= 8);
    if (!fromUser) return;
    store.set("sarah-vol", value);
    if (value === 11 && !eleven) {
      eleven = true;
      root.classList.add("is-eleven");
      setTimeout(() => root.classList.remove("is-eleven"), 1100);
      pyro(16);
      toast("Až na jedenáctku! 🤘 Díky, Budějovice!");
    }
    if (value < 11) eleven = false;
  };
  set(value, false);

  let dragging = false, startY = 0, startX = 0, startV = 0;
  knob.addEventListener("pointerdown", (e) => {
    dragging = true; startY = e.clientY; startX = e.clientX; startV = value;
    knob.setPointerCapture(e.pointerId);
  });
  knob.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const delta = (startY - e.clientY + (e.clientX - startX)) / 14;
    set(startV + delta, true);
  });
  const end = () => { dragging = false; };
  knob.addEventListener("pointerup", end);
  knob.addEventListener("pointercancel", end);
  knob.addEventListener("wheel", (e) => { e.preventDefault(); set(value + (e.deltaY < 0 ? 0.5 : -0.5), true); }, { passive: false });
  knob.addEventListener("keydown", (e) => {
    const step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 2, PageDown: -2 }[e.key];
    if (step) { e.preventDefault(); set(value + step, true); }
    if (e.key === "Home") { e.preventDefault(); set(0, true); }
    if (e.key === "End") { e.preventDefault(); set(11, true); }
  });
  ticks.addEventListener("click", (e) => { if (e.target.matches("span")) set(Number(e.target.textContent), true); });
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

/* --- Hero slideshow + parallax ------------------------------------------- */
function initHero() {
  const hero = $(".hero");
  if (!hero) return;
  const slides = $$(".slides img", hero);
  const dots = $(".dots", hero);
  let cur = 0, timer;
  const show = (i) => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, j) => {
      s.classList.toggle("is-active", j === cur);
      if (j === cur && !s.getAttribute("src") && s.dataset.src) s.src = s.dataset.src;
    });
    $$("button", dots).forEach((d, j) => {
      d.classList.remove("is-active");
      if (j === cur) { void d.offsetWidth; d.classList.add("is-active"); }
      d.setAttribute("aria-pressed", String(j === cur));
    });
  };
  slides.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Fotka ${i + 1}`);
    b.addEventListener("click", () => { show(i); restart(); });
    dots.append(b);
  });
  const restart = () => {
    clearInterval(timer);
    if (lite || slides.length < 2) return;
    timer = setInterval(() => { if (!document.hidden) show(cur + 1); }, 6000);
  };
  show(0);
  restart();

  if (motion() && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let raf = 0;
    hero.addEventListener("pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        hero.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
    });
  }
}

/* --- Pick cursor (desktop only) ------------------------------------------ */
function initPick() {
  if (!motion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const pick = document.createElement("div");
  pick.className = "pick";
  pick.setAttribute("aria-hidden", "true");
  pick.innerHTML = '<svg viewBox="0 0 22 26"><path d="M11 25C6 20 1 13 1 7.5 1 3.5 5 1 11 1s10 2.5 10 6.5C21 13 16 20 11 25z" fill="#ff3b1f" stroke="#150a07" stroke-width="1.2"/><text x="11" y="12" text-anchor="middle" font-family="Anton,Impact" font-size="6.5" fill="#150a07">S</text></svg>';
  document.body.append(pick);
  let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
  const loop = () => {
    x += (tx - x) * 0.3; y += (ty - y) * 0.3;
    pick.style.setProperty("--cx", `${x + 10}px`);
    pick.style.setProperty("--cy", `${y + 12}px`);
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
  };
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX; ty = e.clientY;
    root.classList.add("has-pick");
    const hot = e.target.closest("a, button, [role=slider], .flip, .vinyl__disc");
    pick.style.setProperty("--cs", hot ? 1.35 : 1);
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener("pointerleave", () => root.classList.remove("has-pick"));
}

/* --- Reveal + marquee pausing -------------------------------------------- */
function initObservers() {
  if (!("IntersectionObserver" in window)) { root.classList.remove("motion"); return; }
  if (motion()) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 4) * 80}ms`;
      io.observe(el);
    });
  }
  const mq = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("is-paused", !e.isIntersecting)));
  $$(".marquee").forEach((m) => mq.observe(m));
}

/* --- Gigs ----------------------------------------------------------------- */
function parseGig(g) {
  const [y, m, d] = g.date.split("-").map(Number);
  const end = !m ? new Date(y, 11, 31, 23, 59) : !d ? new Date(y, m, 0, 23, 59) : new Date(y, m - 1, d, 23, 59);
  let start = null;
  if (d) { const [hh, mm] = (g.time || "20:00").split(":").map(Number); start = new Date(y, m - 1, d, hh, mm); }
  return { ...g, y, m, d, end, start };
}
const gigsSorted = () => GIGS.map(parseGig).sort((a, b) => a.end - b.end);
const splitGigs = () => {
  const now = new Date();
  const all = gigsSorted();
  return { upcoming: all.filter((g) => g.end >= now), past: all.filter((g) => g.end < now).reverse() };
};

function showRow(g, past) {
  const li = document.createElement("li");
  li.className = "show reveal";
  const day = g.d ? String(g.d) : g.m ? MONTHS[g.m - 1].toUpperCase() : "—";
  li.innerHTML = `
    <div class="show__date"><span class="show__day"></span><span class="show__mon"></span><span class="show__year"></span></div>
    <div class="show__venue"><span></span></div>`;
  $(".show__day", li).textContent = day;
  $(".show__mon", li).textContent = g.d ? MONTHS_FULL[g.m - 1] : g.m ? "" : "";
  $(".show__year", li).textContent = g.y;
  $(".show__venue", li).prepend(g.venue);
  $(".show__venue span", li).textContent = [g.city, g.note].filter(Boolean).join(" · ");
  const btn = document.createElement(g.link && !past ? "a" : "span");
  btn.className = "show__btn" + (past ? " show__btn--done" : "");
  btn.textContent = past ? "Odehráno" : g.link ? "Vstupenky ↗" : "Vstup na místě";
  if (g.link && !past) Object.assign(btn, { href: g.link, target: "_blank", rel: "noopener" });
  li.append(btn);
  return li;
}

function renderTour() {
  const { upcoming, past } = splitGigs();
  $$("[data-tour]").forEach((list) => {
    const mode = list.dataset.tour; // "upcoming" | "past" | "mixed:N"
    let items = [];
    if (mode === "upcoming") items = upcoming.map((g) => [g, false]);
    else if (mode === "past") items = past.map((g) => [g, true]);
    else {
      const n = Number(mode.split(":")[1]) || 3;
      items = [...upcoming.map((g) => [g, false]), ...past.map((g) => [g, true])].slice(0, n);
    }
    items.forEach(([g, p]) => list.append(showRow(g, p)));
    list.hidden = !items.length;
  });
  const empty = $("#tour-empty");
  if (empty) empty.hidden = upcoming.length > 0;

  // ticket for next show (or the latest one)
  const ticket = $("[data-ticket]");
  if (ticket) {
    const g = upcoming[0] || past[0];
    if (g) {
      $(".ticket__label", ticket).textContent = upcoming[0] ? "Další koncert" : "Naposledy jsme hráli";
      $(".ticket__venue", ticket).textContent = g.venue;
      $(".ticket__meta", ticket).textContent = [g.city, g.note].filter(Boolean).join(" · ");
      $(".ticket__day", ticket).textContent = g.d || (g.m ? MONTHS[g.m - 1] : g.y);
      $(".ticket__month", ticket).textContent = g.d ? `${MONTHS_FULL[g.m - 1]} ${g.y}` : String(g.y);
      ticket.hidden = false;
    }
  }
  const chip = $("[data-next-chip]");
  if (chip) {
    const g = upcoming[0] || past[0];
    if (g) {
      $("b", chip).textContent = g.d ? `${g.d}. ${g.m}.` : g.y;
      $("small", chip).textContent = upcoming[0] ? "Další koncert" : "Naposledy";
      $("[data-v]", chip).textContent = g.venue;
      chip.hidden = false;
    }
  }
  const next = upcoming.find((g) => g.start);
  const box = $("#countdown");
  if (next && box) {
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
          <span class="video__tag" aria-hidden="true">LIVE</span>
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

/* --- Polaroid wall + lightbox -------------------------------------------- */
function wallItems() {
  const frames = [];
  const labels = ["", " · záběr 1", " · záběr 2", " · záběr 3"];
  VIDEOS.forEach((v) => {
    ["hqdefault", "hq1", "hq2", "hq3"].forEach((k, i) => {
      frames.push({ src: yt(v.id, k), full: yt(v.id, i === 0 ? "maxresdefault" : k), caption: `${v.title}${labels[i]}`, long: `${v.title} · ${v.meta}` });
    });
  });
  return [...PHOTOS.map((p) => ({ ...p, full: p.src, long: p.caption })), ...frames];
}

function renderWall() {
  const wall = $("[data-wall]");
  if (!wall) return;
  const items = wallItems().slice(0, Number(wall.dataset.wall) || Infinity);
  items.forEach((it, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "polaroid reveal";
    b.dataset.removable = "";
    b.style.setProperty("--r", `${((i * 37) % 9) - 4}deg`);
    b.setAttribute("aria-label", `Zvětšit fotku: ${it.long || it.caption || "Sarah"}`);
    const img = document.createElement("img");
    Object.assign(img, { alt: "", loading: "lazy", decoding: "async", width: 480, height: 360 });
    img.src = it.src;
    smartImage(img);
    const cap = document.createElement("span");
    cap.textContent = it.caption || "Sarah";
    b.append(img, cap);
    b._item = it;
    b.addEventListener("click", () => open(b));
    wall.append(b);
  });

  const lb = $("#lightbox");
  if (!lb) return;
  const big = $("img", lb), cap = $(".lightbox__cap", lb);
  let cur = 0, lastFocus = null;
  const list = () => $$(".polaroid", wall);
  function show(i) {
    const l = list();
    cur = (i + l.length) % l.length;
    const btn = l[cur], it = btn._item, thumb = $("img", btn);
    big.src = thumb.src;
    big.alt = it.long || "";
    cap.textContent = it.long || "";
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

/* --- Flip cards ----------------------------------------------------------- */
function initFlips() {
  $$(".flip").forEach((card) => {
    const toggle = () => {
      const on = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(on));
    };
    card.addEventListener("click", (e) => { if (!e.target.closest("a")) toggle(); });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });
}

/* --- Vinyl: drag to scratch, tracks spin it ------------------------------ */
function initVinyl() {
  const vinyl = $("[data-vinyl]");
  if (!vinyl) return;
  const disc = $(".vinyl__disc", vinyl);
  const label = $("[data-vinyl-track]", vinyl);
  const defaultLabel = label.textContent;
  let angle = 0, speed = 0, spinning = false, raf = 0, dragging = false, last = 0;
  const center = () => { const r = disc.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const apply = () => disc.style.setProperty("--spin", `${angle}deg`);
  const loop = () => {
    if (!dragging) {
      const target = spinning ? 3.3 : 0; // ~33⅓ rpm feel
      speed += (target - speed) * 0.04;
      angle += speed;
      apply();
    }
    raf = spinning || Math.abs(speed) > 0.02 || dragging ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  disc.addEventListener("pointerdown", (e) => {
    dragging = true; vinyl.classList.add("is-out", "is-playing");
    const [cx, cy] = center();
    last = Math.atan2(e.clientY - cy, e.clientX - cx);
    disc.setPointerCapture(e.pointerId);
    kick();
  });
  disc.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const [cx, cy] = center();
    const a = Math.atan2(e.clientY - cy, e.clientX - cx);
    let d = (a - last) * (180 / Math.PI);
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    angle += d; speed = d; last = a;
    apply();
  });
  const up = () => { dragging = false; kick(); };
  disc.addEventListener("pointerup", up);
  disc.addEventListener("pointercancel", up);

  const buttons = $$("[data-track]");
  buttons.forEach((b) => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") !== "true";
    buttons.forEach((x) => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", String(on));
    spinning = on;
    vinyl.classList.toggle("is-out", on);
    vinyl.classList.toggle("is-playing", on);
    label.textContent = on ? b.textContent : defaultLabel;
    if (on && !lite) toast(`▶ ${b.textContent} – celou píseň najdeš na Bandzone`);
    kick();
  }));
}

/* --- Year scroller -------------------------------------------------------- */
function initYears() {
  const track = $(".years");
  if (!track) return;
  const bar = $(".years__bar span");
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    bar?.style.setProperty("--p", max > 0 ? Math.max(0.08, track.scrollLeft / max) : 1);
  };
  track.addEventListener("scroll", update, { passive: true });
  update();
  const step = () => (track.querySelector(".year")?.offsetWidth || 300) + 18;
  $("[data-years-prev]")?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  $("[data-years-next]")?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  let down = false, x0 = 0, s0 = 0, moved = false;
  track.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; x0 = e.clientX; s0 = track.scrollLeft; });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    if (Math.abs(e.clientX - x0) > 4) { moved = true; track.classList.add("is-dragging"); }
    track.scrollLeft = s0 - (e.clientX - x0);
  });
  window.addEventListener("pointerup", () => { down = false; track.classList.remove("is-dragging"); });
}

/* --- Lighters (booking CTA) ---------------------------------------------- */
function initLighters() {
  const btn = $("[data-lighter]");
  if (!btn) return;
  const crowd = $(".crowd");
  const out = $(".lighter-count");
  let total = Number(store.get("sarah-lighters") || 0);
  const render = () => { out.textContent = total ? `Zvednutých zapalovačů: ${total}` : ""; };
  const add = (n = 1) => {
    for (let i = 0; i < n; i++) {
      if (crowd.children.length > (lite ? 12 : 40)) crowd.firstElementChild.remove();
      const l = document.createElement("span");
      l.className = "lighter";
      l.style.left = `${4 + Math.random() * 92}%`;
      l.style.bottom = `${6 + Math.random() * 30}%`;
      l.style.setProperty("--d", `${-Math.random() * 2}s`);
      crowd.append(l);
    }
  };
  add(Math.min(total, 8));
  render();
  btn.addEventListener("click", () => {
    total++; store.set("sarah-lighters", total); add(1); render();
    if (total % 10 === 0) { toast(`🔥 ${total} zapalovačů! Přídavek!`); pyro(8); }
  });
}

/* --- Easter egg: type "sarah" ------------------------------------------- */
function initEgg() {
  let buf = "";
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, [role=slider]")) return;
    buf = (buf + e.key.toLowerCase()).slice(-5);
    if (buf === "sarah") {
      buf = "";
      root.classList.add("is-eleven");
      setTimeout(() => root.classList.remove("is-eleven"), 1100);
      pyro(18);
      toast("🤘 SARAH! SARAH! SARAH!");
      playRiff();
    }
  });
}

/* --- Small bits ----------------------------------------------------------- */
function initMisc() {
  const year = new Date().getFullYear();
  $$("[data-year]").forEach((el) => { el.textContent = year; });
  $$("[data-since]").forEach((el) => { el.textContent = year - Number(el.dataset.since); });
  $$("img[data-chain]").forEach(smartImage);
  $$("[data-riff]").forEach((b) => b.addEventListener("click", playRiff));
}

initNav();
initMisc();
initHero();
initAmp();
renderTour();
renderVideos();
renderWall();
initFlips();
initVinyl();
initYears();
initLighters();
initEgg();
initPick();
initObservers();
