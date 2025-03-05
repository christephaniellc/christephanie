import { Construct } from 'constructs';
import { LambdaConfig, lambdaDefaults } from './config/lambda-config';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import { attachIamPoliciesToRole } from './helpers/iam-helper';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as auth from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayintegration from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { Duration } from 'aws-cdk-lib';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';

export interface AllStackProps extends EnvStackProps {
    httpLambdaAuthorizer: auth.HttpLambdaAuthorizer;
  }

export class ApiStack extends cdk.Stack {
  public readonly apiGateway: apigateway.HttpApi;

  constructor(scope: Construct, id: string, props: AllStackProps) {
    super(scope, id, {...props, description: "Creates API Gateway (retained on destroy), and maps routes to new Lambda integrations"});

    const environment = this.node.tryGetContext('env') || 'dev'; 
    const { applicationName, apiGatewayName, srcFolder, releaseFolder } = ApplicationProps;
    console.log("------------------------");
    console.log("ApiStack");
    
    //----------------------------
    // CREATE API PROXY GATEWAY
    //----------------------------
    const corsOptions = props.env.allowOrigins ?
    {
        corsPreflight: {
        allowOrigins: props.env.allowOrigins,
        allowHeaders: ['authorization', 'content-type'],
        allowMethods: [apigateway.CorsHttpMethod.ANY], // *
        allowCredentials: true,
        },
    } : {};

    this.apiGateway = new apigateway.HttpApi(this, `${applicationName}-http-api`, {
        apiName: `${apiGatewayName}-${environment}`,
        description: `API for ${applicationName}-${environment} website`,
        createDefaultStage: false,
        ...corsOptions
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

    const lambdaConfigs: LambdaConfig[] = [
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Create', method: apigateway.HttpMethod.PUT, path: `/admin/familyunit/create` },
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Get', method: apigateway.HttpMethod.GET, path: `/admin/familyunit/all` },
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Update', method: apigateway.HttpMethod.POST, path: `/admin/familyunit` },
        { name: 'Wedding.Lambdas.Admin.FamilyUnit.Delete', method: apigateway.HttpMethod.DELETE, path: `/admin/familyunit/{invitationCode}` },
        { name: 'Wedding.Lambdas.User.Get', method: apigateway.HttpMethod.GET, path: `/user/me`, keepWarm: true },
        { name: 'Wedding.Lambdas.FamilyUnit.Get', method: apigateway.HttpMethod.GET, path: `/familyunit`, keepWarm: true },
        { name: 'Wedding.Lambdas.FamilyUnit.Update', method: apigateway.HttpMethod.POST, path: `/familyunit`, keepWarm: true },
        { name: 'Wedding.Lambdas.FamilyUnit.Patch', method: apigateway.HttpMethod.PATCH, path: `/familyunit`, keepWarm: true },
        { name: 'Wedding.Lambdas.Guest.Patch', method: apigateway.HttpMethod.PATCH, path: `/guest`, keepWarm: true },
        { name: 'Wedding.Lambdas.Guest.MaskedValues.Get', method: apigateway.HttpMethod.GET, path: `/guest/maskedvalues`, keepWarm: true },
        { name: 'Wedding.Lambdas.Validate.Address', method: apigateway.HttpMethod.POST, path: `/validate/address`, keepWarm: true },
        { name: 'Wedding.Lambdas.Validate.Phone', method: apigateway.HttpMethod.POST, path: `/validate/phone`, keepWarm: true },
        { name: 'Wedding.Lambdas.User.Find', method: apigateway.HttpMethod.GET, path: `/user/find`, unauthorized: true, keepWarm: true },
        { name: 'Wedding.Lambdas.Helloworld', method: apigateway.HttpMethod.GET, path: `/helloworld`, unauthorized: true },
        { name: 'Wedding.Lambdas.Admin.Setup', method: apigateway.HttpMethod.PUT, path: `/admin/setup`, unauthorized: true },
      ];

      lambdaConfigs.forEach(lambdaConfig => {
        console.log(`Lambda name: ${lambdaConfig.name.toLowerCase()}`);
        const functionLambdaName = lambdaConfig.name.toLowerCase().replace(/\./g, '-').replace("wedding-lambdas", "");
        const functionName = `${apiGatewayName}${functionLambdaName}`;
        console.log(`Lambda function name: ${functionName}`);

        const lambdaRole = attachIamPoliciesToRole(this, environment, lambdaConfig, props.env.account, props.env.region);

        const lambdaFunction = new lambda.Function(this, `${lambdaConfig.name.replace(/\./g, '-')}-function`, {
            ...lambdaDefaults,
            handler: `${lambdaConfig.name}::${lambdaConfig.name}.Function::FunctionHandler`,
            functionName: `${functionName}`,
            role: lambdaRole
        });            
        console.log(`Lambda function arn: ${lambdaFunction.functionArn}`);

        if (lambdaConfig.keepWarm)
        {
            // Create an EventBridge rule to run every 5 minutes, to prevent lambda coldboots
            const warmUpRule = new Rule(this, `WarmUpRule${functionLambdaName}`, {
                schedule: Schedule.rate(Duration.minutes(5)), 
                ruleName: `WarmUpRule${functionLambdaName}`
            });
    
            // Set the Lambda as the target of that rule
            warmUpRule.addTarget(new LambdaFunction(lambdaFunction));
            console.log(`Warmup rule arn: ${warmUpRule.ruleArn}`);
        }

        // Set up API gateway route
        this.apiGateway.addRoutes({
            path: lambdaConfig.path!,
            methods: [lambdaConfig.method!],
            integration: new apigatewayintegration.HttpLambdaIntegration(`${lambdaConfig.name.replace(/\./g, '-')}-integration`, lambdaFunction, {
                payloadFormatVersion: apigateway.PayloadFormatVersion.VERSION_2_0,
            }),
            ...(lambdaConfig.unauthorized ? {} : { authorizer: props.httpLambdaAuthorizer }),
            });

        if (!lambdaConfig.unauthorized) {
            console.log(`Lambda ${lambdaConfig.name} bound to API Gateway with Authorizer ID: ${props.httpLambdaAuthorizer.authorizerId}`);
        }
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