@echo off
rem Publica el sistema en internet con Tailscale Funnel (https://<equipo>.<tailnet>.ts.net).
title Publicar Taller Mecanico en internet
set "TS=%ProgramFiles%\Tailscale\tailscale.exe"

netstat -ano | findstr /r /c:":4000 .*LISTENING" >nul
if errorlevel 1 (
  echo AVISO: el sistema no esta encendido. Usa primero "Iniciar Taller Mecanico".
  echo El enlace se publicara, pero no cargara hasta que el sistema este encendido.
  echo.
)

echo Publicando el sistema en internet...
"%TS%" funnel --bg --set-path /api http://127.0.0.1:4000
if errorlevel 1 goto error
"%TS%" funnel --bg http://127.0.0.1:3000
if errorlevel 1 goto error
echo.
echo LISTO. El sistema esta en internet en esta direccion:
"%TS%" funnel status
echo.
pause
exit /b 0

:error
echo.
echo No se pudo publicar. Si aparece un enlace de Tailscale, abrelo, acepta y vuelve a intentarlo.
pause
exit /b 1
