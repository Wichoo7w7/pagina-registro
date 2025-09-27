@echo off
echo [BACKEND] Iniciando servidor backend...
echo [BACKEND] Verificando conexión a base de datos...

REM Verificar si el puerto 3000 está libre
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo [WARNING] Puerto 3000 ocupado por proceso %%a
    taskkill /PID %%a /F 2>nul
)

echo [BACKEND] Puerto 3000 libre, iniciando servidor...
cd /d "%~dp0"
npm run dev

pause