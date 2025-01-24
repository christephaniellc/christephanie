#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as fs from 'fs'
import { ApiStack } from '../stacks/api-stack';
import { FrontendStack } from '../stacks/frontend-stack';
import { DatabaseStack } from '../stacks/database-stack';
import { AuthStack } from '../stacks/auth-stack';
import { DnsStack } from '../stacks/dns-stack';
import { CertificateStack } from '../stacks/certificate-stack';

const app = new cdk.App();

//----------------------------------------------------------------
// Set up environment configuration
//----------------------------------------------------------------
const env = app.node.tryGetContext('env') || process.env.ENV || 'dev';
const configFile = `../env/${env}.json`;
if (!fs.existsSync(configFile)) {
  throw new Error(`Configuration file ${configFile} not found`);
}
const config = require(`../env/${env}.json`);

console.log(`Loaded configuration for ${env} environment:`, config);

//----------------------------------------------------------------
// Set up Route 53 hosted zone and ACM certificates
//----------------------------------------------------------------
const certificateStack = new CertificateStack(app, `CertificateStack-${env}`, { env: config });

//----------------------------------------------------------------
// Set up S3 and CloudFront
//----------------------------------------------------------------
const frontendStack = new FrontendStack(app, `FrontendStack-${env}`, { 
  env: config, 
  certificate: certificateStack.certificate 
});

//----------------------------------------------------------------
// Set up domain and DNS records
//----------------------------------------------------------------
new DnsStack(app, `DnsStack-${env}`, { 
  env: config, 
  certificate: certificateStack.certificate, 
  fullDomainName: certificateStack.fullDomainName, 
  hostedZone: certificateStack.hostedZone,
  cloudFrontDistribution: frontendStack.cloudFrontDistribution
});

//----------------------------------------------------------------
// Set up authorizer Lambda
//----------------------------------------------------------------
const authStack = new AuthStack(app, `AuthStack-${env}`, { env: config });

//----------------------------------------------------------------
// Set up API Gateway and Lambdas
//----------------------------------------------------------------
new ApiStack(app, `ApiStack-${env}`, { 
  env: config, 
  httpLambdaAuthorizer: authStack.httpLambdaAuthorizer 
});

//----------------------------------------------------------------
// Set up DynamoDB
//----------------------------------------------------------------
new DatabaseStack(app, `DatabaseStack-${env}`, { env: config });