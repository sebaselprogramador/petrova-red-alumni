# Petrova · Asistente virtual de UNIFRANZ (SIS Innovation Summit y Turing Lab)

Chatbot por voz con un personaje 3D animado, hecho con **cero presupuesto** para **A. Turing Lab – Engineering & Computational Innovation**, la Tech Expo de Ingeniería de Sistemas e Innovación Digital de UNIFRANZ.

**Autor:** Sebastián Rocha

👉 **Pruébalo aquí:** https://sebaselprogramador.github.io/petrova-red-alumni/

## Qué hace

- **Nuevas mallas 2026 de las 17 carreras de UNIFRANZ:** duración, semestres, áreas, menciones (con sus materias) y microcredenciales, leídas de las mallas oficiales. Al preguntar por una carrera, Petrova muestra la **foto de la malla** en el chat (se toca para verla en grande) y el enlace al PDF oficial.
- **SIS Innovation Summit:** presentación de los rediseños curriculares de Ingeniería de Sistemas e Innovación Digital y Derecho (Legal Tech, Gobernanza Digital, Justicia Penal Digital).
- Qué es una microcredencial, para qué sirve, qué beneficios tiene elegir una mención y cuándo se elige.

- Conversa por voz (micrófono) o por texto, con la voz neuronal «Elena» pregrabada y subtítulos palabra por palabra.
- Es experta en las áreas del Turing Lab: **Inteligencia Artificial, Ciencia de Datos, Ciberseguridad, Blockchain y Computación en la Nube**. Explica el formato de la expo por islas temáticas, quién fue Alan Turing y el test de Turing.
- Conoce la nueva malla de **Ingeniería de Sistemas e Innovación Digital**: 9 semestres, 6 microcredenciales, 2 menciones y proyectos integradores (datos de la página oficial de la carrera).
- También charla de temas cotidianos y da información general de Unifranz (sedes, carreras, inscripción, becas).
- Entiende rodeos, jergas, afirmaciones y negaciones de Bolivia y de otros países («oye cumpa, una consulta…», «¿…, pues?», «che, decime», «órale», «ni de vainas», «ya pues ya») y corrige errores típicos del micrófono («touring lab», «block chain», «siber seguridad»…).
- Cada tema técnico tiene tres niveles: la respuesta normal, **«Más a fondo»** (explicación científica y técnica) y **«Más fácil»** (con analogías de la vida diaria), con respuestas en distintos tonos: amistosos, comprensivos y típicos.
- Más de 250 temas: IA (tipos de aprendizaje, transformers, agentes, prompts, alucinaciones), datos (estadística, protección de datos), ciberseguridad (ingeniería social, VPN, cifrado, DDoS), blockchain (hash, consenso, wallets, NFT), nube (contenedores, serverless, DevOps) y fundamentos (algoritmos, binario, internet, APIs, Git).
- Personaje 3D (Three.js) con más de 30 animaciones; algunas se activan con palabras.
- Modo kiosco para pantalla vertical de 1080×1920.

## Petrova también es una demo de IA

- **Voz a texto:** Web Speech API del navegador.
- **Entendimiento (procesamiento de lenguaje natural):** palabras clave + comparación con más de 1.800 frases de ejemplo (TF-IDF y similitud coseno), con sinónimos, recorte de terminaciones y corrección fonética.
- **Voz:** síntesis neuronal pregrabada con los tiempos de cada palabra para mover la boca.
- **IA opcional:** si en la computadora corre [Ollama](https://ollama.com) con `qwen2.5:3b`, responde lo que no está preparado. En la versión publicada en internet esa parte no está disponible.

## Pruebas

```bash
node herramientas/probar_banco.js         # banco de preguntas con variantes de micrófono
node herramientas/probar_nuevas.js        # preguntas nuevas que el motor nunca vio
node herramientas/probar_afirmaciones.js  # respuestas «sí» / «no» a las preguntas de seguimiento
node herramientas/probar_jergas.js        # cada pregunta con rodeos y jergas de 10 estilos regionales
```

## Recomendaciones

Usar **Google Chrome** y permitir el micrófono. El personaje 3D, las voces y las mallas funcionan sin internet (Three.js va incluido en `lib/`); el reconocimiento de voz del navegador sí necesita internet, y sin él se puede escribir o tocar los temas.
