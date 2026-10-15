@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
echo.
echo Starting Klyte preview. Open http://localhost:3000
echo On your phone (same Wi-Fi) use the Network URL shown below.
echo.
call npm run dev:lan
