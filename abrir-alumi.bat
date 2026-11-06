@echo off
REM Abre Petrova: enciende la IA local (Ollama), levanta la pagina y la abre en Google Chrome (si no esta, en Edge).
REM Deja abierta la ventana negra "Servidor Petrova" mientras uses a Petrova; si la cierras, se cierra la pagina.
cd /d "%~dp0"

REM 1) IA local (si esta instalada)
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe" start "" "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe"

REM 2) Servidor de la pagina en el puerto 8765 (solo si no esta ya encendido)
netstat -ano | findstr ":8765" | findstr "LISTENING" >nul
if errorlevel 1 start "Servidor Petrova" /min python -m http.server 8765

REM 3) Abrir en Chrome (su microfono funciona mejor); si no esta instalado, en Edge
timeout /t 2 /nobreak >nul
set "URL=http://localhost:8765/chatbot-red-alumni.html"
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%URL%" & goto fin)
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" "%URL%" & goto fin)
start msedge "%URL%"
:fin
