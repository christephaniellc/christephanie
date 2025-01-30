#!/usr/bin/env node
import path = require('path');
import { ApiStack } from '../stacks/api-stack';
import { FrontendStack } from '../stacks/frontend-stack';
import { DatabaseStack } from '../stacks/database-stack';
import { AuthStack } from '../stacks/auth-stack';
import { DnsStack } from '../stacks/dns-stack';
import { CertificateStack } from '../stacks/certificate-stack';
import { HostedZoneStack } from '../stacks/hostedzone-stack';
import * as cdk from 'aws-cdk-lib';
import * as fs from 'fs'
import { ParamsStack } from '../stacks/params-stack';

const app = new cdk.App();

//----------------------------------------------------------------
// Set up environment configuration
//----------------------------------------------------------------
const env = app.node.tryGetContext('env'  ) || process.env.ENV || 'dev';
const configFile = path.join(__dirname, `../env/${env}.json`);
if (!fs.existsSync(configFile)) {
  throw new Error(`Configuration file ${configFile} not found`);
}
const config = require(`../env/${env}.json`);
console.log(`Loaded configuration for ${env} environment.`);

process.env.AWS_PROFILE = config.profile;
console.log(`Using AWS profile: ${process.env.AWS_PROFILE}`);

console.log('Deploying to Account:', config.account);
console.log('Deploying to Region:', config.region);

//----------------------------------------------------------------
// Retrieve hosted zone (shared resource)
//----------------------------------------------------------------
const hostedZoneStackType = config.existingHostedZoneId ? "update" : "create";
const hostedzoneStack = new HostedZoneStack(app, `HostedzoneStack-${hostedZoneStackType}-${env}`, { env: config });

//----------------------------------------------------------------
// Set up Route 53 hosted zone and ACM certificates
//----------------------------------------------------------------
const certificateStackType = config.existingCertificateArn ? "update" : "create";
const certificateStack = new CertificateStack(app, `CertificateStack-${certificateStackType}-${env}`, { env: config,
  hostedZone: hostedzoneStack.hostedZone,
  fullDomainName: hostedzoneStack.fullDomainName,
  frontendUrl: hostedzoneStack.frontendUrl,
  apiUrl: hostedzoneStack.apiUrl
 });

//----------------------------------------------------------------
// Set up S3 and CloudFront
//----------------------------------------------------------------
const frontendStack = new FrontendStack(app, `FrontendStack-${env}`, { 
  env: config, 
  certificate: certificateStack.certificate 
});

//----------------------------------------------------------------
// Set up authorizer Lambda
//----------------------------------------------------------------
const authStack = new AuthStack(app, `AuthStack-${env}`, { env: config });

//----------------------------------------------------------------
// Set up API Gateway and Lambdas
//----------------------------------------------------------------
const apiStack = new ApiStack(app, `ApiStack-${env}`, { 
  env: config, 
  httpLambdaAuthorizer: authStack.httpLambdaAuthorizer 
});

//----------------------------------------------------------------
// Set up domain and DNS records
//----------------------------------------------------------------
new DnsStack(app, `DnsStack-${env}`, { 
  env: config, 
  certificate: certificateStack.certificate, 
  fullDomainName: hostedzoneStack.fullDomainName, 
  hostedZone: hostedzoneStack.hostedZone,
  cloudFrontDistribution: frontendStack.cloudFrontDistribution,
  frontendUrl: hostedzoneStack.frontendUrl,
  apiUrl: hostedzoneStack.apiUrl,
  apiGateway: apiStack.apiGateway
});

//----------------------------------------------------------------
// Set up SSM Parameter Store
//----------------------------------------------------------------
new ParamsStack(app, `ParamsStack-${env}`, {
  env: config,
  apiUrl: hostedzoneStack.apiUrl
});

//----------------------------------------------------------------
// Set up DynamoDB
//----------------------------------------------------------------
new DatabaseStack(app, `DatabaseStack-${env}`, { env: config });