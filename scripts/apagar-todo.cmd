@echo off
rem Apaga todo y libera la memoria: enlace publico, sistema, base de datos, Docker y WSL.
rem Los datos de la base de datos se conservan.
title Taller Mecanico - APAGADO
cd /d "%~dp0.."
set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
set "TS=%ProgramFiles%\Tailscale\tailscale.exe"

echo [1/5] Quitando el enlace de internet...
if exist "%TS%" "%TS%" funnel reset >nul 2>&1

echo [2/5] Deteniendo el sistema (web y API)...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":3000 .*LISTENING" /c:":4000 .*LISTENING"') do taskkill /PID %%p /T /F >nul 2>&1

echo [3/5] Deteniendo la base de datos...
docker info >nul 2>&1
if not errorlevel 1 docker compose stop >nul 2>&1

echo [4/5] Cerrando Docker Desktop...
taskkill /IM "Docker Desktop.exe" /T /F >nul 2>&1
taskkill /IM "com.docker.backend.exe" /T /F >nul 2>&1
taskkill /IM "com.docker.build.exe" /T /F >nul 2>&1

echo [5/5] Apagando WSL para liberar la memoria...
wsl --shutdown >nul 2>&1

echo.
echo LISTO. Todo esta apagado y la memoria liberada. Tus datos siguen guardados.
pause
