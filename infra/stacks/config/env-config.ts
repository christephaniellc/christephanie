import * as cdk from 'aws-cdk-lib';

 export interface EnvStackProps extends cdk.StackProps {
    env: {
        account: string;
        region: string;
        domainName: string;
        subDomainPrefix: string;
    };
 }