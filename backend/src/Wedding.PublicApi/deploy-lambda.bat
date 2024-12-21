@echo off
REM Step 1: Publish the application
dotnet publish --self-contained -c Release -o publish /p:DebugType=None 
REM /p:PublishTrimmed=true /p:PublishReadyToRun=true

REM Step 2: Create a zip package
powershell Compress-Archive -Path publish\* -DestinationPath publish\lambda-deployment.zip -Force

REM Step 3: Deploy the Lambda function
dotnet lambda deploy-function