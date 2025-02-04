@echo off
setlocal enabledelayedexpansion

REM Define paths
set REPO_ROOT=C:\development\github\Christephanie\christephanie
set BACKEND_PATH=%REPO_ROOT%\backend\src
set PROJECT_PATH=%BACKEND_PATH%\Wedding.PublicApi\Wedding.PublicApi.csproj
set SWAGGER_OUTPUT=%BACKEND_PATH%\swagger.json
set DLL_PATH=%BACKEND_PATH%\Wedding.PublicApi\bin\Release\net8.0\Wedding.PublicApi.dll

REM Change to backend directory
cd /d %BACKEND_PATH%

REM Check if dotnet is installed
where dotnet >nul 2>nul
if %errorlevel% neq 0 (
    echo .NET SDK not found. Install .NET SDK and try again.
    exit /b 1
)

echo Building project: %PROJECT_PATH%
dotnet build %PROJECT_PATH% -c Release
if %errorlevel% neq 0 (
    echo Build failed. Exiting.
    exit /b 1
)

echo Generating Swagger JSON... %SWAGGER_OUTPUT%
swagger tofile --output %SWAGGER_OUTPUT% %DLL_PATH% v1
if not exist %SWAGGER_OUTPUT% (
    echo Swagger generation failed. No output file found.
    exit /b 1
)

pause