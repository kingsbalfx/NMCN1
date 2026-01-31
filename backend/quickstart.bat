@echo off
REM Kingsbal Backend Quick Start Script for Windows

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   🚀 Kingsbal Backend - Quick Start Setup (Windows)             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo 📦 Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% found

REM Check PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  PostgreSQL not found in PATH
    echo    You'll need to set up the database manually
) else (
    echo ✅ PostgreSQL found
)

echo.

REM Install dependencies
echo 📚 Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.

REM Check if .env exists
if exist ".env" (
    echo ⚠️  .env file already exists
    set /p RECONFIGURE="   Do you want to reconfigure it? (y/N): "
    if /i "!RECONFIGURE!"=="y" (
        copy .env.example .env
        echo ✅ .env reset from template
    ) else (
        echo    Using existing .env
    )
) else (
    copy .env.example .env
    echo ✅ .env file created from template
)

echo.
echo 📝 Next steps:
echo.
echo 1. Configure your .env file with your credentials:
echo    Open it in your editor and fill in:
echo    - DATABASE_URL
echo    - JWT_SECRET
echo    - OPENAI_API_KEY
echo    - PAYSTACK_SECRET_KEY
echo.

echo 2. Create PostgreSQL database:
echo    a) Open Command Prompt as Administrator
echo    b) Run: createdb kingsbal
echo    c) Load schema: psql -d kingsbal -f DATABASE_SCHEMA.sql
echo.

echo 3. Validate setup:
echo    node validate-setup.js
echo.

echo 4. Start development server:
echo    npm run dev
echo.

echo 5. Test the API:
echo    Open browser to: http://localhost:5000
echo    Or run: curl http://localhost:5000
echo.

echo 📖 Documentation available in:
echo    - SETUP_GUIDE.md (Complete setup instructions)
echo    - API_DOCUMENTATION.md (API reference)
echo    - BACKEND_README.md (Feature overview)
echo.

echo ✨ Setup script completed!
echo.

pause
