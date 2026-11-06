"""Graba con voz neuronal todas las frases de Petrova y guarda el tiempo de cada palabra.

Uso:  python herramientas/generar_audios.py textos.json [voz]
      voz por defecto: es-AR-ElenaNeural  (ver otras: edge-tts --list-voices)
Solo graba las frases nuevas o cambiadas; si cambias de voz, regraba todo.
"""
import asyncio, json, os, sys
import edge_tts

VOZ = sys.argv[2] if len(sys.argv) > 2 else "es-AR-ElenaNeural"
VELOCIDAD = "+0%"   # ej. "+5%" más rápida, "-5%" más lenta
CARPETA = "audios"
DATOS = os.path.join(CARPETA, "_datos")
os.makedirs(DATOS, exist_ok=True)

textos = json.load(open(sys.argv[1], encoding="utf-8"))
meta_path = os.path.join(DATOS, "voz.txt")
voz_anterior = open(meta_path).read().strip() if os.path.exists(meta_path) else ""
rehacer_todo = voz_anterior != VOZ


async def grabar(item, sem):
    k, t = item["k"], item["t"]
    mp3, dat = os.path.join(CARPETA, k + ".mp3"), os.path.join(DATOS, k + ".json")
    if not rehacer_todo and os.path.exists(mp3) and os.path.exists(dat):
        return "ya estaba"
    async with sem:
        for intento in range(4):
            try:
                com = edge_tts.Communicate(t, VOZ, rate=VELOCIDAD, boundary="WordBoundary")
                audio, palabras, cursor = bytearray(), [], 0
                async for ch in com.stream():
                    if ch["type"] == "audio":
                        audio += ch["data"]
                    elif ch["type"] == "WordBoundary":
                        w = ch["text"]
                        i = t.find(w, cursor)
                        if i < 0:
                            i = cursor
                        else:
                            cursor = i + len(w)
                        # [inicio ms, duración ms, posición en el texto, largo]
                        palabras.append([round(ch["offset"] / 10000), round(ch["duration"] / 10000), i, len(w)])
                open(mp3, "wb").write(audio)
                json.dump(palabras, open(dat, "w"))
                return "grabada"
            except Exception as e:  # el servicio a veces corta: se reintenta
                await asyncio.sleep(1.5 * (intento + 1))
                err = e
        print("  ✗ no se pudo grabar:", t[:60], "→", err)
        return "error"


async def main():
    sem = asyncio.Semaphore(5)
    res = await asyncio.gather(*(grabar(it, sem) for it in textos))
    print(f"Grabadas: {res.count('grabada')} · ya estaban: {res.count('ya estaba')} · errores: {res.count('error')}")
    indice = {}
    for it in textos:
        dat = os.path.join(DATOS, it["k"] + ".json")
        if os.path.exists(dat) and os.path.exists(os.path.join(CARPETA, it["k"] + ".mp3")):
            indice[it["k"]] = json.load(open(dat))
    nombre = VOZ.split("-")[2].replace("Neural", "")
    with open(os.path.join(CARPETA, "indice.js"), "w", encoding="utf-8") as f:
        f.write("// Generado por herramientas/generar_audios.py — no editar a mano\n")
        f.write("window.AUDIOS=" + json.dumps({"voz": VOZ, "nombre": nombre, "c": indice}, separators=(",", ":")) + ";\n")
    open(meta_path, "w").write(VOZ)
    print(f"Índice listo: {len(indice)} frases con la voz {VOZ}")

asyncio.run(main())
