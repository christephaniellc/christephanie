#!/bin/bash
# Set environment variable (passed as an argument or default to 'dev')
ENV=${1:-dev}

echo "Starting teardown for environment: $ENV"

# Export environment variable for AWS CDK
export ENV=$ENV

# Destroy the AWS CDK stack with the specified environment
cdk destroy --all --force --context env=$ENV

if [ $? -eq 0 ]; then
  echo "Teardown successful!"
else
  echo "Teardown failed!"
  exit 1
fi
