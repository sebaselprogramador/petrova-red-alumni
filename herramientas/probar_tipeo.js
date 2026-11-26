// Prueba que Petrova entienda las preguntas aunque vengan con errores de tipeo o de ortografía
// («habalame», «unibersidad», «medisina», «qe»), como escribe la gente apurada en el chat.
// Compara lo que responde con y sin los errores: debe ser el mismo tema.
// Uso: node herramientas/probar_tipeo.js            (resumen)
//      node herramientas/probar_tipeo.js --fallas   (lista los casos que cambian de tema)
const fs = require("fs");
require("./entrenar.js");
const html = fs.readFileSync("chatbot-red-alumni.html", "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
const motor = js.slice(0, js.search(/\/\* =+\s*\n\s*PERSONAJE/));
const M = new Function("prefs", "guardarPrefs", "var esc=s=>s;" + fs.readFileSync("entrenamiento.js", "utf8") + motor + ";return {procesar,mem};")({vel: 1}, () => {});

const leer = f => fs.readFileSync(f, "utf8").split("\n").filter(l => l.trim() && !l.startsWith("#"))
  .map(l => { const [id, ...q] = l.split("|"); return {id: id.trim(), q: q.join("|").trim()}; });
const preguntas = [...leer("herramientas/banco_preguntas.txt"), ...leer("herramientas/prueba_nueva.txt")].filter(c => c.id !== "(IA)");

// Generador de errores reproducible (siempre los mismos)
let semilla = 12345; const azar = () => (semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648;
const VECINAS = {a:"sqz",b:"vn",c:"xv",d:"sf",e:"wr",f:"dg",g:"fh",h:"gj",i:"uo",j:"hk",k:"jl",l:"k",m:"n",n:"mb",o:"ip",p:"o",q:"w",r:"et",s:"ad",t:"ry",u:"yi",v:"cb",w:"qe",x:"zc",y:"tu",z:"xs"};
function errorEn(p) {
  const i = 1 + Math.floor(azar() * (p.length - 2)), tipo = Math.floor(azar() * 5);
  if (tipo === 0) return p.slice(0, i) + p.slice(i + 1);                       // se come una letra
  if (tipo === 1) return p.slice(0, i) + p[i] + p.slice(i);                    // letra repetida
  if (tipo === 2) return p.slice(0, i - 1) + p[i] + p[i - 1] + p.slice(i + 1); // letras cambiadas de lugar
  if (tipo === 3) { const v = VECINAS[p[i]] || p[i]; return p.slice(0, i) + v[Math.floor(azar() * v.length)] + p.slice(i + 1); } // tecla vecina
  return p.slice(0, i) + p.slice(i, i + 1).replace(/[aeiou]/, m => ({a:"e",e:"a",i:"e",o:"u",u:"o"}[m])) + p.slice(i + 1); // vocal cambiada
}
function conErrores(q) {
  const palabras = q.split(" "), largas = palabras.map((w, i) => [w, i]).filter(([w]) => w.length >= 5);
  if (!largas.length) return null;
  const [w, i] = largas[Math.floor(azar() * largas.length)]; palabras[i] = errorEn(w);
  return palabras.join(" ");
}
const resolver = q => { Object.assign(M.mem, {nombre: null, ofrece: null, ultimo: null, fallos: 0, ultimoId: null, ultimoTema: null}); const r = M.procesar(q); return r.id || (r.duda ? "(duda)" : r.sinRespuesta ? "(IA)" : "(comando)"); };
let total = 0, igual = 0, duda = 0; const fallas = [];
for (const c of preguntas) {
  const base = resolver(c.q); const q = conErrores(c.q); if (!q || q === c.q) continue;
  const got = resolver(q); total++;
  if (got === base) igual++; else if (got === "(duda)") duda++; else fallas.push(`✗ "${q}" → ${got} (sin errores: ${base})`);
}
console.log(`Preguntas con un error de tipeo: ${total}`);
console.log(`  mismo tema: ${igual} · pregunta «¿te refieres a…?»: ${duda} · otro tema o sin respuesta: ${total - igual - duda}`);
console.log(`ENTIENDE CON ERRORES: ${igual}/${total} (${(igual / total * 100).toFixed(1)}%) · sin perderse: ${((igual + duda) / total * 100).toFixed(1)}%`);
if (process.argv.includes("--fallas")) fallas.forEach(f => console.log(f));
