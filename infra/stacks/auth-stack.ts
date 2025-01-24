import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Function, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { lambdaAuthDefaults } from './config/lambda-auth-config';
import { EnvStackProps } from './config/env-config';
import { PublishProps } from './config/publish-config';
import { ApplicationProps } from './config/application-config';

export class AuthStack extends cdk.Stack {
  public readonly httpLambdaAuthorizer: HttpLambdaAuthorizer;

  constructor(scope: Construct, id: string, props: EnvStackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('env') || 'dev';
    const authorizerName = 'Wedding.Lambdas.Authorize';
    const { srcFolder, releaseFolder } = PublishProps;
    const { apiGatewayName } = ApplicationProps;

    const authorizerLambda = new Function(this, authorizerName, {
      ...lambdaAuthDefaults,
      handler: `${authorizerName}::${authorizerName}.Function::FunctionHandler`,
      functionName: `${apiGatewayName}-${environment}-authorize`,
      code: Code.fromAsset(`${srcFolder}/${authorizerName}/${releaseFolder}/lambda-deployment.zip`),
    });

    // Create the HTTP Lambda Authorizer
    this.httpLambdaAuthorizer = new HttpLambdaAuthorizer(`${apiGatewayName}-${environment}-authorize`, authorizerLambda, {
      responseTypes: [HttpLambdaResponseType.IAM],
      identitySource: ['$request.header.Authorization'],
      resultsCacheTtl: Duration.minutes(5),
    });

    // Output
    new cdk.CfnOutput(this, 'AuthorizerFunctionName', {
      value: authorizerLambda.functionName,
      description: 'The Authorizer Lambda Function Name',
    });
  }
}
