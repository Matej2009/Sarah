/* ==========================================================================
   SARAH — sdílený skript. Nahoře data, která se dají snadno upravovat.
   ========================================================================== */

/* KONCERTY — date: "RRRR-MM-DD" (nebo "RRRR-MM" / "RRRR"), time: "20:00", link: odkaz */
const GIGS = [
  { date: "2026-09-26", venue: "Letní parket Jílovice", city: "Jílovice u Č. Budějovic", note: "s kapelou Blamage" },
  { date: "2023-09-16", venue: "Jílovice", city: "Jílovice u Č. Budějovic", note: "Původní sestava, 30 let kapely" },
  { date: "2023-04", venue: "Seven Fest", city: "KD Ševětín", note: "Oslava 30. narozenin kapely" },
];

/* VIDEA z YouTube (id = část adresy za "watch?v=") */
const VIDEOS = [
  { id: "YIDTwOcJh58", title: "Křídla", meta: "Jílovice, 16. 9. 2023 · původní sestava" },
  { id: "8QpXZPaKw-g", title: "Vlaky", meta: "Původní sestava po třiceti letech · 2023" },
  { id: "Vr9Ju-DKftQ", title: "Sarah naživo", meta: "Hard rock / České Budějovice" },
];

/* VLASTNÍ FOTKY – nahrajte do assets/photos/ a přidejte sem, např.
   { src: "assets/photos/koncert-1.jpg", caption: "Seven Fest 2023" } */
const PHOTOS = [];

/* -------------------------------------------------------------------------- */
const MON = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];
const MONF = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
const root = document.documentElement;
const motion = root.classList.contains("motion");
const lite = root.classList.contains("lite");
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const yt = (id, k) => `https://i.ytimg.com/vi/${id}/${k}.jpg`;

// A missing YouTube size comes back as a 120×90 grey placeholder: fall back down the chain.
function smartImage(img) {
  const chain = (img.dataset.chain || "").split(",").filter(Boolean);
  const next = () => { const s = chain.shift(); if (s) img.src = s; else img.closest("[data-drop]")?.remove(); };
  img.addEventListener("load", () => { if (img.naturalWidth <= 120) next(); });
  img.addEventListener("error", next);
}

function htImg(id, kind, extra = "") {
  const fallback = kind === "maxresdefault" ? `${yt(id, "sddefault")},${yt(id, "hqdefault")}` : "";
  return `<img src="${yt(id, kind)}" data-chain="${fallback}" alt="" loading="lazy" decoding="async" width="480" height="360" ${extra}>`;
}

let toastT;
function toast(msg) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("is-on"));
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("is-on"), 2600);
}

/* --- Header ---------------------------------------------------------------- */
function initHeader() {
  const btn = $(".burger"), nav = $("#nav");
  const set = (o) => {
    btn.setAttribute("aria-expanded", String(o));
    btn.querySelector("span").textContent = o ? "Zavřít" : "Menu";
    nav.classList.toggle("is-open", o);
    root.classList.toggle("menu-open", o);
  };
  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  const onScroll = () => root.classList.toggle("scrolled", window.scrollY > 34);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* --- Gigs ------------------------------------------------------------------ */
function parse(g) {
  const [y, m, d] = g.date.split("-").map(Number);
  const end = !m ? new Date(y, 11, 31, 23, 59) : !d ? new Date(y, m, 0, 23, 59) : new Date(y, m - 1, d, 23, 59);
  let start = null;
  if (d) { const [hh, mm] = (g.time || "20:00").split(":").map(Number); start = new Date(y, m - 1, d, hh, mm); }
  return { ...g, y, m, d, end, start };
}
function gigs() {
  const now = new Date();
  const all = GIGS.map(parse).sort((a, b) => a.end - b.end);
  return { up: all.filter((g) => g.end >= now), past: all.filter((g) => g.end < now).reverse() };
}
const dateBig = (g) => (g.d ? `${g.d}. ${g.m}.` : g.m ? MONF[g.m - 1] : String(g.y));
const dateSmall = (g) => (g.d ? `${MONF[g.m - 1]} ${g.y}${g.time ? " · " + g.time : ""}` : String(g.y));

function showRow(g, past) {
  const li = document.createElement("li");
  li.className = "show rv" + (past ? " show--past" : "");
  li.innerHTML = `<div class="show__date"></div><div class="show__venue"><span class="muted"></span></div>`;
  const d = $(".show__date", li);
  d.textContent = dateBig(g);
  const s = document.createElement("small"); s.textContent = dateSmall(g); d.append(s);
  $(".show__venue", li).prepend(g.venue);
  $(".show__venue span", li).textContent = [g.city, g.note].filter(Boolean).join(" · ");
  const tag = document.createElement(g.link && !past ? "a" : "span");
  tag.className = "show__tag" + (past ? " show__tag--past" : "");
  tag.textContent = past ? "Odehráno" : g.link ? "Vstupenky ↗" : "Vstup na místě";
  if (g.link && !past) Object.assign(tag, { href: g.link, target: "_blank", rel: "noopener" });
  li.append(tag);
  return li;
}

function renderGigs() {
  const { up, past } = gigs();
  $$("[data-shows]").forEach((ul) => {
    const mode = ul.dataset.shows;
    let items;
    if (mode === "up") items = up.map((g) => [g, false]);
    else if (mode === "past") items = past.map((g) => [g, true]);
    else items = [...up.map((g) => [g, false]), ...past.map((g) => [g, true])].slice(0, Number(mode) || 3);
    items.forEach(([g, p]) => ul.append(showRow(g, p)));
    ul.hidden = !items.length;
  });
  const empty = $("#no-shows");
  if (empty) empty.hidden = up.length > 0;

  const g = up[0] || past[0];
  $$("[data-poster]").forEach((p) => {
    if (!g) return;
    $(".poster__day", p).textContent = g.d || (g.m ? MON[g.m - 1] : g.y);
    $(".poster__mon", p).textContent = g.d ? `${MONF[g.m - 1]} ${g.y}` : String(g.y);
    $(".poster__label", p).textContent = up[0] ? "Další koncert" : "Naposledy jsme hráli";
    $(".poster__venue", p).textContent = g.venue;
    $(".poster__meta", p).textContent = [g.city, g.note].filter(Boolean).join(" · ");
    p.hidden = false;
    const cd = $(".countdown", p);
    if (cd && up[0]?.start) {
      cd.hidden = false;
      const el = Object.fromEntries($$("[data-cd]", cd).map((n) => [n.dataset.cd, n]));
      const tick = () => {
        const s = Math.max(0, Math.floor((up[0].start - new Date()) / 1000));
        el.d.textContent = Math.floor(s / 86400);
        el.h.textContent = Math.floor((s % 86400) / 3600);
        el.m.textContent = Math.floor((s % 3600) / 60);
      };
      tick(); setInterval(tick, 30000);
    }
  });

  // ticker text
  const t = $(".ticker__track");
  if (t) {
    const bits = [];
    if (up[0]) bits.push(`Další koncert: ${dateBig(up[0])} ${up[0].venue}`);
    else if (past[0]) bits.push(`Naposledy: ${dateBig(past[0])} ${past[0].venue}`, "Nové termíny brzy");
    bits.push("Hard rock z Českých Budějovic od roku 1992", "Album Sarah · 2012", "Booking: napiš nám");
    const set = bits.map((b) => `<span>${b}</span>`).join("");
    t.innerHTML = set + set + set + set;
  }
}

/* --- Hero slideshow ------------------------------------------------------- */
function initHero() {
  const box = $(".hero__photo .ht");
  if (!box) return;
  const imgs = $$("img", box);
  const dots = $(".hero__dots");
  const cap = $("[data-hero-cap]");
  let cur = 0, timer;
  const show = (i) => {
    cur = (i + imgs.length) % imgs.length;
    imgs.forEach((im, j) => {
      if (j === cur && !im.getAttribute("src")) im.src = im.dataset.src;
      im.classList.toggle("is-on", j === cur);
    });
    $$("button", dots).forEach((b, j) => b.setAttribute("aria-pressed", String(j === cur)));
    if (cap) cap.textContent = imgs[cur].dataset.cap || "";
  };
  imgs.forEach((im, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", `Fotka ${i + 1}`);
    b.addEventListener("click", () => { show(i); restart(); });
    dots.append(b);
  });
  const restart = () => { clearInterval(timer); if (!lite) timer = setInterval(() => { if (!document.hidden) show(cur + 1); }, 5500); };
  show(0); restart();
}

/* --- Draggable stickers --------------------------------------------------- */
function initStickers() {
  $$(".sticker").forEach((s) => {
    let sx = 0, sy = 0, dx = 0, dy = 0, drag = false, moved = false;
    s.addEventListener("pointerdown", (e) => {
      drag = true; moved = false; sx = e.clientX - dx; sy = e.clientY - dy;
      s.setPointerCapture(e.pointerId); s.style.animation = "none"; s.style.zIndex = 20;
    });
    s.addEventListener("pointermove", (e) => {
      if (!drag) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      s.style.setProperty("--dx", `${dx}px`); s.style.setProperty("--dy", `${dy}px`);
    });
    const up = () => { drag = false; };
    s.addEventListener("pointerup", up);
    s.addEventListener("pointercancel", up);
    s.addEventListener("click", (e) => {
      if (moved) { e.preventDefault(); return; }
      if (s.matches("[data-riff]")) playRiff();
    });
  });
}

/* --- Riff (Web Audio, synthesised) ---------------------------------------- */
let ac;
function playRiff() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = ac || new AC();
  if (ac.state === "suspended") ac.resume();
  const sh = ac.createWaveShaper();
  const k = 260, curve = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) { const x = (i * 2) / 2048 - 1; curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x)); }
  sh.curve = curve; sh.oversample = "4x";
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3600;
  const g = ac.createGain(); g.gain.value = 0.18;
  sh.connect(lp).connect(g).connect(ac.destination);
  const E = 82.41, G = 98, A = 110, D = 73.42;
  const riff = [[0, .11, E, 1], [.14, .11, E, 1], [.28, .11, E, 1], [.42, .28, G, 0], [.74, .28, A, 0], [1.06, .11, E, 1], [1.2, .11, E, 1], [1.34, .26, D, 0], [1.62, 1.3, E, 0]];
  const t0 = ac.currentTime + 0.02;
  riff.forEach(([at, dur, f, mute]) => {
    const env = ac.createGain(); env.connect(sh);
    const st = t0 + at;
    env.gain.setValueAtTime(0.0001, st);
    env.gain.exponentialRampToValueAtTime(1, st + 0.006);
    env.gain.exponentialRampToValueAtTime(mute ? 0.05 : 0.5, st + dur * (mute ? 0.6 : 0.5));
    env.gain.exponentialRampToValueAtTime(0.0001, st + dur + (mute ? 0.04 : 0.35));
    [1, 1.4983, 2].forEach((mul, j) => [-6, 6].forEach((det) => {
      const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f * mul; o.detune.value = det + j * 2;
      o.connect(env); o.start(st); o.stop(st + dur + 0.45);
    }));
  });
  root.classList.add("riffing");
  setTimeout(() => root.classList.remove("riffing"), 2600);
}

/* --- Vinyl ---------------------------------------------------------------- */
function initVinyl() {
  const v = $("[data-vinyl]");
  if (!v) return;
  const disc = $(".vinyl__disc", v), label = $("[data-vinyl-track]", v), def = label.textContent;
  let angle = 0, speed = 0, spin = false, drag = false, raf = 0, last = 0;
  const apply = () => disc.style.setProperty("--spin", `${angle}deg`);
  const loop = () => {
    if (!drag) { speed += ((spin ? 3.3 : 0) - speed) * 0.04; angle += speed; apply(); }
    raf = spin || drag || Math.abs(speed) > 0.02 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const ang = (e) => { const r = disc.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
  disc.addEventListener("pointerdown", (e) => { drag = true; v.classList.add("is-out", "is-playing"); last = ang(e); disc.setPointerCapture(e.pointerId); kick(); });
  disc.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const a = ang(e); let d = (a - last) * 180 / Math.PI;
    if (d > 180) d -= 360; if (d < -180) d += 360;
    angle += d; speed = d; last = a; apply();
  });
  const up = () => { drag = false; kick(); };
  disc.addEventListener("pointerup", up); disc.addEventListener("pointercancel", up);
  const btns = $$("[data-track]");
  btns.forEach((b) => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") !== "true";
    btns.forEach((x) => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", String(on));
    spin = on; v.classList.toggle("is-out", on); v.classList.toggle("is-playing", on);
    label.textContent = on ? b.textContent : def;
    kick();
  }));
}

/* --- Videos --------------------------------------------------------------- */
function renderVideos() {
  $$("[data-videos]").forEach((w) => {
    VIDEOS.slice(0, Number(w.dataset.videos) || VIDEOS.length).forEach((v) => {
      const f = document.createElement("figure");
      f.className = "video rv";
      f.innerHTML = `<button class="video__btn" type="button"><span class="ht">${htImg(v.id, "hqdefault")}</span><span class="video__play" aria-hidden="true"></span><span class="video__tag label" aria-hidden="true">Live</span></button><figcaption><b></b><span class="muted"></span></figcaption>`;
      $("button", f).setAttribute("aria-label", `Přehrát video: ${v.title}`);
      $("b", f).textContent = v.title;
      $("figcaption span", f).textContent = v.meta;
      $$("img", f).forEach(smartImage);
      $("button", f).addEventListener("click", (e) => {
        const i = document.createElement("iframe");
        i.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
        i.title = v.title; i.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"; i.allowFullscreen = true;
        e.currentTarget.replaceWith(i);
      });
      w.append(f);
    });
  });
}

/* --- Contact sheet + lightbox --------------------------------------------- */
function renderSheet() {
  const sheet = $("[data-sheet]");
  if (!sheet) return;
  const items = [...PHOTOS.map((p) => ({ src: p.src, full: p.src, cap: p.caption || "Sarah" }))];
  VIDEOS.forEach((v) => ["hqdefault", "hq1", "hq2", "hq3"].forEach((k, i) =>
    items.push({ src: yt(v.id, k), full: yt(v.id, i ? k : "maxresdefault"), cap: `${v.title} · ${v.meta}` })));
  items.slice(0, Number(sheet.dataset.sheet) || Infinity).forEach((it, n) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "shot"; b.dataset.drop = "";
    b.setAttribute("aria-label", `Zvětšit: ${it.cap}`);
    b.innerHTML = `<span class="ht"><img alt="" loading="lazy" decoding="async" width="480" height="360"></span><span class="shot__no">${String(n + 1).padStart(2, "0")}</span>`;
    const img = $("img", b); img.src = it.src; smartImage(img);
    b._it = it;
    b.addEventListener("click", () => open(b));
    sheet.append(b);
  });
  const lb = $("#lightbox");
  const big = $("img", lb), cap = $("figcaption", lb);
  let cur = 0, back = null;
  const list = () => $$(".shot", sheet);
  function show(i) {
    const l = list(); cur = (i + l.length) % l.length;
    const b = l[cur], it = b._it, th = $("img", b);
    big.src = th.src; cap.textContent = it.cap;
    if (it.full !== th.src) { const hi = new Image(); hi.onload = () => { if (hi.naturalWidth > th.naturalWidth && list()[cur] === b) big.src = it.full; }; hi.src = it.full; }
  }
  function open(b) { back = b; show(list().indexOf(b)); lb.classList.add("is-open"); root.classList.add("menu-open"); $(".lb-close", lb).focus(); }
  function close() { lb.classList.remove("is-open"); root.classList.remove("menu-open"); back?.focus(); }
  $(".lb-close", lb).addEventListener("click", close);
  $(".lb-prev", lb).addEventListener("click", () => show(cur - 1));
  $(".lb-next", lb).addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1);
  });
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
}

/* --- Reveal + pause off-screen marquees ----------------------------------- */
function initObservers() {
  if (!("IntersectionObserver" in window)) return;
  if (motion) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
    $$(".rv").forEach((el) => {
      const sib = [...el.parentElement.children].filter((c) => c.classList.contains("rv"));
      el.style.transitionDelay = `${Math.min(sib.indexOf(el), 4) * 70}ms`;
      io.observe(el);
    });
  }
  const mo = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-paused", !e.isIntersecting)));
  $$(".band, .ticker").forEach((m) => mo.observe(m));
}

/* --- Easter egg: type "sarah" ------------------------------------------- */
function initEgg() {
  let buf = "";
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    buf = (buf + e.key.toLowerCase()).slice(-5);
    if (buf === "sarah") { buf = ""; playRiff(); toast("🤘 SARAH! SARAH! SARAH!"); }
  });
}

/* --- Boot ----------------------------------------------------------------- */
$$("[data-year]").forEach((e) => { e.textContent = new Date().getFullYear(); });
$$("[data-since]").forEach((e) => { e.textContent = new Date().getFullYear() - Number(e.dataset.since); });
$$("img[data-chain]").forEach(smartImage);
$$("button[data-riff]:not(.sticker)").forEach((b) => b.addEventListener("click", playRiff));
initHeader();
renderGigs();
initHero();
initStickers();
initVinyl();
renderVideos();
renderSheet();
initEgg();
initObservers();
