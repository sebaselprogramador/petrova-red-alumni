// Copia las preguntas de ejemplo de herramientas/banco_preguntas.txt a entrenamiento.js,
// que el chatbot carga para entender frases nuevas. Córrelo después de agregar preguntas al banco.
// Uso: node herramientas/entrenar.js
const fs = require("fs");
const ejemplos = fs.readFileSync("herramientas/banco_preguntas.txt", "utf8").split("\n")
  .filter(l => l.trim() && !l.startsWith("#")).map(l => { const [id, ...q] = l.split("|"); return [id.trim(), q.join("|").trim()]; });
fs.writeFileSync("entrenamiento.js", "// Generado por herramientas/entrenar.js desde herramientas/banco_preguntas.txt. No editar a mano.\nvar EJEMPLOS=" + JSON.stringify(ejemplos) + ";\n");
console.log(`entrenamiento.js listo: ${ejemplos.length} preguntas de ejemplo`);
