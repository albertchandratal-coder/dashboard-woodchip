@echo off
echo ==========================================
echo BUILDING WOODCHIP MONITORING APP
echo ==========================================
echo.

echo [1/2] Installing dependencies...
call npm install

echo.
echo [2/2] Building production files...
call npm run build

echo.
echo ==========================================
echo BUILD COMPLETED!
echo Check the 'dist' folder for your files.
echo ==========================================
pause
