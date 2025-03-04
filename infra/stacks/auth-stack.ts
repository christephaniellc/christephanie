import { Construct } from 'constructs';
import { lambdaAuthDefaults, LambdaConfig } from './config/lambda-config';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { attachIamPoliciesToRole } from './helpers/iam-helper';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { Duration } from 'aws-cdk-lib';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';

export class AuthStack extends cdk.Stack {
  public readonly httpLambdaAuthorizer: apigateway.HttpLambdaAuthorizer;

  constructor(scope: Construct, id: string, props: EnvStackProps) {
    super(scope, id, {...props, description: "Creates Lambda authorizer integration for API Gateway"});

    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName, srcFolder, releaseFolder } = ApplicationProps;
    const { apiGatewayName } = ApplicationProps;
    console.log("------------------------");
    console.log("AuthStack");

    const lambdaConfig: LambdaConfig = {
        name: 'Wedding.Lambdas.Authorize'
    };
    const functionLambdaName = lambdaConfig.name.toLowerCase().replace(/\./g, '-').replace("wedding-lambdas", "");
    const functionName = `${apiGatewayName}${functionLambdaName}`;
    const lambdaRole = attachIamPoliciesToRole(this, environment, lambdaConfig, props.env.account, props.env.region);

    const authorizerLambda = new lambda.Function(this, lambdaConfig.name, {
      ...lambdaAuthDefaults,
      handler: `${lambdaConfig.name}::${lambdaConfig.name}.Function::FunctionHandler`,
      functionName: `${functionName}`,
      code: lambda.Code.fromAsset(`${srcFolder}/${lambdaConfig.name}/${releaseFolder}/${lambdaConfig.name}.zip`),
      role: lambdaRole
    });

    // Create an EventBridge rule to run every 5 minutes, to prevent lambda coldboots
    const warmUpRule = new Rule(this, `WarmUpRule${functionLambdaName}`, {
        schedule: Schedule.rate(Duration.minutes(5)),  
        ruleName: `WarmUpRule${functionLambdaName}`
    });
      
    // Set the Lambda as the target of that rule
    warmUpRule.addTarget(new LambdaFunction(authorizerLambda));
    console.log(`Warmup rule arn: ${warmUpRule.ruleArn}`);

    // Create the HTTP Lambda Authorizer
    this.httpLambdaAuthorizer = new apigateway.HttpLambdaAuthorizer(`${apiGatewayName}-${environment}-authorize`, authorizerLambda, {
      responseTypes: [apigateway.HttpLambdaResponseType.IAM],
      identitySource: ['$request.header.Authorization'],
      resultsCacheTtl: cdk.Duration.seconds(0)
    });

    // Output
    new cdk.CfnOutput(this, 'AuthorizerFunctionName', {
      value: authorizerLambda.functionName,
      description: 'The Authorizer Lambda Function Name',
    });
  }
}
