// Prueba la IA local con preguntas que Petrova no tiene preparadas y mide cuánto tarda.
// Uso: node herramientas/probar_ia.js qwen2.5:3b
const fs = require("fs");
const html = fs.readFileSync("chatbot-red-alumni.html", "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
const config = js.slice(js.indexOf("const CONFIG"), js.indexOf("};", js.indexOf("const CONFIG")) + 2);
const fnPrompt = js.slice(js.indexOf("function promptIA()"), js.indexOf("let iaEstado"));
const promptIA = new Function(config + fnPrompt + "; return promptIA;")();
const modelo = process.argv[2] || "qwen2.5:3b";
const preguntas = [
  "¿Qué carreras tiene Unifranz?",
  "¿Cuál es la capital de Francia?",
  "Me gusta dibujar, ¿a qué me podría dedicar?",
  "¿Cuándo es la próxima feria?",
  "Dame un consejo para mi primera entrevista en un banco",
  "¿Qué opinas de la política?",
];
(async () => {
  for (const q of preguntas) {
    const t0 = Date.now();
    const r = await fetch("http://localhost:11434/api/chat", { method: "POST", body: JSON.stringify({
      model: modelo, stream: false, keep_alive: "4h",
      options: { num_predict: 90, temperature: 0.6, num_ctx: 2048 },
      messages: [{ role: "system", content: promptIA() }, { role: "user", content: q }] }) });
    const j = await r.json();
    console.log(`\n[${((Date.now() - t0) / 1000).toFixed(1)} s] ${q}\n→ ${(j.message && j.message.content || j.error || "").trim()}`);
  }
})();
