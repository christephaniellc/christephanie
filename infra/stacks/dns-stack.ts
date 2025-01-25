import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ARecord, RecordTarget, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { DomainName } from 'aws-cdk-lib/aws-apigatewayv2';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53_targets from 'aws-cdk-lib/aws-route53-targets';

export interface DnsStackProps extends EnvStackProps {
    hostedZone: IHostedZone;
    certificate: certificatemanager.Certificate;
    fullDomainName: string;
    cloudFrontDistribution: cdk.aws_cloudfront.Distribution;
  }

export class DnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName, apiRoute } = ApplicationProps;

    // Create an A record for the API Gateway custom domain.
    // Instead of using AWS-generated URLs for your API Gateway (e.g., abc123.execute-api.us-east-1.amazonaws.com), 
    // we create a friendly custom domain like api.example.com.
    const apiDomain = new DomainName(this, `${applicationName}-api-gateway-domain-name-${environment}`, {
      domainName: `${apiRoute}.${props.fullDomainName}`,  // Example: api.example.com
      certificate: props.certificate,
    });

    // ARecord maps the domain/subdomain to an AWS service (API Gateway, CloudFront, or an IP address).
    // We're adding an ARecord to point the custom domain (api.example.com) to the API Gateway endpoint.
    // Optionally, we're adding another ARecord for frontend hosting (e.g., www.example.com) pointing to CloudFront.
    new ARecord(this, `${applicationName}-ApiARecord-${environment}`, {
      zone: props.hostedZone,
      recordName: `${apiRoute}.${props.fullDomainName}`,
      target: RecordTarget.fromAlias({
        bind: () => ({
          dnsName: apiDomain.regionalDomainName,
          hostedZoneId: apiDomain.regionalHostedZoneId,
        }),
      }),
    });
    new ARecord(this, `${applicationName}-FrontendAliasRecord-${environment}`, {
        zone: props.hostedZone,
        recordName: `www.${props.fullDomainName}`,
        target: route53.RecordTarget.fromAlias(
            new route53_targets.CloudFrontTarget(props.cloudFrontDistribution)),
    });

    // Print outputs
    new cdk.CfnOutput(this, 'ApiGatewayDomainUrl', {
      value: `https://${apiDomain.regionalDomainName}`,
      description: 'Custom API Gateway Domain URL',
    });
  }
}
