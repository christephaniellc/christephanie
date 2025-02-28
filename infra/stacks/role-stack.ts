import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Role, FederatedPrincipal, PolicyStatement, ManagedPolicy, OpenIdConnectProvider } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';

export interface RoleStackProps extends EnvStackProps {
    frontendUrl: string;
    apiUrl: string;
}

export class RoleStack extends Stack {
  constructor(scope: Construct, id: string, props: RoleStackProps) {
    super(scope, id, { ...props, description: "Creates GitHub deploy IAM role" });

    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName } = ApplicationProps;
    const githubRepo = props.env.githubRepo;

    // Define the GitHub OIDC provider if it doesn't exist
    const oidcProvider = new OpenIdConnectProvider(this, `${applicationName}-github-oidcprovider-${environment}`, {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    // Create IAM Role for GitHub Actions
    const githubActionsRole = new Role(this, `${applicationName}-githubdeploy-role-${environment}`, {
      assumedBy: new FederatedPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            "token.actions.githubusercontent.com:sub": `repo:${githubRepo}:ref:refs/heads/${props.env.githubBranch}`
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      roleName: "GitHubActionsDeployRole"
    });

    // Allow Lambda function updates
    githubActionsRole.addToPolicy(
      new PolicyStatement({
        actions: ["lambda:UpdateFunctionCode"],
        resources: [`arn:aws:lambda:${props.env.region}:${props.env.account}:function:${applicationName}-api-*`]
      })
    );

    // Allow S3 uploads
    githubActionsRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "s3:PutObject", 
          "s3:ListBucket",
          "s3:DeleteObject"
        ],
        resources: [
          `arn:aws:s3:::www.${props.frontendUrl}`,
          `arn:aws:s3:::www.${props.frontendUrl}/*`
        ]
      })
    );

    // Allow CloudFront cache invalidation
    githubActionsRole.addToPolicy(
      new PolicyStatement({
        actions: ["cloudfront:CreateInvalidation"],
        resources: ["*"]
      })
    );

    // Attach AWS managed policies if needed (e.g., CloudWatch)
    githubActionsRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess"));

    // OUTPUTS
    new cdk.CfnOutput(this, 'GitHubActionsDeployRole', { 
        value: githubActionsRole.roleArn
    });

    new cdk.CfnOutput(this, 'GitHubOIDCProviderArn', {
      value: oidcProvider.openIdConnectProviderArn
    });
  }
}