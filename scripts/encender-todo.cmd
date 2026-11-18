@echo off
rem Enciende todo: Docker, base de datos, enlace publico (Tailscale Funnel) y el sistema.
title Taller Mecanico - ENCENDIDO
cd /d "%~dp0.."
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"
set "TS=%ProgramFiles%\Tailscale\tailscale.exe"

netstat -ano | findstr /r /c:":4000 .*LISTENING" >nul
if not errorlevel 1 (
  echo El sistema ya esta encendido.
  pause
  exit /b 0
)

echo [1/4] Abriendo Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
:esperar_docker
docker info >nul 2>&1
if errorlevel 1 (
  timeout /t 5 /nobreak >nul
  goto esperar_docker
)

echo [2/4] Iniciando la base de datos...
docker compose up -d postgres
if errorlevel 1 goto error

echo [3/4] Publicando el enlace en internet...
"%TS%" funnel --bg --set-path /api http://127.0.0.1:4000 >nul
if errorlevel 1 (
  echo AVISO: no se pudo publicar en internet. Revisa que Tailscale este conectado.
  echo El sistema funcionara igual en la red local.
) else (
  "%TS%" funnel --bg http://127.0.0.1:3000 >nul
  echo Enlace publico activo:
  "%TS%" funnel status
)

echo [4/4] Iniciando el sistema (tarda alrededor de un minuto)...
echo Deja esta ventana abierta. Para apagar todo usa "Apagar todo (Taller)".
call pnpm start

:error
echo.
echo El sistema se detuvo o hubo un error. Revisa los mensajes de arriba.
pause
