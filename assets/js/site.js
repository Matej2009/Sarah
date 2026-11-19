/* SARAH — page behaviour: menu, concerts, videos, copy button, chat.
   The band's data (concerts, members, phone) comes from data.js, made by tools/build.py. */
(() => {
  "use strict";

  const D = window.SARAH || { gigs: [], members: [], album: { tracks: [] } };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Menu on phones ------------------------------------------------------------------- */
  function initMenu() {
    const toggle = $(".header__toggle");
    const nav = $(".header__nav");
    if (!toggle || !nav) return;
    const set = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    };
    toggle.addEventListener("click", () => set(!nav.classList.contains("is-open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    document.addEventListener("click", (e) => { if (!e.target.closest(".header")) set(false); });
  }

  /* --- Concerts: the page is built with today's list; a concert that has passed since
         moves to "Odehráno" by itself ------------------------------------------------------ */
  const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
  const ended = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d) < today(); };

  function initGigs() {
    const box = $("[data-gigs]");
    if (box) {
      const upcoming = $("[data-upcoming]", box), past = $("[data-past]", box);
      $$(".gig", upcoming).filter((li) => ended(li.dataset.end)).reverse().forEach((li) => past.prepend(li));
      $("[data-empty]", box).hidden = upcoming.children.length > 0;
    }
    // the "next concert" box on the home page
    const next = $("[data-next]");
    if (next && next.dataset.end && ended(next.dataset.end)) {
      $(".quick__text > span", next).innerHTML = "<b>Termíny domlouváme</b><span>Sledujte nás na Facebooku</span>";
    }
  }

  /* --- Videos: a still from YouTube; the player loads only when you press play ----------- */
  function initVideos() {
    $$("[data-video]").forEach((btn) => {
      const img = $("img", btn);
      // the sharper still, when YouTube has one (a missing size comes back as a 120 × 90 placeholder)
      if (img?.dataset.hd) {
        const hd = new Image();
        hd.onload = () => { if (hd.naturalWidth > 200) img.src = hd.src; };
        hd.src = img.dataset.hd;
      }
      btn.addEventListener("click", () => {
        const id = btn.dataset.video;
        const frame = document.createElement("iframe");
        frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
        frame.title = btn.getAttribute("aria-label").replace("Přehrát video: ", "");
        frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        frame.allowFullscreen = true;
        const holder = document.createElement("div");
        holder.className = "video__frame";
        holder.append(frame);
        btn.replaceWith(holder);
      }, { once: true });
    });
  }

  /* --- "Kopírovat" next to the press text ------------------------------------------------- */
  function initCopy() {
    $$("[data-copy]").forEach((btn) => {
      const label = $("span", btn);
      btn.addEventListener("click", async () => {
        const text = $(btn.dataset.copy)?.textContent.trim() || "";
        try {
          await navigator.clipboard.writeText(text);
          label.textContent = "Zkopírováno";
        } catch (err) {
          const range = document.createRange();
          range.selectNodeContents($(btn.dataset.copy));
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          label.textContent = "Označeno, stiskněte Ctrl+C";
        }
        setTimeout(() => { label.textContent = "Kopírovat"; }, 2500);
      });
    });
  }

  /* --- Chat: answers simple questions about the band ---------------------------------------- */
  // Without a server it answers from the band's own data (data.js) and never makes anything up;
  // with chatApi set (see chat-worker/) the answers come from Claude, falling back to these.
  const MONTHS = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
  const MONTHS_OF = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
  const telLink = () => `<a href="${D.tel}">${D.phone}</a>`;
  const fbLink = (label = "Facebooku") => `<a href="${D.facebook}" target="_blank" rel="noopener">${label}</a>`;
  const memberLink = (m) => `<a href="${m.page}">${m.name}</a>`;
  const fold = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9/]+/g, " ").trim();
  // a keyword with a space must appear as written; a single word matches the start of any word
  // (so Czech endings still match: Franc, Francem, Francovi), except words that only look alike
  const LOOKALIKE = /^(francie|francii|francouz|petrol|petrz|basen|bazen|kytk)/;
  const hit = (text, w) => (w.includes(" ") ? ` ${text} `.includes(` ${w}`) : text.split(" ").some((t) => t.startsWith(w) && !LOOKALIKE.test(t)));

  function gigList() {
    return (D.gigs || []).map((g) => {
      const [y, m, d] = g.date.split("-").map(Number);
      const end = !m ? new Date(y, 11, 31) : !d ? new Date(y, m, 0) : new Date(y, m - 1, d);
      const when = d ? `${d}. ${MONTHS_OF[m - 1]} ${y}` : m ? `${MONTHS[m - 1]} ${y}` : String(y);
      return { ...g, end, when };
    });
  }
  function gigsAnswer() {
    const all = gigList();
    const upcoming = all.filter((g) => g.end >= today()).sort((a, b) => a.end - b.end);
    const past = all.filter((g) => g.end < today()).sort((a, b) => b.end - a.end);
    if (upcoming.length) {
      const g = upcoming[0];
      const more = upcoming.length > 1 ? ` Potom ještě ${upcoming.length - 1}× další.` : "";
      return [`Nejbližší koncert: <b>${g.when}</b>, ${esc(g.venue)}${g.city ? ` (${esc(g.city)})` : ""}.${more}`,
        'Všechny termíny jsou na stránce <a href="koncerty.html">Koncerty</a>.'];
    }
    const last = past[0];
    return [`Nové termíny právě domlouváme. Jakmile budou, najdete je na stránce <a href="koncerty.html">Koncerty</a> a na ${fbLink()}.`,
      ...(last ? [`Naposledy jsme hráli ${last.when}: ${esc(last.venue)}.`] : [])];
  }

  const INTENTS = [
    { words: ["objedn", "booking", "pozvat", "pozvani", "pozvem", "zahrat na", "zahrali na", "zahrajete na", "svatb", "oslav", "narozenin", "firemn", "vecir", "ples", "zabav", "rezerv", "domluv", "cena", "cenu", "ceny", "kolik stoj", "kolik by", "kolik chcete", "honorar", "zaplat", "najmout", "u nas"],
      answer: () => [`Rádi přijedeme! Zavolejte na ${telLink()} a domluvíme termín, program i cenu.`,
        'Hrajeme v klubech, na festivalech, letních parketech i na soukromých a firemních akcích. Víc na stránce <a href="kontakt.html">Booking a kontakt</a>.'] },
    { words: ["kontakt", "telefon", "cislo", "zavolat", "zavolam", "volat", "email", "mail", "napsat", "napis", "sms", "spojit", "ozvat"],
      answer: () => [`Nejrychlejší je zavolat: ${telLink()} (booking a domluva koncertů).`, `Nebo nám napište zprávu na ${fbLink("Facebook")}.`] },
    { words: ["koncert", "hrajete", "zahrajete", "vystoup", "termin", "kdy hraj", "kde hraj", "kdy budete", "kde budete", "akce", "program", "vstupen", "listk", "tour", "turne", "nejblizsi", "pristi", "kdy vas", "kde vas"],
      answer: gigsAnswer },
    { words: D.members.flatMap((m) => m.words), answer: (text) => {
      const m = D.members.find((x) => x.words.some((w) => hit(text, w)));
      return [`${memberLink(m)} ${m.does}.`, "Víc o něm najdete na jeho stránce, stačí kliknout na jméno."];
    } },
    { words: ["clen", "sestav", "kdo hraje", "kdo je v", "kdo jste", "kdo tam", "muzikant", "kapelnik"],
      answer: () => [`Hrajeme ve čtyřech: ${D.members.map((m) => `${memberLink(m)} (${m.instrument})`).join(", ")}.`,
        'Všechny najdete na stránce <a href="kapela.html">Kapela</a>.'] },
    { words: ["zalozen", "zalozil", "vznik", "histori", "jak dlouho", "od kdy", "kolik let", "1992", "pribeh", "zacat", "zacal"],
      answer: () => ["Sarah založil zpěvák Zdeněk Troup na přelomu let 1992 a 1993 v Českých Budějovicích.",
        'V roce 2012 vyšlo album Sarah, v roce 2014 si kapela dala pauzu a v roce 2023 se vrátila na pódia. Celý příběh je na stránce <a href="kapela.html">Kapela</a>.'] },
    { words: ["album", "alba", "desk", "cd", "nahravk", "pisn", "pisnick", "skladb", "poslech", "spotify", "bandzone", "youtube", "video", "klip"],
      answer: () => [`Naše album se jmenuje <b>Sarah</b> (${D.album.year}) a má ${D.album.tracks.length === 11 ? "jedenáct" : D.album.tracks.length} vlastních písní, třeba ${esc(D.album.tracks[0])} nebo ${esc(D.album.tracks[3])}.`,
        `Poslechnout si ho můžete na <a href="${D.bandzone}" target="_blank" rel="noopener">Bandzone</a>, záznamy z koncertů jsou na stránce <a href="videa.html">Videa</a>.`] },
    { words: ["styl", "zanr", "jakou hudb", "jakou muzik", "co hrajete", "cover", "ac dc", "ac/dc", "acdc", "metallic", "accept", "scorpions", "repertoar", "rock", "mrazik"],
      answer: () => ["Hrajeme hard rock: hlavně vlastní písně, přímočaré, melodické a nahlas.",
        'K nim přidáváme covery AC/DC, Metallicy, Accept a Scorpions, a na konci klidně Mrazíka. Víc na stránce <a href="hudba.html">Hudba</a>.'] },
    { words: ["fotk", "foto", "obrazk", "galeri", "logo", "plakat", "media", "novinar"],
      answer: () => ['Logo, fotky kapely a text o nás jsou ke stažení na stránce <a href="kontakt.html#pro-poradatele">Pro pořadatele a média</a>.',
        `Máte fotky z našeho koncertu? Pošlete nám je přes ${fbLink("Facebook")}.`] },
    { words: ["odkud", "budejovic", "z jakeho mesta", "jake mesto", "kde jste z", "jih cech", "jihocesk"],
      answer: () => ["Jsme z Českých Budějovic a hrajeme hlavně po jižních Čechách."] },
    { words: ["ahoj", "cau", "cus", "nazdar", "zdravim", "dobry den", "dobry vecer", "hello", "hi", "hey"],
      answer: () => ["Dobrý den! Zeptejte se třeba, kdy hrajeme, jak nás pozvat na akci nebo kdo je v kapele."] },
    { words: ["dik", "dekuj", "super", "parad", "skvel", "fajn", "thanks", "nashled"],
      answer: () => [`Rádo se stalo! Kdybyste nás chtěli na akci, volejte ${telLink()}.`] },
  ];
  const FALLBACK = () => [`Na tohle vám spolehlivě neodpovím. Zeptejte se přímo kapely: zavolejte na ${telLink()} nebo napište na ${fbLink("Facebook")}.`];
  const CHIPS = ["Kdy hrajete?", "Jak vás pozvat na akci?", "Kdo je v kapele?", "Kde si vás poslechnout?"];

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
      el.className = `msg msg--${who}`;
      el.innerHTML = html;
      log.append(el);
      log.scrollTop = log.scrollHeight;
      return el;
    };
    const render = (m) => bubble(m.who, m.who === "me" ? `<p>${esc(m.text)}</p>` : m.html);
    const greet = () => {
      if (history.length) { history.forEach(render); return; }
      const html = "<p>Dobrý den, jsem asistent kapely Sarah. Poradím s koncerty, kapelou a hudbou, i s tím, jak nás pozvat na akci.</p>";
      history.push({ who: "bot", html, text: "Dobrý den, jsem asistent kapely Sarah." });
      render(history[0]);
      save();
    };
    chips.replaceChildren(...CHIPS.map((c) => {
      const b = Object.assign(document.createElement("button"), { type: "button", textContent: c });
      b.addEventListener("click", () => ask(c));
      return b;
    }));

    async function remoteAnswer(question) {
      const messages = history.slice(-8).map((m) => ({ role: m.who === "me" ? "user" : "assistant", content: m.text }));
      messages.push({ role: "user", content: question });
      while (messages.length && messages[0].role !== "user") messages.shift();
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 20000);
      try {
        const res = await fetch(D.chatApi, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }), signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.answer) throw new Error("empty answer");
        // the server's text is shown as text; only the booking number becomes a link
        return data.answer.split(/\n{2,}/).map((p) => esc(p).replace(D.phone, telLink()));
      } finally { clearTimeout(t); }
    }

    async function ask(question) {
      question = question.trim().slice(0, 300);
      if (!question) return;
      const me = { who: "me", text: question };
      render(me);
      const typing = bubble("bot", "<i></i><i></i><i></i>");
      typing.classList.add("msg--typing");
      typing.setAttribute("aria-label", "Píšu odpověď");
      let paras;
      if (D.chatApi) {
        try { paras = await remoteAnswer(question); } catch (e) { paras = localAnswer(question); }
      } else {
        await new Promise((r) => setTimeout(r, reduced ? 0 : 500));
        paras = localAnswer(question);
      }
      const html = paras.map((p) => `<p>${p}</p>`).join("");
      typing.classList.remove("msg--typing");
      typing.removeAttribute("aria-label");
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
        if (!log.children.length) greet();
        if (window.matchMedia("(hover: hover)").matches) input.focus();
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

  initMenu();
  initGigs();
  initVideos();
  initCopy();
  initChat();
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
