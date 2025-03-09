#!/bin/bash
# Set environment variable (passed as an argument or default to 'dev')
ENV=${1:-dev}

echo "Starting synth for environment: $ENV"

# Export environment variable for AWS CDK
export ENV=$ENV

# Synth the AWS CDK stack with the specified environment
cdk synth --context env=$ENV

if [ $? -eq 0 ]; then
  echo "Synth successful!"
else
  echo "Synth failed!"
  exit 1
fi
