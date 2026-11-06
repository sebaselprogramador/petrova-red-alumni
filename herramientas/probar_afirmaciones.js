// Prueba que Petrova entienda «sí» y «no» dichos de muchas formas cuando ofrece algo («¿Te cuento…?»).
// Uso: node herramientas/probar_afirmaciones.js
const fs = require("fs");
const html = fs.readFileSync("chatbot-red-alumni.html", "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
const motor = js.slice(0, js.search(/\/\* =+\s*\n\s*PERSONAJE/));
const M = new Function("prefs", "guardarPrefs", fs.readFileSync("entrenamiento.js", "utf8") + motor + ";return {procesar,mem,TEMAS};")({vel: 1}, () => {});

const SI = ["sí", "si", "claro", "claro que sí", "dale", "sí dale", "dale pues", "ok", "okey", "bueno", "ya", "sí claro", "obvio", "por supuesto",
  "de una", "va", "vale", "listo", "perfecto", "me parece bien", "está bien", "de acuerdo", "cuéntame", "sí cuéntame", "dime", "quiero", "sí quiero",
  "me gustaría", "me encantaría", "sí por favor", "porfa", "a ver", "claro que sí Petrova", "sí me interesa", "adelante", "genial", "excelente",
  "obvio que sí", "sí sí", "seguro", "sale", "ándale", "con gusto", "explícame", "sí quiero saber", "claro dale", "bueno ya", "ya pues", "sí porfa",
  "simón", "súper", "chévere", "me late", "suena bien", "oye sí", "mmm bueno", "claro amiga", "sí, cuéntame un poquito",
  // de otros países
  "sí po", "sipo", "ya pe", "sí pe", "ya pues", "órale", "sale y vale", "va que va", "de ley", "joya", "re sí", "dale che", "listo parce", "de una parce",
  "vale tío", "venga", "hecho", "trato hecho", "me apunto", "a la orden", "cómo no", "por qué no", "claro pues", "pues claro", "chido", "fino",
  "ajá", "mhm", "uhum", "sisi", "ta bien", "yes", "of course", "así es", "totalmente", "correcto", "tal cual", "oki doki", "clarísimo", "ya ya", "de pelos"];
const NO = ["no", "no gracias", "nel", "ahora no", "después", "mejor no", "paso", "así está bien", "no hace falta", "otro día", "todavía no",
  "no por ahora", "nop", "para nada", "no quiero", "luego", "más tarde", "no, gracias Petrova", "no todavía", "olvídalo", "en otro momento", "ahorita no",
  // de otros países
  "nel pastel", "nel", "ni modo", "nanay", "nah", "ni loco", "ni de broma", "qué va", "ni ahí", "no da", "no po", "no pe", "no pues", "ya no",
  "despuesito", "al rato", "otro rato", "no me interesa", "negativo", "nunca", "jamás", "de ninguna manera", "nada que ver", "no gracias parce", "no wey"];
// con un tema claro dentro, manda el tema y no la oferta
const TEMA = [["sí, pero cuéntame un chiste", "chiste"], ["no, mejor háblame de las becas", "becas"], ["claro, y dónde están las sedes", "sedes"]];

const ofertas = M.TEMAS.filter(t => t.of && t.of.id !== "_nombre");
const preguntaDe = t => (t.k.find(k => !k.startsWith("=") && !k.includes(":")) || t.k[0]).replace(/^=/, "").split(":")[0];
const reiniciar = () => Object.assign(M.mem, {nombre: null, ofrece: null, ultimo: null, fallos: 0});
let ok = 0, total = 0; const fallas = [];
for (const t of ofertas) {
  const pedir = () => { reiniciar(); M.procesar(preguntaDe(t)); return M.mem.ofrece; };
  for (const q of SI) { const of = pedir(); if (!of) continue; total++; const r = M.procesar(q); if (r.id === of) ok++; else fallas.push(`[${t.id}] "${q}" → ${r.id || r.texto.slice(0, 40)} (esperado ${of})`); }
  for (const q of NO) { const of = pedir(); if (!of) continue; total++; const r = M.procesar(q); if (!r.id && M.mem.ofrece === null) ok++; else fallas.push(`[${t.id}] "${q}" → ${r.id || r.texto.slice(0, 40)} (esperado un «no»)`); }
  for (const [q, id] of TEMA) { if (!pedir()) continue; total++; const r = M.procesar(q); if (r.id === id) ok++; else fallas.push(`[${t.id}] "${q}" → ${r.id} (esperado ${id})`); }
}
// Respuestas a «¿Y tú cómo estás?»
const ANIMO = [["chévere", "estoy_bien"], ["todo joya", "estoy_bien"], ["bien bien y tú", "estoy_bien"], ["pura vida", "estoy_bien"], ["al cien", "estoy_bien"],
  ["tranqui", "estoy_bien"], ["bien po", "estoy_bien"], ["muy bien gracias a Dios", "estoy_bien"], ["más o menos", "estoy_regular"], ["ahí nomás", "estoy_regular"],
  ["ahí vamos", "estoy_regular"], ["regular", "estoy_regular"], ["normal", "estoy_regular"], ["mal", "estoy_mal"], ["fatal", "estoy_mal"], ["un poco cansado", "estoy_mal"],
  ["la verdad triste", "estoy_mal"], ["bajoneada", "estoy_mal"]];
for (const [q, id] of ANIMO) { reiniciar(); M.procesar("cómo estás"); total++; const r = M.procesar(q); if (r.id === id) ok++; else fallas.push(`[como_estas] "${q}" → ${r.id || r.texto.slice(0, 40)} (esperado ${id})`); }
console.log(`Ofertas probadas: ${ofertas.length} · Respuestas: ${total}`);
console.log(`ACIERTOS: ${ok}/${total} (${(ok / total * 100).toFixed(1)}%)`);
fallas.slice(0, 60).forEach(f => console.log("  ✗", f));
