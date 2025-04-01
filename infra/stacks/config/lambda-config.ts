import { Duration } from "aws-cdk-lib";
import { Architecture, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

// Create a dummy code asset that CDK can use as a placeholder
// This allows CDK to deploy without requiring the actual Lambda code
export const dummyAuthCode = Code.fromAsset(path.join(__dirname, '../dummy-auth-lambda'));
export const dummyCode = Code.fromAsset(path.join(__dirname, '../dummy-lambda'));

export const lambdaDefaults = {
    runtime: Runtime.DOTNET_8,
    architecture: Architecture.X86_64,
    memorySize: 512,
    timeout: Duration.seconds(30),
    code: dummyCode, // Add default dummy code
 };
 
export const lambdaAuthDefaults = {
    runtime: Runtime.DOTNET_8,
    architecture: Architecture.X86_64,
    memorySize: 512,
    timeout: Duration.minutes(15),
    code: dummyAuthCode, // Add default dummy code
 };

 export interface LambdaConfig {
    name: string;
    method?: apigateway.HttpMethod;
    methods?: apigateway.HttpMethod[]; // Allow multiple methods for a single Lambda
    path?: string;
    unauthorized?: boolean;
    keepWarm?: boolean;
    v1payload?: boolean;
}