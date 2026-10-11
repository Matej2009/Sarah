// Optional AI backend for the chat assistant on sarahcb.cz (a Cloudflare Worker).
// Without it the chat on the site answers from the band's own data in script.js.
// Setup is in README.md in this folder.
import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_ORIGINS = ["https://sarahcb.cz", "https://www.sarahcb.cz", "https://matej2009.github.io"];

const SYSTEM = `Jsi asistent na webu hardrockové kapely Sarah z Českých Budějovic (sarahcb.cz). Odpovídáš návštěvníkům webu česky, krátce (nejvýš tři věty), přátelsky a věcně, bez formátování v Markdownu.
Odpovídej jen podle údajů níže. Když něco nevíš (cenu koncertu, technické požadavky, termíny, které tu nejsou), nevymýšlej si a doporuč zavolat na booking 778 885 465 nebo napsat kapele na Facebook.

Údaje o kapele:
- Hard rock z Českých Budějovic, na pódiích od roku 1992. Kapelu založil zpěvák Zdeněk Troup na přelomu let 1992 a 1993.
- Sestava: Petr Hájek (kytara), Slávek Franc (bicí), Zdeněk Troup (zpěv), Josef Jakeš (baskytara).
- Hrají hlavně vlastní písně, k nim covery AC/DC, Metallicy, Accept a Scorpions. Na konci koncertu umí zahrát Mrazíka, klidně i v kostýmech.
- Album Sarah (2012) s jedenácti vlastními písněmi: Srdce-lhář, Nechápu, Jinej svět, Na křídlech černých vran, V prázdným těle, Tisíce lží, Kudy a kam, Sobě sám, Smíření, Kdo z nás to ví, Pohřebiště citů. Poslech na bandzone.cz/sarah. Českobudějovický deník napsal: „Nová deska rockových Sarah u publika zaboduje.“
- Historie: 2012 album, 2014 pauza (Zdeněk Troup odešel), 2023 návrat na pódia (v dubnu Seven Fest v Ševětíně, v září Jílovice).
- Slávek Franc hrál v letech 1996–2006 v budějovické kapele Seven. Zdeněk Troup zpíval v letech 2022–2024 i v kapele Kambodža. Josef Jakeš hrál na albu Sarah.
- Booking a domluva koncertů: telefon 778 885 465. Kapela hraje v klubech, na festivalech, letních parketech i na soukromých a firemních akcích.
- Aktuální termíny koncertů jsou na stránce Koncerty (koncerty.html). Další stránky: O nás (kapela.html), Hudba (hudba.html), Foto a video (media.html), Booking a kontakt (kontakt.html).`;

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
        max_tokens: 2048,
        // short, simple answers: low effort keeps them quick and cheap
        output_config: { effort: "low" },
        // if a request is declined by a safety classifier, the API retries it on a fallback model
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM,
        messages,
      });
      if (response.stop_reason === "refusal") return json({ answer: NOT_SURE }, 200, origin);
      const answer = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n\n").trim();
      return json({ answer: answer || NOT_SURE }, 200, origin);
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) return json({ error: "Too many questions right now" }, 429, origin);
      if (error instanceof Anthropic.AuthenticationError) return json({ error: "Server is not configured" }, 500, origin);
      if (error instanceof Anthropic.APIError) return json({ error: `Claude API error ${error.status}` }, 502, origin);
      return json({ error: "Unexpected error" }, 500, origin);
    }
  },
};
