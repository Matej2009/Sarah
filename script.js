/* ==========================================================================
   KONCERTY — sem přidávejte nové termíny.
   date:  "RRRR-MM-DD" (nebo jen "RRRR", když přesné datum neznáme)
   time:  nepovinné, např. "20:00"
   link:  nepovinné, odkaz na vstupenky / událost
   Budoucí termíny se automaticky zobrazí nahoře, odehrané se přesunou dolů.
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

const MONTHS = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];

function gigEndOfDay(gig) {
  if (/^\d{4}$/.test(gig.date)) return new Date(Number(gig.date), 11, 31, 23, 59);
  const [y, m, d] = gig.date.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59);
}

function renderGig(gig) {
  const li = document.createElement("li");
  li.className = "gig";

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
  const sorted = [...GIGS].sort((a, b) => gigEndOfDay(a) - gigEndOfDay(b));
  const upcoming = sorted.filter((g) => gigEndOfDay(g) >= now);
  const past = sorted.filter((g) => gigEndOfDay(g) < now).reverse();

  const upEl = document.getElementById("gigs-upcoming");
  const pastEl = document.getElementById("gigs-past");
  upcoming.forEach((g) => upEl.append(renderGig(g)));
  past.forEach((g) => pastEl.append(renderGig(g)));
  document.getElementById("gigs-empty").hidden = upcoming.length > 0;
  upEl.hidden = upcoming.length === 0;
}

function initNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    menu.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  // highlight the section currently in view
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

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`;
    io.observe(el);
  });
}

// Load YouTube only after a click: faster page, no tracking until play.
function initVideos() {
  document.querySelectorAll(".video__facade").forEach((btn) => {
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

function initYears() {
  const year = new Date().getFullYear();
  document.getElementById("year").textContent = year;
  document.querySelectorAll("[data-count-since]").forEach((el) => {
    el.textContent = year - Number(el.dataset.countSince);
  });
}

renderGigs();
initNav();
initReveal();
initVideos();
initYears();
