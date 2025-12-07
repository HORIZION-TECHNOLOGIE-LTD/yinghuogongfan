@echo off
REM SurfSense Quick Start Script for Windows
REM This script helps you quickly set up SurfSense with minimal configuration

echo ======================================
echo    SurfSense Quick Start Setup
echo ======================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/install/windows-install/
    exit /b 1
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not available. Please install Docker Compose.
    echo Visit: https://docs.docker.com/compose/install/
    exit /b 1
)

echo [OK] Docker and Docker Compose are installed
echo.

REM Create root .env file if it doesn't exist
if not exist .env (
    echo Creating root .env file...
    copy .env.example .env >nul
    
    REM Try to generate a secure password using PowerShell
    powershell -Command "$pwd = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_}); (Get-Content .env) -replace 'POSTGRES_PASSWORD=postgres', \"POSTGRES_PASSWORD=$pwd\" | Set-Content .env" >nul 2>&1
    
    if errorlevel 0 (
        echo [OK] Created .env file with secure password
    ) else (
        echo [OK] Created .env file
        echo [WARNING] Please edit .env and set a secure POSTGRES_PASSWORD
        echo [INFO] You can generate a secure password with PowerShell:
        echo [INFO] -join ((48..57) + (65..90) + (97..122) ^| Get-Random -Count 32 ^| ForEach-Object {[char]$_})
    )
) else (
    echo [WARNING] Root .env file already exists, skipping...
)

REM Setup backend .env
if not exist surfsense_backend\.env (
    echo Creating backend .env file...
    copy surfsense_backend\.env.example surfsense_backend\.env >nul
    echo [OK] Created backend .env file
    echo [WARNING] Please edit surfsense_backend\.env and add your API keys
) else (
    echo [WARNING] Backend .env file already exists, skipping...
)

REM Setup frontend .env
if not exist surfsense_web\.env (
    echo Creating frontend .env file...
    copy surfsense_web\.env.example surfsense_web\.env >nul
    echo [OK] Created frontend .env file
) else (
    echo [WARNING] Frontend .env file already exists, skipping...
)

echo.
echo ======================================
echo    Configuration Setup Complete!
echo ======================================
echo.
echo Next Steps:
echo.
echo 1. Edit surfsense_backend\.env and add your API keys:
echo    - At minimum, add an LLM API key (e.g., OPENAI_API_KEY)
echo    - ETL_SERVICE is set to DOCLING by default (no API key needed)
echo.
echo 2. Start SurfSense:
echo    docker compose up -d
echo.
echo 3. Access SurfSense:
echo    - Web UI: http://localhost:3000
echo    - API Docs: http://localhost:8000/docs
echo    - pgAdmin: http://localhost:5050
echo.
echo 4. View logs:
echo    docker compose logs -f
echo.
echo For detailed documentation, see:
echo    - English: DEPLOYMENT.md
echo    - Chinese: DEPLOYMENT.zh-CN.md
echo.
echo ======================================

pause
