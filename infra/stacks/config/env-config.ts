import * as cdk from 'aws-cdk-lib';

 export interface EnvStackProps extends cdk.StackProps {
    env: {
        profile: string;
        account: string;
        region: string;
        githubRepo: string; // Format: "your-org/your-repo"
        githubBranch: string;
        subDomainPrefix: string;
        mailFromAddress: string;
        encryptionKey: string;
        authAuthority: string;
        allowOrigins: string[] | undefined;
        existingHostedZoneId: string | undefined;
        existingCertificateArn: string | undefined;
        existingDomainNameAliasApi: string | undefined;
        existingDomainNameZoneId: string | undefined;
        existingGuestTableArn: string | undefined;
        uspsConsumerKey: string | undefined;
        uspsConsumerSecret: string | undefined;
        twilioSid: string | undefined;
        twilioSecret: string | undefined;
        twilioVerifyServiceSid: string | undefined;
        twilioMessagingServiceSid: string | undefined;
        twilioMessagingServicePhone: string | undefined;
        stripePublicKey: string | undefined;
        stripeApiSecretKey: string | undefined;
    };
 }