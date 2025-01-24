import { Duration } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";

export const lambdaAuthDefaults = {
    runtime: Runtime.DOTNET_8,
    architecture: Architecture.X86_64,
    memorySize: 512,
    timeout: Duration.minutes(30),
 };