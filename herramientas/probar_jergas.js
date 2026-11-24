// Prueba que Petrova entienda cada pregunta de TODOS sus temas aunque se diga con rodeos y jergas
// de Bolivia y de otros países («oye cumpa, una consulta…», «¿…, pues?», «che, decime…», «¿…, no cierto?»).
// Compara lo que responde con y sin la jerga: debe ser el mismo tema.
// Uso: node herramientas/probar_jergas.js            (resumen)
//      node herramientas/probar_jergas.js --fallas   (lista cada caso que cambia de tema)
const fs = require("fs");
require("./entrenar.js");
const html = fs.readFileSync("chatbot-red-alumni.html", "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
const motor = js.slice(0, js.search(/\/\* =+\s*\n\s*PERSONAJE/));
const M = new Function("prefs", "guardarPrefs", fs.readFileSync("entrenamiento.js", "utf8") + motor + ";return {procesar,mem};")({vel: 1}, () => {});

const leer = f => fs.readFileSync(f, "utf8").split("\n").filter(l => l.trim() && !l.startsWith("#"))
  .map(l => { const [id, ...q] = l.split("|"); return {id: id.trim(), q: q.join("|").trim()}; });
const preguntas = [...leer("herramientas/banco_preguntas.txt"), ...leer("herramientas/prueba_nueva.txt")].filter(c => c.id !== "(IA)");

// Rodeos y coletillas por región
const ESTILOS = [
  ["Bolivia", ["oye cumpa,", "ya, una consulta:", "pucha, oye,", "disculpe joven,", "a ver, dime", "oe chango,", "una preguntita nomás,"], ["pues", "nomás", "ps", "pues cumpa", "no cierto"]],
  ["Perú", ["oe causa,", "oye pe,", "una consulta,"], ["pe", "pues causa", "ya"]],
  ["Chile", ["oye po,", "wena,", "una consulta po,"], ["po", "cachai", "po amiga"]],
  ["Argentina", ["che,", "che, decime", "una pregunta, che:"], ["che", "viste", "boludo"]],
  ["México", ["oye wey,", "órale, una pregunta,", "fíjate que quiero saber"], ["wey", "carnal", "no"]],
  ["Colombia", ["parce, una pregunta,", "oiga, me podría decir", "quiubo, quiero saber"], ["parce", "pues", "pues mijo"]],
  ["España", ["oye tío,", "venga, una pregunta,", "perdona, ¿sabes"], ["tío", "vale", "eh"]],
  ["Venezuela", ["chamo,", "épale, quería preguntar", "pana, ¿sabes"], ["chamo", "pana", "pues"]],
  ["Formal", ["disculpe, quisiera saber", "buenas tardes, me podría explicar", "con permiso, una consulta:", "perdón, ¿me podría decir"], ["por favor", "gracias", "si es tan amable"]],
  ["Juvenil", ["bro,", "hey, tengo una duda:", "literal quiero saber", "mmm a ver,"], ["bro", "porfis", "plis"]]
];
const resolver = q => { Object.assign(M.mem, {nombre: null, ofrece: null, ultimo: null, fallos: 0, ultimoId: null}); const r = M.procesar(q); return r.id || (r.sinRespuesta ? "(IA)" : "(comando)"); };
let total = 0, igual = 0; const porEstilo = {}, fallas = [];
preguntas.forEach((c, i) => {
  const base = resolver(c.q);
  for (let j = 0; j < 2; j++) {
    const [estilo, pres, sufs] = ESTILOS[(i * 3 + j * 7) % ESTILOS.length];
    const pre = pres[(i + j) % pres.length], suf = sufs[(i * 2 + j) % sufs.length];
    const q = j === 0 ? `${pre} ${c.q}` : `${pre} ${c.q} ${suf}`;
    const got = resolver(q); total++;
    porEstilo[estilo] = porEstilo[estilo] || {ok: 0, n: 0}; porEstilo[estilo].n++;
    if (got === base) { igual++; porEstilo[estilo].ok++; } else fallas.push(`✗ [${estilo}] "${q}" → ${got} (sin jerga: ${base})`);
  }
});
console.log(`Preguntas: ${preguntas.length} · Con jerga: ${total}`);
for (const [e, v] of Object.entries(porEstilo)) console.log(`  ${e.padEnd(10)} ${v.ok}/${v.n}`);
console.log(`MISMO TEMA CON JERGA: ${igual}/${total} (${(igual / total * 100).toFixed(1)}%)`);
if (process.argv.includes("--fallas")) fallas.forEach(f => console.log(f));
