import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { LambdaConfig } from '../config/lambda-config';

export function attachIamPoliciesToRole(stack: cdk.Stack, lambdaConfig: LambdaConfig, account: string, region: string): iam.IRole {
    console.log(`Attaching IAM policies for Lambda: ${lambdaConfig.name}`);

    const lambdaRole = new iam.Role(stack, `${lambdaConfig.name}-Role`, {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
        description: `IAM Role for ${lambdaConfig.name}`
    });

    // Attach IAM permissions for DynamoDB
    const lambdaPolicy = new iam.Policy(stack, `${lambdaConfig.name}-Policy`, {
        statements: [
            // Attach IAM permissions for DynamoDB
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:Query",
                    "dynamodb:Scan"
                ],
                resources: [`arn:aws:dynamodb:${region}:${account}:table/*`]
            }),

            // Attach IAM permissions for SSM Parameter Store
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    "ssm:GetParameter",
                    "ssm:GetParameters",
                    "ssm:GetParametersByPath"
                ],
                resources: [`arn:aws:ssm:${region}:${account}:parameter/*`]
            }),

            // Attach CloudWatch permissions
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                resources: ["*"]
            })
        ]
    });

    lambdaPolicy.attachToRole(lambdaRole);

    console.log(`Added SSM Parameter Store permissions to Lambda: ${lambdaConfig.name}`);

    //----------------------------
    // Output
    //----------------------------
    new cdk.CfnOutput(stack, `${lambdaConfig.name}-RoleArn`, {
        value: `${lambdaRole.roleArn}`,
        description: `Custom role created for ${lambdaConfig.name}`,
    });

    return lambdaRole;
}