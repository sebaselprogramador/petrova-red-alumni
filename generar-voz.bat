@echo off
REM Actualiza el entrenamiento (banco de preguntas) y regraba la voz de Petrova despues de editar el chatbot
REM Requisitos (una sola vez): instalar Node.js y Python, y ejecutar:  pip install edge-tts
cd /d "%~dp0"
node herramientas\entrenar.js || goto error
node herramientas\extraer_textos.js chatbot-red-alumni.html > herramientas\textos.json || goto error
python herramientas\generar_audios.py herramientas\textos.json es-AR-ElenaNeural || goto error
echo.
echo Listo. Ya puedes abrir chatbot-red-alumni.html
pause
exit /b 0
:error
echo Algo fallo. Revisa que Node.js, Python y edge-tts esten instalados.
pause
