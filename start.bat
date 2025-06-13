@echo off
echo ========================================
echo        OmniCoach MVP Startup
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)

echo.
echo Checking Ollama installation (optional)...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Ollama not found. You can still use OpenAI/Claude.
    echo To install Ollama for free local AI: https://ollama.ai
) else (
    echo Ollama found:
    ollama --version
    echo.
    echo Checking for Mistral model...
    ollama list | findstr "mistral" >nul 2>&1
    if %errorlevel% neq 0 (
        echo Installing Mistral model for Ollama...
        ollama pull mistral
    ) else (
        echo Mistral model already installed.
    )
)

echo.
echo ========================================
echo     Starting OmniCoach in DEV mode
echo ========================================
echo.
echo The app will open in a few seconds...
echo.

npm run dev