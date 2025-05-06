#!/bin/bash
# Set environment variable (passed as an argument or default to 'dev')
ENV=${1:-dev}

echo "Starting deployment for environment: $ENV"

# Deploy the AWS CDK stack with the specified environment
export ENV=$ENV

cdk deploy --require-approval never --context env=$ENV --profile $ENV

if [ $? -eq 0 ]; then
  echo "Deployment successful!"
else
  echo "Deployment failed!"
  exit 1
fi