# Chat s Claude (volitelné)

Chat na webu funguje i bez tohohle: odpovídá z údajů ve `script.js` (koncerty, sestava,
telefon, album). Když chcete, aby odpovídala umělá inteligence (Claude od Anthropicu),
nasaďte tenhle malý server na Cloudflare Workers:

1. Účet na https://console.anthropic.com a v něm API klíč (platí se podle použití).
2. Účet na https://dash.cloudflare.com (stačí zdarma).
3. V této složce:
   ```
   npm install
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY   # vložte API klíč
   npx wrangler deploy
   ```
4. Wrangler vypíše adresu, např. `https://sarah-chat.<něco>.workers.dev`.
   Vložte ji do `script.js` do `const CHAT_API = "";` a nahrajte web.

Když server nepůjde (výpadek, došlý kredit), chat sám přepne zpátky na odpovědi ze `script.js`.

- Model: `claude-opus-5-5` s nízkým úsilím (`effort: "low"`), odpovědi do tří vět.
  Jeden dotaz stojí zhruba desetinu až několik desetin koruny. Pro levnější provoz lze
  v `worker.js` změnit model na `claude-haiku-5-5`.
- Když bezpečnostní filtr dotaz odmítne, API ho samo zkusí na záložním modelu
  (`fallbacks: "default"`); když ani to nejde, chat odkáže na telefon.
- Údaje, ze kterých Claude odpovídá, jsou v `worker.js` v `SYSTEM`. Když se něco změní
  (sestava, telefon), upravte je tam i ve `script.js`.
- Server přijímá dotazy jen z sarahcb.cz (`ALLOWED_ORIGINS`).
