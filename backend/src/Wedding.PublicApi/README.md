```
cd "D:\dev\github\christephanie\backend\src\Wedding.PublicApi"
dotnet lambda deploy-function -c Release --msbuild-parameters "/p:DebugType=None /p:PublishDir=./publish"

dotnet publish -c Release -o ./publish /p:DebugType=None
zip -r publish/lambda-deployment.zip publish/.
dotnet lambda deploy-function
```