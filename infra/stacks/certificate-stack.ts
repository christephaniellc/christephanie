import { Construct } from 'constructs';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';

export interface CertificateStackProps extends EnvStackProps {
    hostedZone: route53.IHostedZone;
    fullDomainName: string;
    frontendUrl: string;
    apiUrl: string;
}

export class CertificateStack extends cdk.Stack {
    public readonly certificate: certificatemanager.ICertificate;

    constructor(scope: Construct, id: string, props: CertificateStackProps) {
      super(scope, id, {...props, description: "Creates SSL certificate or uses existing"});

    const environment = this.node.tryGetContext('env') || 'dev';
      
    const { applicationName, domainName } = ApplicationProps;
    console.log("------------------------");
    console.log("CertificateStack");
    
    console.log(`Hosted zone id: ${props.hostedZone.hostedZoneId}`);
    console.log(`FullDomainName: ${props.fullDomainName}`);
    console.log(`FrontendUrl: ${props.frontendUrl}`);
    console.log(`ApiUrl: ${props.apiUrl}`);

    if (props.env.existingCertificateArn) {
        // Load existing certificate
        console.log(`Loading existing certificate: ${props.env.existingCertificateArn}`);
        this.certificate = certificatemanager.Certificate.fromCertificateArn(
                this,
                `${applicationName}-certificate-${environment}`,
                props.env.existingCertificateArn!
            );
        }
    else {
        // Create a new certificate with base domain name and full domain name
        console.log(`Creating new certificate...`);
        this.certificate = new certificatemanager.Certificate(this, `${applicationName}-certificate-${environment}`, {
            domainName: `${environment === 'prod' ? domainName : props.fullDomainName}`,
            subjectAlternativeNames: environment === 'prod' 
            ? [       
                `${domainName}`,            // christephanie.com
                `${props.fullDomainName}`,  // wedding.christephanie.com
                `${props.apiUrl}`,          // financeapi.wedding.christephanie.com
                `*.${domainName}`,          // *.christephanie.com
                `*.${props.fullDomainName}`,// *.wedding.christephanie.com
                `*.${props.apiUrl}`         // *.financeapi.wedding.christephanie.com
            ]
            : [
                `${props.apiUrl}`,          // financeapi.dev.wedding.christephanie.com
                `${props.fullDomainName}`,  // dev.wedding.christephanie.com
                `*.${props.fullDomainName}`,// *.dev.wedding.christephanie.com
                `*.${props.apiUrl}`         // *.financeapi.dev.wedding.christephanie.com
            ],
            validation: certificatemanager.CertificateValidation.fromDns(props.hostedZone),
        });
        (this.certificate as any).applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    }
    console.log(`Certificate arn: ${this.certificate.certificateArn}`);

    // Print outputs
    new cdk.CfnOutput(this, 'FullDomainName', { 
        value: props.fullDomainName });

    new cdk.CfnOutput(this, 'CertificateArn', { 
        value: this.certificate.certificateArn });

    new cdk.CfnOutput(this, 'HostedZoneId', {
        value: props.hostedZone.hostedZoneId,
        description: 'Route 53 Hosted Zone ID',
    });

    new cdk.CfnOutput(this, 'EnvJsonHostedZoneId', {
        value: `"existingCertificateArn": "${this.certificate.certificateArn}"`,
        description: `Add to [${environment}.json] file`
    });
  }
}