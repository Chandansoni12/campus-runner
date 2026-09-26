@echo off
echo ===================================
echo Delivo PWA - Local Server
echo ===================================
echo.
echo Starting local server...
echo Open your browser to: http://localhost:8000/all-screens.html
echo Press CTRL+C to stop the server
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python HTTP Server
    python -m http.server 8000
) else (
    REM Check if PHP is available
    php --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Using PHP Built-in Server
        php -S localhost:8000
    ) else (
        echo Error: Python or PHP is required to run the server
        echo Please install Python from https://www.python.org
        pause
    )
)
