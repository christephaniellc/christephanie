import * as cdk from 'aws-cdk-lib';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { EnvStackProps } from './config/env-config';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { ApplicationProps } from './config/application-config';

export class CertificateStack extends cdk.Stack {
    public readonly hostedZone: IHostedZone;
    public readonly certificate: certificatemanager.Certificate;
    public readonly fullDomainName: string;

    constructor(scope: Construct, id: string, props: EnvStackProps) {
      super(scope, id, props);
      
    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName } = ApplicationProps;
    
    // E.g., dev.wedding.christephanie.com      DEV
    // E.g., wedding.christephanie.com          PROD
    this.fullDomainName = `${props.env.subDomainPrefix}.${props.env.domainName}`;

    // In AWS: create a Route 53 hosted zone for the domain (if not already existing).
    // Hosted zones are containers in Route 53 that hold DNS records for a domain
    this.hostedZone = HostedZone.fromLookup(this, `${applicationName}-hosted-zone`, {
        domainName: props.env.domainName,  // Example: 'example.com'
    });

    // Create a new certificate with base domain name and full domain name
    this.certificate = new Certificate(this, `${applicationName}-certificate-${environment}`, {
        domainName: `${this.fullDomainName}`,
        subjectAlternativeNames: [
            `*.${this.fullDomainName}`
        ],
        validation: CertificateValidation.fromDns(this.hostedZone),
    });

    // Print outputs
    new cdk.CfnOutput(this, 'FullDomainName', { 
        value: this.fullDomainName });

    new cdk.CfnOutput(this, 'CertificateArn', { 
        value: this.certificate.certificateArn });

    new cdk.CfnOutput(this, 'HostedZoneId', {
        value: this.hostedZone.hostedZoneId,
        description: 'Route 53 Hosted Zone ID',
    });
  }
}