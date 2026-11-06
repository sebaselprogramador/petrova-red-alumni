// Prueba a Petrova con el banco de preguntas y variantes como las transcribe el micrófono.
// Uso: node herramientas/probar_banco.js            (resumen)
//      node herramientas/probar_banco.js --fallas   (lista cada pregunta que falla)
const fs = require("fs");
require("./entrenar.js");   // usa siempre las preguntas de ejemplo más recientes
const html = fs.readFileSync("chatbot-red-alumni.html", "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
const motor = js.slice(0, js.search(/\/\* =+\s*\n\s*PERSONAJE/));
const M = new Function("prefs", "guardarPrefs", fs.readFileSync("entrenamiento.js", "utf8") + motor + ";return {procesar,mem,TEMAS};")({vel: 1}, () => {});
const ids = new Set(M.TEMAS.map(t => t.id));

const banco = fs.readFileSync("herramientas/banco_preguntas.txt", "utf8").split("\n")
  .filter(l => l.trim() && !l.startsWith("#")).map(l => { const [id, ...q] = l.split("|"); return {id: id.trim(), q: q.join("|").trim()}; });

// Variantes realistas: errores típicos de transcripción y formas de hablar en la feria
const sinTildes = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const microfono = s => sinTildes(s).replace(/v/g, "b").replace(/ll/g, "y").replace(/ce/g, "se").replace(/ci/g, "si").replace(/\bh/g, "");
const PREFIJOS = ["oye petrova ", "disculpa ", "una pregunta ", "petrova ", "mira "];
const SUFIJOS = [" por favor", " porfa", "", ""];
const pruebas = [];
banco.forEach((b, i) => {
  pruebas.push({...b, tipo: "original"});
  pruebas.push({id: b.id, q: microfono(b.q), tipo: "micrófono"});
  if (b.q.split(" ").length > 1 || i % 2 === 0) pruebas.push({id: b.id, q: PREFIJOS[i % PREFIJOS.length] + sinTildes(b.q) + SUFIJOS[i % SUFIJOS.length], tipo: "conversacional"});
});

const fallas = [], porTipo = {};
const temasMal = banco.filter(b => !ids.has(b.id));
if (temasMal.length) console.log("⚠️ Temas inexistentes en el banco:", [...new Set(temasMal.map(b => b.id))].join(", "));
for (const p of pruebas) {
  Object.assign(M.mem, {nombre: null, ofrece: null, ultimo: null, fallos: 0});
  const r = M.procesar(p.q);
  const got = r.id || (r.sinRespuesta ? "(IA)" : "(comando)");
  porTipo[p.tipo] = porTipo[p.tipo] || {ok: 0, n: 0}; porTipo[p.tipo].n++;
  if (got === p.id) porTipo[p.tipo].ok++; else fallas.push({...p, got});
}
const total = pruebas.length, ok = total - fallas.length;
console.log(`Preguntas originales: ${banco.length} · Total con variantes: ${total}`);
for (const [t, v] of Object.entries(porTipo)) console.log(`  ${t.padEnd(15)} ${v.ok}/${v.n}`);
console.log(`ACIERTOS: ${ok}/${total} (${(ok / total * 100).toFixed(1)}%)`);
if (process.argv.includes("--fallas")) for (const f of fallas) console.log(`✗ [${f.tipo}] "${f.q}" → ${f.got} (esperado ${f.id})`);
