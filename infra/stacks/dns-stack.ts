import { Construct } from 'constructs';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';

export interface DnsStackProps extends EnvStackProps {
    hostedZone: route53.IHostedZone;
    certificate: certificatemanager.ICertificate;
    fullDomainName: string;
    frontendUrl: string;
    apiUrl: string;
    cloudFrontDistribution: cdk.aws_cloudfront.Distribution;
    apiGateway: apiGateway.HttpApi;
  }

export class DnsStack extends cdk.Stack {
    public readonly apiDomainName: apiGateway.IDomainName;
  
    constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, {...props, description: "Creates a custom domain name for API Gateway, and adds DNS ARecords for frontend and api URLs"});   

    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName, domainName, apiRoute, srcFolder, releaseFolder } = ApplicationProps;
    console.log("------------------------");
    console.log("DnsStack");

    console.log(`Certificate: ${props.certificate}`);
    console.log(`HostedZone: ${props.hostedZone}`);
    console.log(`FullDomainName: ${props.fullDomainName}`);
    console.log(`FrontendUrl: ${props.frontendUrl}`);
    console.log(`ApiUrl: ${props.apiUrl}`);
    console.log(`Hosted zone name servers (${props.env.delegateHostedNameServers?.length || 0}): ${props.env.delegateHostedNameServers?.join(',') || 'No NS found'}`);
    console.log(`CloudfrontDistribution: ${props.cloudFrontDistribution}`);
    console.log(`ApiGateway: ${apiGateway}`);

    if (props.env.delegateHostedNameServers && props.env.delegateHostedNameServers.length > 0)     {
        console.log(`Adding dev subdomain nameserver delegation record, namservers: ${props.env.delegateHostedNameServers?.join(',') || 'NS not found'}`);
        new route53.RecordSet(this, `${applicationName}-dev-subdomain-delegation`, {
            zone: props.hostedZone,
            recordType: route53.RecordType.NS,
            target: route53.RecordTarget.fromValues(...props.env.delegateHostedNameServers),
            recordName: 'ns.dev-delegation',
        });
    }
    else {
        console.log(`INFO: No subdomain nameserver delegation records found.`);
    }

    // Create an A record for the API Gateway custom domain.
    // Instead of using AWS-generated URLs for your API Gateway (e.g., abc123.execute-api.us-east-1.amazonaws.com), 
    // we create a friendly custom domain like api.example.com.

    // Add DNS record for CloudFront (Frontend)
    const frontendTarget = route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(props.cloudFrontDistribution));
    const frontendARecord = new route53.ARecord(this, `${applicationName}-dns-frontend-record`, {
        zone: props.hostedZone,
        recordName: `www.${props.fullDomainName}`, // E.g., www.example.com
        target: frontendTarget,
      });
  
    // ADD CUSTOM DOMAIN NAME to API GATEWAY
    console.log(`Creating new API Gateway domain name alias (${props.apiUrl}) with certificate: ${props.certificate.certificateArn}`);
    // Add DNS record for API Gateway (API)
    this.apiDomainName = new apiGateway.DomainName(this, `${applicationName}-api-gateway-domain-name-${environment}`, {
        domainName: props.apiUrl,  // E.g, api.example.com
        certificate: props.certificate
        });
        
    // Map HttpApi API Gateway to this domain name
    new apiGateway.ApiMapping(this, `${applicationName}-apigateway-mapping`, {
        api: props.apiGateway,
        domainName: this.apiDomainName,
        stage: props.apiGateway.defaultStage
        });

    console.log(`RegionalDomainName: ${this.apiDomainName.regionalDomainName}`);
    console.log(`HostedZoneId: ${this.apiDomainName.regionalHostedZoneId}`);

    const apiGatewayARecord = new route53.ARecord(this, `${applicationName}-dns-api-record`, {
        zone: props.hostedZone,
        recordName: `${apiRoute}.${props.fullDomainName}`,
        target: route53.RecordTarget.fromAlias({
            bind: () => ({
                dnsName: this.apiDomainName.regionalDomainName,
                hostedZoneId: this.apiDomainName.regionalHostedZoneId,
            }),
        })
      });
      
    // Print outputs
    new cdk.CfnOutput(this, 'ApiGatewayDomainUrl', {
      value: `https://${this.apiDomainName.regionalDomainName}`,
      description: 'Custom API Gateway Domain URL',
    });
    new cdk.CfnOutput(this, 'ApiGatewayARecordDomainName', {
      value: `https://${apiGatewayARecord.domainName}`
    });
    new cdk.CfnOutput(this, 'FrontendARecordDomainName', {
      value: `https://${frontendARecord.domainName}`
    });
  }
}
