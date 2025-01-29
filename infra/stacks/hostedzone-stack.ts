import { Construct } from 'constructs';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';

export class HostedZoneStack extends cdk.Stack {
    public readonly hostedZone: route53.IHostedZone;
    public readonly fullDomainName: string;
    public readonly frontendUrl: string;
    public readonly apiUrl: string;
    
    constructor(scope: Construct, id: string, props: EnvStackProps) {
        super(scope, id, props);
        
        const environment = this.node.tryGetContext('env') || 'dev';

        const { applicationName, domainName, apiRoute, srcFolder, releaseFolder } = ApplicationProps;
        console.log("------------------------");
        console.log("HostedZoneStack");
        
        // fullDomainName:
        // E.g., dev.wedding.christephanie.com      DEV
        // E.g., wedding.christephanie.com          PROD
        this.fullDomainName = `${props.env.subDomainPrefix}.${domainName}`;
        this.frontendUrl = this.fullDomainName;
        this.apiUrl = `${apiRoute}.${this.fullDomainName}`; // E.g., fianceapi.dev.wedding.christephanie.com
        console.log(`Full domain name: ${this.fullDomainName}`);
        console.log(`API url: ${this.apiUrl}`);
        console.log(`Predefined hosted zone ID: ${props.env.existingHostedZoneId}`);
        console.log(`SubDomainPrefix: ${props.env.subDomainPrefix}`);

        let hostedZoneNameServers = "NONE (existing)";
        if (props.env.existingHostedZoneId) { 
            console.log(`Hosted zone id found in environment props: ${props.env.existingHostedZoneId}`);
            this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, `${applicationName}-hosted-zone-${environment}`, {
                    hostedZoneId: `${props.env.existingHostedZoneId}`,
                    zoneName: `${this.fullDomainName}`,
                });
        }
        else {
            console.log(`INFO: No hosted zone id found. Creating new hosted zone...`);
            this.hostedZone = new route53.HostedZone(this, `${applicationName}-hosted-zone-${environment}`, {
                zoneName: `${this.fullDomainName}`,
            });
            (this.hostedZone as any).applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
            hostedZoneNameServers = cdk.Fn.join(',', this.hostedZone.hostedZoneNameServers!);
        }

        console.log(`Hosted zone id: ${this.hostedZone.hostedZoneId}`);

        // Print outputs
        new cdk.CfnOutput(this, 'FullDomainName', { 
            value: this.fullDomainName });

        new cdk.CfnOutput(this, 'FrontendUrl', { 
            value: this.frontendUrl});

        new cdk.CfnOutput(this, 'ApiUrl', { 
            value: this.apiUrl});

        new cdk.CfnOutput(this, 'HostedZoneCreated', {
            value: (!props.env.existingHostedZoneId).toString()});

        new cdk.CfnOutput(this, 'HostedZoneId', {
                value: this.hostedZone.hostedZoneId });

        new cdk.CfnOutput(this, 'HostedZoneNameServers', {
            value: hostedZoneNameServers });

        new cdk.CfnOutput(this, 'EnvJsonHostedZoneId', {
                value: `"existingHostedZoneId": "${this.hostedZone.hostedZoneId}"`,
                description: `Add to [${environment}.json] file`
            });

        if (!props.env.existingHostedZoneId) {
            new cdk.CfnOutput(this, 'EnvJsonHostedNameServers', {
                    value: `"delegateHostedNameServers": ["${hostedZoneNameServers}]"`,
                    description: `Add to [prod.json] file`
                });
        }
    }
}
