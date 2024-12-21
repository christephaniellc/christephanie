@echo off
REM Check if an argument is passed
if "%~1"=="" (
    echo Error: You must provide the working directory as an argument.
    exit /b 1
)

REM Set the working directory from the argument
set WORKING_DIR=%~1

REM Navigate to the working directory
cd /d "%WORKING_DIR%"

REM Step 1: Publish the application
dotnet publish -c Release -o publish /p:DebugType=None
REM --self-contained 
REM /p:PublishTrimmed=true /p:PublishReadyToRun=true
if errorlevel 1 (
    echo Error: dotnet publish failed.
	pause
    exit /b 1
)

REM Step 2: Create a zip package
powershell Compress-Archive -Path publish\* -DestinationPath publish\lambda-deployment.zip -Force
if errorlevel 1 (
    echo Error: Failed to create the zip package.
	pause
    exit /b 1
)

REM Step 3: Deploy the Lambda function
dotnet lambda deploy-function
if errorlevel 1 (
    echo Error: dotnet lambda deploy-function failed.
	pause
    exit /b 1
)

pause