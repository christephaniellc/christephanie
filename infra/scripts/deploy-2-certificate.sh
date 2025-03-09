#!/bin/bash
# Set environment variable (passed as an argument or default to 'dev')
ENV=${1:-dev}

echo "Starting certificate deployment for environment: $ENV"

# Deploy the AWS CDK stack with the specified environment
export ENV=$ENV

cdk deploy CertificateStack-create-$ENV --context env=$ENV --profile $ENV

if [ $? -eq 0 ]; then
  echo "Certificate deployment successful!"
else
  echo "Certificate deployment failed!"
  exit 1
fi
