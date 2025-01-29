import { Construct } from 'constructs';
import { lambdaDefaults } from './config/lambda-config';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as auth from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as lambdaAws from 'aws-cdk-lib/aws-lambda';
import * as apigatewayintegration from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export interface AllStackProps extends EnvStackProps {
    httpLambdaAuthorizer: auth.HttpLambdaAuthorizer;
  }

export class ApiStack extends cdk.Stack {
  public readonly apiGateway: apigateway.HttpApi;

  constructor(scope: Construct, id: string, props: AllStackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('env') || 'dev'; 
    const { applicationName, apiGatewayName, srcFolder, releaseFolder } = ApplicationProps;
    console.log("------------------------");
    console.log("ApiStack");
    
    //----------------------------
    // CREATE API PROXY GATEWAY
    //----------------------------
    this.apiGateway = new apigateway.HttpApi(this, `${applicationName}-http-api`, {
        apiName: `${apiGatewayName}`,
        description: `API for ${applicationName} website`,
        createDefaultStage: false,
    });
    console.log(`HttpApi: ${this.apiGateway.apiEndpoint}`);

    const stage = new apigateway.HttpStage(this, `${applicationName}-http-stage-${environment}`, {
        httpApi: this.apiGateway,
        stageName: environment,
        autoDeploy: true,
    });
    (this.apiGateway as any).defaultStage = stage;

    console.log(`HttpStage: ${stage.stageName}`);

    console.log('API Gateway URL:', this.apiGateway.apiEndpoint);
    console.log('API Gateway URL:', this.apiGateway.url);
    console.log('API Gateway Endpoint + stage:', `${this.apiGateway.apiEndpoint}/${stage.stageName}`,)

    const lambdas = [
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Create', method: apigateway.HttpMethod.PUT, path: `/admin/familyunit/create` },
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Get', method: apigateway.HttpMethod.GET, path: `/admin/familyunit/{interested}` },
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Update', method: apigateway.HttpMethod.POST, path: `/admin/familyunit` },
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Delete', method: apigateway.HttpMethod.DELETE, path: `/admin/familyunit/{invitationCode}` },
        { name: 'Wedding.Lambdas.User.Get', method: apigateway.HttpMethod.GET, path: `/user/me` },
        { name: 'Wedding.Lambdas.User.Find', method: apigateway.HttpMethod.GET, path: `/user/find` },
        { name: 'Wedding.Lambdas.FamilyUnit.Get', method: apigateway.HttpMethod.GET, path: `/familyunit` },
        { name: 'Wedding.Lambdas.FamilyUnit.Update', method: apigateway.HttpMethod.POST, path: `/familyunit` },
        { name: 'Wedding.Lambdas.Validate.Address', method: apigateway.HttpMethod.POST, path: `/validate/address` },
        { name: 'Wedding.Lambdas.Helloworld', method: apigateway.HttpMethod.POST, path: `/helloworld` },
      ];

    lambdas.forEach(lambda => {
        console.log(`Lambda name: ${lambda.name.toLowerCase()}`);
        const functionLambdaName = lambda.name.toLowerCase().replace(/\./g, '-').replace("wedding-lambdas", "");
        const functionName = `${apiGatewayName}${functionLambdaName}-${environment}`;
        console.log(`Lambda function name: ${functionName}`);

        const lambdaFunction = new lambdaAws.Function(this, `${lambda.name.replace(/\./g, '-')}-function`, {
            ...lambdaDefaults,
            handler: `${lambda.name}::${lambda.name}.Function::FunctionHandler`,
            functionName: `${functionName}`,
            code: lambdaAws.Code.fromAsset(`${srcFolder}/${lambda.name}/${releaseFolder}/${lambda.name}.zip`)
        });            
        console.log(`Lambda function arn: ${lambdaFunction.functionArn}`);

    this.apiGateway.addRoutes({
        path: lambda.path,
        methods: [lambda.method],
        integration: new apigatewayintegration.HttpLambdaIntegration(`${lambda.name.replace(/\./g, '-')}-integration`, lambdaFunction, {
            payloadFormatVersion: apigateway.PayloadFormatVersion.VERSION_2_0,
        }),
        authorizer: props.httpLambdaAuthorizer,
        });
        console.log(`Lambda ${lambda.name} bound to API Gateway with Authorizer ID: ${props.httpLambdaAuthorizer.authorizerId}`);
    });

    const httpApiUrl = `https://${this.apiGateway.httpApiId}.execute-api.${this.region}.amazonaws.com/${stage.stageName}`;
    console.log(`HttApiUrl: ${httpApiUrl}`);

    //----------------------------
    // Output
    //----------------------------
     // Output the stage-specific API URL
    new cdk.CfnOutput(this, 'ApiEndpoint', {
        value: `${this.apiGateway.apiEndpoint}/${stage.stageName}`,
        description: 'The HTTP API dev stage endpoint',
    });

    // Manually construct the API URL since `httpApi.url` might be undefined
    new cdk.CfnOutput(this, 'HttpApiUrl', {
        value: httpApiUrl,
        description: 'The HTTP API endpoint URL',
    });
  }
}
