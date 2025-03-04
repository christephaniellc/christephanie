import { Duration } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as iam from 'aws-cdk-lib/aws-iam';

export const lambdaDefaults = {
    runtime: Runtime.DOTNET_8,
    architecture: Architecture.X86_64,
    memorySize: 512,
    timeout: Duration.seconds(30),
 };
 
export const lambdaAuthDefaults = {
    runtime: Runtime.DOTNET_8,
    architecture: Architecture.X86_64,
    memorySize: 512,
    timeout: Duration.minutes(15),
 };

 export interface LambdaConfig {
    name: string;
    method?: apigateway.HttpMethod;
    path?: string;
    unauthorized?: boolean;
    keepWarm?: boolean;
}