#!/bin/bash
# Set environment variable (passed as an argument or default to 'dev')
ENV=${1:-dev}

echo "Starting hosted zone deployment for environment: $ENV"

# Deploy the AWS CDK stack with the specified environment
export ENV=$ENV

cdk deploy HostedzoneStack-create-$ENV --context env=$ENV --profile $ENV

if [ $? -eq 0 ]; then
  echo "Hosted zone deployment successful!"
else
  echo "Hosted zone deployment failed!"
  exit 1
fi
