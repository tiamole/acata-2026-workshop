@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\copy-admin-token.ps1"
if errorlevel 1 goto failed
start "" "https://tiamole.github.io/acata-2026-workshop/#dashboard"
echo Paste the copied token into the dashboard sign-in.
pause
exit /b 0
:failed
echo The local administrator credential could not be loaded. Use the Windows account that deployed the service.
pause
exit /b 1
