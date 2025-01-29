import * as cdk from 'aws-cdk-lib';

 export interface EnvStackProps extends cdk.StackProps {
    env: {
        profile: string;
        account: string;
        region: string;
        delegateHostedNameServers: string[] | undefined;
        subDomainPrefix: string;
        existingHostedZoneId: string | undefined;
        existingCertificateArn: string | undefined;
        existingDomainNameAliasApi: string | undefined;
        existingDomainNameZoneId: string | undefined;
    };
 }