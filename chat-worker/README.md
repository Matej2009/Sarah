# Chat s Claude (volitelné)

Chat na webu funguje i bez tohohle: odpovídá z údajů kapely (`assets/js/data.js`, které
vyrábí `tools/build.py`): koncerty, sestava, telefon, album. Když chcete, aby odpovídala
umělá inteligence (Claude od Anthropicu), nasaďte tenhle malý server na Cloudflare Workers:

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
   Vložte ji v `tools/build.py` do `"chatApi": ""`, spusťte `python3 tools/build.py`
   a nahrajte web.

Když server nepůjde (výpadek, došlý kredit), chat sám přepne zpátky na vlastní odpovědi.

- Model: `claude-opus-5-5` s nízkým úsilím (`effort: "low"`), odpovědi do tří vět.
  Pro levnější provoz lze ve `worker.js` změnit model na `claude-haiku-5-5`.
- Když bezpečnostní filtr dotaz odmítne, API ho samo zkusí na záložním modelu
  (`fallbacks: "default"`); když ani to nejde, chat odkáže na telefon.
- Údaje, ze kterých Claude odpovídá, jsou ve `worker.js` v `SYSTEM`. Když se něco změní
  (sestava, telefon, koncerty), upravte je tam i v `tools/build.py`.
- Server přijímá dotazy jen z sarahcb.cz (`ALLOWED_ORIGINS`).
