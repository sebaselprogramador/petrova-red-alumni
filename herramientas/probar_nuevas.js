// Mide qué tan bien entiende Petrova preguntas NUEVAS (herramientas/prueba_nueva.txt), que no usa para aprender.
// Uso: node herramientas/probar_nuevas.js            (resumen)
//      node herramientas/probar_nuevas.js --fallas   (lista cada pregunta que falla)
const fs = require("fs");
require("./entrenar.js");   // usa siempre las preguntas de ejemplo más recientes
const html = fs.readFileSync("chatbot-red-alumni.html", "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
const motor = js.slice(0, js.search(/\/\* =+\s*\n\s*PERSONAJE/));
const M = new Function("prefs", "guardarPrefs", fs.readFileSync("entrenamiento.js", "utf8") + motor + ";return {procesar,mem,TEMAS};")({vel: 1}, () => {});
const ids = new Set(M.TEMAS.map(t => t.id));

const casos = fs.readFileSync("herramientas/prueba_nueva.txt", "utf8").split("\n")
  .filter(l => l.trim() && !l.startsWith("#")).map(l => { const [id, ...q] = l.split("|"); return {id: id.trim(), q: q.join("|").trim()}; });
const malos = casos.filter(c => c.id !== "(IA)" && !ids.has(c.id));
if (malos.length) console.log("⚠️ Temas inexistentes:", [...new Set(malos.map(c => c.id))].join(", "));
let ok = 0, okIA = 0, nIA = 0; const fallas = [];
for (const c of casos) {
  Object.assign(M.mem, {nombre: null, ofrece: null, ultimo: null, fallos: 0, ultimoId: null});
  const r = M.procesar(c.q);
  const got = r.id || (r.sinRespuesta ? "(IA)" : "(comando)");
  if (c.id === "(IA)") nIA++;
  if (got === c.id) { ok++; if (c.id === "(IA)") okIA++; } else fallas.push(`✗ "${c.q}" → ${got} (esperado ${c.id})`);
}
console.log(`Temas: ${ok - okIA}/${casos.length - nIA} · Generales a la IA: ${okIA}/${nIA}`);
console.log(`ACIERTOS: ${ok}/${casos.length} (${(ok / casos.length * 100).toFixed(1)}%)`);
if (process.argv.includes("--fallas")) fallas.forEach(f => console.log(f));
