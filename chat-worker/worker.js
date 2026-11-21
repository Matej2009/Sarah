// Optional AI backend for the chat assistant on sarahcb.cz (a Cloudflare Worker).
// Without it the chat on the site answers from the band's own data (assets/js/data.js).
// Setup is in README.md in this folder.
import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_ORIGINS = ["https://sarahcb.cz", "https://www.sarahcb.cz", "https://matej2009.github.io"];

const SYSTEM = `Jsi asistent na webu hardrockové kapely Sarah z Českých Budějovic (sarahcb.cz). Odpovídáš návštěvníkům webu česky, krátce (nejvýš tři věty), přátelsky a věcně, bez formátování v Markdownu.
Odpovídej jen podle údajů níže. Když něco nevíš (cenu koncertu, technické požadavky, termíny, které tu nejsou), nevymýšlej si a doporuč zavolat na booking 778 885 465 nebo napsat kapele na Facebook.

Údaje o kapele:
- Hard rock z Českých Budějovic. Kapelu Sarah založil zpěvák Zdeněk Troup na přelomu let 1992 a 1993. O kapele mluv prostě jako o Sarah a o jejích členech jako o sestavě; neříkej „nová Sarah“ ani „nová sestava“. Dřívější složení je „původní sestava“.
- Sestava: Petr Hájek (kytara), Slávek Franc (bicí), Zdeněk Troup (zpěv), Josef Jakeš (baskytara). O jednotlivých členech nic dalšího neuváděj: žádné životopisy, jiné kapely ani historii členů.
- Naposledy kapela hrála 26. září 2026 na Letním parketu v Jílovicích s kapelou Blamage. Repertoár současné sestavy tu není; neříkej, jaké písně hraje.
- Historie (původní sestava, 1992–2023, stránka historie.html): hrála hlavně vlastní písně a covery AC/DC, Metallicy, Accept a Scorpions, na konci koncertu Mrazíka i v kostýmech. V roce 2012 vydala album Sarah (sestava Zdeněk Troup, Martin Przeczek, Josef Jakeš, Rosťa Holčapek) s jedenácti písněmi: Srdce-lhář, Nechápu, Jinej svět, Na křídlech černých vran, V prázdným těle, Tisíce lží, Kudy a kam, Sobě sám, Smíření, Kdo z nás to ví, Pohřebiště citů. Poslech na bandzone.cz/sarah. Českobudějovický deník napsal: „Nová deska rockových Sarah u publika zaboduje.“ V roce 2014 pauza (Zdeněk Troup odešel), v roce 2023 se k třicetinám sešla původní sestava (v dubnu Seven Fest v Ševětíně, 16. září Jílovice). Videa z koncertů původní sestavy jsou na stránce Historie.
- Booking a domluva koncertů: telefon 778 885 465, má ho bubeník Miroslav „Slávek“ Franc. Kapela hraje v klubech, na festivalech, letních parketech i na soukromých a firemních akcích.
- Stránky webu: Koncerty (koncerty.html, aktuální termíny), Kapela (kapela.html, sestava), Historie (historie.html, původní sestava: album, písně, videa, recenze), Booking a kontakt (kontakt.html, kde jsou i logo, fotky a text o kapele ke stažení pro pořadatele a média).`;

const NOT_SURE = "Na tohle vám spolehlivě neodpovím. Zavolejte prosím kapele na 778 885 465.";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

const json = (body, status, origin) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) } });

// Only short user/assistant text turns are accepted, ending with the visitor's question.
function readMessages(body) {
  const list = Array.isArray(body?.messages) ? body.messages.slice(-12) : [];
  const messages = list
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return null;
  return messages;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== "POST") return json({ error: "Use POST" }, 405, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "Origin not allowed" }, 403, origin);

    let messages;
    try {
      messages = readMessages(await request.json());
    } catch (e) {
      messages = null;
    }
    if (!messages) return json({ error: "Send { messages: [...] } ending with a user message" }, 400, origin);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const response = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 16000,
        // short, simple answers: low effort keeps them quick and cheap
        output_config: { effort: "low" },
        // if a safety classifier declines a question, the API retries it on a fallback model
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM,
        messages,
      });
      if (response.stop_reason === "refusal") return json({ answer: NOT_SURE }, 200, origin);
      const answer = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n\n").trim();
      return json({ answer: answer || NOT_SURE }, 200, origin);
    } catch (error) {
      // the site falls back to its own answers whenever this returns an error
      if (error instanceof Anthropic.RateLimitError) return json({ error: "Too many questions right now" }, 429, origin);
      if (error instanceof Anthropic.AuthenticationError) return json({ error: "Server is not configured" }, 500, origin);
      if (error instanceof Anthropic.APIConnectionError) return json({ error: "Claude API not reachable" }, 502, origin);
      if (error instanceof Anthropic.APIError) return json({ error: `Claude API error ${error.status}` }, 502, origin);
      return json({ error: "Unexpected error" }, 500, origin);
    }
  },
};
