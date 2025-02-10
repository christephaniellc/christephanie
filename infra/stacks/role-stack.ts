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
    super(scope, id, { ...props, description: "Creates GitHub deploy IAM role and OIDC provider" });

    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName } = ApplicationProps;
    const githubRepo = props.env.githubRepo;
    const awsAccountId = props.env.account;
    const awsRegion = props.env.region;
    const frontendBucketArn = `arn:aws:s3:::${props.frontendUrl}/*`;

    // Create GitHub OIDC Provider
    const oidcProvider = new OpenIdConnectProvider(this, 'GitHubOIDCProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1']
    });

    // IAM Role for GitHub Actions Deployments
    const githubActionsRole = new Role(this, `${applicationName}-githubdeploy-role-${environment}`, {
      assumedBy: new FederatedPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "StringLike": {
            "token.actions.githubusercontent.com:sub": [
              `repo:${githubRepo}:ref:refs/heads/main`,
              `repo:${githubRepo}:ref:refs/heads/main.dev`
            ]
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      roleName: "GitHubActionsDeployRole"
    });

    // Allow GitHub to Assume This Role
    githubActionsRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "sts:AssumeRole",
          "sts:AssumeRoleWithWebIdentity"
        ],
        resources: [`arn:aws:iam::${awsAccountId}:role/GitHubActionsDeployRole`]
      })
    );

    // Allow Lambda function updates
    githubActionsRole.addToPolicy(
      new PolicyStatement({
        actions: ["lambda:UpdateFunctionCode"],
        resources: [`arn:aws:lambda:${awsRegion}:${awsAccountId}:function:${applicationName}-api-*`]
      })
    );

    // Allow S3 uploads and deletions
    githubActionsRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "s3:PutObject", 
          "s3:ListBucket",
          "s3:DeleteObject"
        ],
        resources: [frontendBucketArn]
      })
    );

    // Allow CloudFront cache invalidation
    githubActionsRole.addToPolicy(
      new PolicyStatement({
        actions: ["cloudfront:CreateInvalidation"],
        resources: ["*"]
      })
    );

    // Attach AWS Managed Policies (Optional)
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
