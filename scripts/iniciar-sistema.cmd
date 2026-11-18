@echo off
rem Inicia el Sistema de Taller Mecanico en modo produccion.
rem Se puede ejecutar con doble clic; no depende de la configuracion de la terminal.
title Sistema de Taller Mecanico
cd /d "%~dp0.."
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%ProgramFiles%\Docker\Docker\resources\bin;%PATH%"

netstat -ano | findstr /r /c:":4000 .*LISTENING" >nul
if not errorlevel 1 (
  echo El sistema ya esta encendido. No hace falta iniciarlo otra vez.
  pause
  exit /b 0
)

docker info >nul 2>&1
if errorlevel 1 (
  echo Abriendo Docker Desktop...
  start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
)
:esperar_docker
docker info >nul 2>&1
if errorlevel 1 (
  echo Esperando a que Docker termine de arrancar...
  timeout /t 5 /nobreak >nul
  goto esperar_docker
)

echo Iniciando la base de datos...
docker compose up -d postgres
if errorlevel 1 goto error

echo Iniciando el sistema (tarda alrededor de un minuto)...
echo Deja esta ventana abierta mientras uses el sistema.
call pnpm start

:error
echo.
echo El sistema se detuvo o hubo un error. Revisa los mensajes de arriba.
pause
