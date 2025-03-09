#!/bin/bash

# Set environment variable (passed as an argument or default to 'dev')
ENV=${1:-dev}

echo "Building lambdas for environment: $ENV"
export ENV=$ENV

# Run the build script for all lambdas
./build_lambda.sh $ENV Wedding.Lambdas.Authorize 
./build_lambda.sh $ENV Wedding.Lambdas.Admin.FamilyUnit.Create
./build_lambda.sh $ENV Wedding.Lambdas.Admin.FamilyUnit.Delete
./build_lambda.sh $ENV Wedding.Lambdas.Admin.FamilyUnit.Get
./build_lambda.sh $ENV Wedding.Lambdas.Admin.FamilyUnit.Update
./build_lambda.sh $ENV Wedding.Lambdas.FamilyUnit.Get
./build_lambda.sh $ENV Wedding.Lambdas.FamilyUnit.Update
./build_lambda.sh $ENV Wedding.Lambdas.User.Find
./build_lambda.sh $ENV Wedding.Lambdas.User.Get
./build_lambda.sh $ENV Wedding.Lambdas.Validate.Address
./build_lambda.sh $ENV Wedding.Lambdas.Helloworld
# TODO all lambdas

#for lambda in Wedding.Lambdas.*; do
#  ./build_lambda.sh $ENV "$lambda"
#done

if [ $? -ne 0 ]; then
  echo "Error: Build failed, stopping deployment."
  exit 1
fi