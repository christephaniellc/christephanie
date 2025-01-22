cd "C:\development\github\Christephanie\christephanie\backend\src"
# Define the path where the lambda projects are located
$lambdaProjectsPath = Get-ChildItem -Directory | Where-Object { $_.Name -like "Wedding.Lambdas.*" }

# Path to the deploy-lambda.bat script
$deployScript = "deploy-lambda.bat"

# Loop through each lambda project folder and run the deploy script
foreach ($project in $lambdaProjectsPath) {
    $workingDir = $project.FullName
    Write-Host "Deploying Lambda in: $workingDir"
    
    # Run the batch script with the project directory as an argument
    & cmd.exe /c "$deployScript `"$workingDir`""

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Deployment failed for $($project.Name). Exiting script."
        exit 1
    }
}

Write-Host "All Lambda functions deployed successfully."