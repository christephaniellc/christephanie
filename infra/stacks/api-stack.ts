import * as cdk from 'aws-cdk-lib';
import { HttpApi, HttpMethod, HttpStage, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2';
import { Function,  Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { lambdaDefaults } from './config/lambda-config';
import { EnvStackProps } from './config/env-config';
import { PublishProps } from './config/publish-config';
import { HttpLambdaAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { ApplicationProps } from './config/application-config';

export interface AllStackProps extends EnvStackProps {
    httpLambdaAuthorizer: HttpLambdaAuthorizer;
  }

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AllStackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('env') || 'dev'; 
    const { srcFolder, releaseFolder } = PublishProps; 
    const { applicationName, apiGatewayName } = ApplicationProps;
    const httpLambdaAuthorizer = props.httpLambdaAuthorizer;
    
    //----------------------------
    // CREATE API PROXY GATEWAY
    //----------------------------
    const httpApi = new HttpApi(this, `${applicationName}-http-api`, {
        apiName: `${apiGatewayName}`,
        description: `API for ${applicationName} website`,
        createDefaultStage: false,
    });

    const stage = new HttpStage(this, `${applicationName}-http-stage-${environment}`, {
        httpApi: httpApi,
        stageName: environment,
        autoDeploy: true,
    });

    const lambdas = [
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Create', method: HttpMethod.PUT, path: `/admin/familyunit/create` },
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Get', method: HttpMethod.GET, path: `/admin/familyunit/{interested}` },
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Update', method: HttpMethod.POST, path: `/admin/familyunit` },
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Delete', method: HttpMethod.DELETE, path: `/admin/familyunit/{invitationCode}` },
        { name: 'Wedding.Lambdas.User.Get', method: HttpMethod.GET, path: `/user/me` },
        { name: 'Wedding.Lambdas.User.Find', method: HttpMethod.GET, path: `/user/find` },
        { name: 'Wedding.Lambdas.FamilyUnit.Get', method: HttpMethod.GET, path: `/familyunit` },
        { name: 'Wedding.Lambdas.FamilyUnit.Update', method: HttpMethod.POST, path: `/familyunit` },
        { name: 'Wedding.Lambdas.Validate.Address', method: HttpMethod.POST, path: `/validate/address` },
        { name: 'Wedding.Lambdas.Helloworld', method: HttpMethod.POST, path: `/helloworld` },
      ];

        lambdas.forEach(lambda => {
            const lambdaFunction = new Function(this, lambda.name, {
                ...lambdaDefaults,
                handler: `${lambda.name}::${lambda.name}.Function::FunctionHandler`,
                functionName: `${apiGatewayName}-${environment}-${lambda.name.toLowerCase().replace(/\./g, '-')}`,
                code: Code.fromAsset(`${srcFolder}/${lambda.name}/${releaseFolder}/lambda-deployment.zip`)
        });

        httpApi.addRoutes({
            path: lambda.path,
            methods: [lambda.method],
            integration: new HttpLambdaIntegration(`${lambdaFunction.functionName}-integration`, lambdaFunction, {
              payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
            }),
            authorizer: httpLambdaAuthorizer,
          });
    });

    //----------------------------
    // Output
    //----------------------------
    // Output the API Gateway URL after deployment for quick reference
    new cdk.CfnOutput(this, 'HttpApiUrl', {
        value: httpApi.url!,
        description: 'The HTTP API endpoint URL',
    });

    // Output the stage-specific API URL
    new cdk.CfnOutput(this, 'ApiEndpoint', {
        value: `${httpApi.apiEndpoint}/${stage.stageName}`,
        description: 'The HTTP API dev stage endpoint',
    });
  }
}
