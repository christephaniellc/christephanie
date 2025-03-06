import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationProps } from './config/application-config';
import { EnvStackProps } from './config/env-config';
const { SSMClient, DeleteParameterCommand, PutParameterCommand } = require('@aws-sdk/client-ssm');

export interface ParamStackProps extends EnvStackProps {
    apiUrl: string;
}

export class ParamsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ParamStackProps) {
        super(scope, id, {...props, description: "Creates SecureString Parameters in SSM"});

    const environment = this.node.tryGetContext('env') || 'dev'; 
    const { applicationName, mailFromAddress } = ApplicationProps;
    console.log("------------------------");
    console.log("ParamsStack");

    async function createSecureParameter(parameterName: string, parameterValue: string) {
        const client = new SSMClient();
      
        const input = {
          Name: parameterName,
          Value: parameterValue,
          Type: 'SecureString',
          Overwrite: true,
        };
      
        const command = new PutParameterCommand(input);
      
        return await client.send(command);
    }
    const secureParams = [
        { 
            name: "/config/application/properties", 
            value: JSON.stringify({
                "ApplicationName": `${applicationName}`,
                "MailFromAddress": `${mailFromAddress}`
                }) 
        },
        { 
            name: "/config/usps/api-credentials", 
            value: JSON.stringify({        
                "ApiUrl": "https://api.usps.com",
                "ConsumerKey": `${props.env.uspsConsumerKey}`,
                "ConsumerSecret": `${props.env.uspsConsumerSecret}`
                }) 
        },
        { 
            name: "/config/twilio/api-credentials", 
            value: JSON.stringify({        
                "ApiUrl": "https://api.usps.com",
                "SID": `${props.env.twilioSid}`,
                "Secret": `${props.env.twilioSecret}`,
                "VerifyServiceSid": `${props.env.twilioVerifyServiceSid}`,
                "MessagingServiceSid": `${props.env.twilioMessagingServiceSid}`,
                "MessagingServicePhone": `${props.env.twilioMessagingServicePhone}`
                }) 
        },
        { 
            name: "/config/auth0/properties", 
            value: JSON.stringify({
                "Authority": props.env.authAuthority,
                "Audience": `https://${props.apiUrl}`
                }) 
        }
    ];

    secureParams.forEach(secureParam => {
        createSecureParameter(secureParam.name, secureParam.value);

        // Print outputs
        new cdk.CfnOutput(this, secureParam.name, { value: secureParam.value });
    });

    }
}
