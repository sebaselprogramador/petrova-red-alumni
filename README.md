# Petrova · Asistente virtual de la Red Alumni UNIFRANZ

Chatbot por voz con un personaje 3D animado, hecho con **cero presupuesto** para la feria de la Red Alumni y Empleabilidad de UNIFRANZ (Cochabamba, Bolivia).

**Autor:** Sebastián Rocha

👉 **Pruébalo aquí:** https://sebaselprogramador.github.io/petrova-red-alumni/

## Qué hace

- Conversa por voz (micrófono) o por texto, con la voz neuronal «Elena» pregrabada y subtítulos palabra por palabra.
- Responde sobre la Red Alumni, empleabilidad (currículum, entrevistas, prácticas, Career Coaching, ferias), la universidad (carreras, sedes, inscripción, becas) y muchos temas cotidianos.
- Entiende formas de hablar de distintos países («sí po», «órale», «de una», «nel»…) y corrige errores típicos del micrófono.
- Personaje 3D (Three.js) con más de 30 animaciones; algunas se activan con palabras (al decir «Unifranz» levanta las manos con el logo).
- Modo kiosco para pantalla vertical de 1080×1920.

## Cómo funciona por dentro

- Todo es una página web estática: HTML, CSS y JavaScript, sin servidor ni base de datos.
- **Entendimiento:** palabras clave + comparación con más de 970 frases de ejemplo (TF-IDF y similitud coseno), con sinónimos, recorte de terminaciones y corrección fonética.
- **IA opcional:** si en la computadora corre [Ollama](https://ollama.com) con el modelo `qwen2.5:3b`, responde lo que no está preparado. En la versión publicada en internet esa parte no está disponible y Petrova sugiere temas.

## Pruebas

```bash
node herramientas/probar_banco.js         # banco de preguntas con variantes de micrófono
node herramientas/probar_nuevas.js        # preguntas nuevas que el motor nunca vio
node herramientas/probar_afirmaciones.js  # respuestas «sí» / «no» a las preguntas de seguimiento
```

## Recomendaciones

Usar **Google Chrome** y permitir el micrófono. El personaje 3D necesita internet para cargar Three.js; sin internet aparece la versión 2D.
