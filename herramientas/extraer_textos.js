// Saca del chatbot todas las frases que Petrova puede decir, para pregrabarlas.
// Uso: node herramientas/extraer_textos.js chatbot-red-alumni.html > textos.json
const fs = require("fs");
const html = fs.readFileSync(process.argv[2] || "chatbot-red-alumni.html", "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const js = scripts[scripts.length - 1];

// Evalúa solo la parte de configuración, temas y motor (no necesita navegador)
const fin = js.search(/\/\* =+\s*\n\s*PERSONAJE/);
const motor = js.slice(0, fin);
const M = new Function("prefs", "guardarPrefs", motor +
  ";return {TEMAS,RELLENOS,NO_ENTENDI,SALUDO_INICIAL,SALUDOS_NOMBRE_SIN,textoParaVoz,claveAudio};")({vel: 1}, () => {});

const frases = new Set();
const DINAMICOS = new Set(["hora", "fecha"]); // cambian cada vez: se dicen con la voz en vivo
for (const t of M.TEMAS) {
  if (DINAMICOS.has(t.id)) continue;
  for (let v of t.r) {
    if (typeof v === "function") v = v();
    const base = v.replace(/\{n\}/g, "");
    frases.add(t.of ? base + " " + t.of.t : base);
  }
}
M.RELLENOS.forEach(f => frases.add(f));
const extra = " Si prefieres, una persona del equipo te puede ayudar aquí en el stand. 🙂";
M.NO_ENTENDI.forEach(f => { frases.add(f); frases.add(f + extra); });
frases.add(M.SALUDO_INICIAL);
M.SALUDOS_NOMBRE_SIN.forEach(f => frases.add(f));
// Frases sueltas del código (reacciones, errores del micrófono, sí/no…)
for (const m of js.matchAll(/"((?:[^"\\\n]|\\.){6,})"/g)) {
  const s = m[1];
  if (/[{<=;+()]|px|\\/.test(s)) continue;
  if (!/[.!?…]|\p{Extended_Pictographic}/u.test(s)) continue;
  if (!/[A-ZÁÉÍÓÚÑ¡¿]/.test(s)) continue;
  frases.add(s);
}

const salida = {}, out = [];
for (const f of frases) {
  const t = M.textoParaVoz(f);
  if (!t || !/\p{L}/u.test(t)) continue;
  const k = M.claveAudio(t);
  if (!salida[k]) { salida[k] = t; out.push({k, t}); }
}
process.stdout.write(JSON.stringify(out));
console.error(`Frases para grabar: ${out.length}`);
