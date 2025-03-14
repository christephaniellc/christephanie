import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { LambdaConfig } from '../config/lambda-config';
import { ApplicationProps } from '../config/application-config';

export function attachIamPoliciesToRole(stack: cdk.Stack, environment: string, lambdaConfig: LambdaConfig, account: string, region: string): iam.IRole {
    console.log(`Attaching IAM policies for Lambda: ${lambdaConfig.name}`);

    const { applicationName } = ApplicationProps;
    
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
                    "dynamodb:Scan",
                    "dynamodb:DescribeTable"
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
            }),

            // Attach S3 permissions
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    "s3:PutObject", 
                    "s3:GetObject", 
                    "s3:ListBucket",
                    "s3:DeleteObject"
                ],
                resources: [
                    `arn:aws:s3:::${applicationName}-setup-${environment}`,
                    `arn:aws:s3:::${applicationName}-setup-${environment}/*`
                ]
            }),

            // Attach Simple messaging service permissions
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    "sns:Publish"
                ],
                resources: ["*"]
            }),
            // Attach Simple email messaging service permissions
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    "ses:SendEmail"
                ],
                resources: ["*"]
            }),
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