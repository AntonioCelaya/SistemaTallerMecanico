@echo off
rem Quita el sistema de internet. Sigue funcionando en la red local y con la app Tailscale.
title Quitar Taller Mecanico de internet
set "TS=%ProgramFiles%\Tailscale\tailscale.exe"

echo Quitando el sistema de internet...
"%TS%" funnel reset
if errorlevel 1 (
  echo No se pudo quitar. Revisa que Tailscale este abierto.
  pause
  exit /b 1
)
echo.
echo LISTO. El sistema ya NO esta en internet.
echo Se puede seguir usando en la red local del taller.
"%TS%" funnel status
echo.
pause
