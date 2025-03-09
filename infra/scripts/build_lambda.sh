#!/bin/bash

# Set environment variable (passed as an argument or default to 'dev')
ENV=${1:-dev}

# Check if the Lambda project name is provided
if [ -z "$2" ]; then
  echo "Usage: $0 [env] <LambdaProjectName>"
  exit 1
fi

# Navigate to the backend Lambda directory
LAMBDA_NAME=$2
LAMBDA_PROJECT_PATH="../../backend/src/$LAMBDA_NAME"
OUTPUT_PATH="$LAMBDA_PROJECT_PATH/bin/Release/net8.0"
ZIP_FILE_PATH="$OUTPUT_PATH/lambda-deployment.zip"

# Ensure the directory exists
if [ ! -d "$LAMBDA_PROJECT_PATH" ]; then
  echo "Error: Lambda project directory '$LAMBDA_PROJECT_PATH' does not exist."
  exit 1
fi

echo "Building and publishing Lambda function '$LAMBDA_NAME' for environment: $ENV..."

# Clean previous builds
dotnet clean "$LAMBDA_PROJECT_PATH" -c Release

# Restore dependencies
dotnet restore "$LAMBDA_PROJECT_PATH"

# Publish the Lambda in Release mode to the output directory
dotnet publish "$LAMBDA_PROJECT_PATH" -c Release -o "$OUTPUT_PATH"

# Push to AWS
dotnet lambda deploy-function

# Check if the publish succeeded
if [ $? -ne 0 ]; then
  echo "Error: Lambda function build failed!"
  exit 1
fi

echo "Lambda function published to: $OUTPUT_PATH"

# Remove old zip file if it exists
if [ -f "$ZIP_FILE_PATH" ]; then
  rm "$ZIP_FILE_PATH"
fi

# Zip the published files, excluding .pdb files
cd "$OUTPUT_PATH" || exit
zip -r "$ZIP_FILE_PATH" . -x "*.pdb"

# Check if the zip was created successfully
if [ $? -ne 0 ]; then
  echo "Error: Failed to create ZIP archive."
  exit 1
fi

echo "Lambda deployment package created: $ZIP_FILE_PATH"