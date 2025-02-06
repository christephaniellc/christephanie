import { EnvStackProps } from './config/env-config';
import { Construct } from 'constructs';
import { ApplicationProps } from './config/application-config';
import * as cdk from 'aws-cdk-lib';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface FrontendStackProps extends EnvStackProps {
    certificate: certificatemanager.ICertificate;
    frontendUrl: string;
  }

export class FrontendStack extends cdk.Stack {
    public readonly cloudFrontDistribution: cdk.aws_cloudfront.Distribution;

    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, {...props, description: "Creates S3 bucket and attaches new CloudFront distribution"});

    const environment = this.node.tryGetContext('env') || 'dev'; 
    const { applicationName, domainName } = ApplicationProps;
    console.log("------------------------");
    console.log("FrontEndStack");

    const fullDomainName = `${props.env.subDomainPrefix}.${domainName}`;
    console.log(`Full domain name: ${fullDomainName}`);

    const frontendBucket = new s3.Bucket(this, `${applicationName}-frontend-bucket`, {
        bucketName: `www.${props.frontendUrl}`,
        versioned: false,
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'error.html',
        publicReadAccess: true, // For static site hosting, otherwise consider CloudFront OAI
        blockPublicAccess: new s3.BlockPublicAccess({
          blockPublicAcls: false,   // Allows public ACLs
          blockPublicPolicy: false, // Allows public policies
          ignorePublicAcls: false,  // Does not ignore public ACLs
          restrictPublicBuckets: false // Does not restrict public access
        }),
        removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: false
       });
    console.log(`Frontend bucket name: ${frontendBucket.bucketName}`);

    // Create an Origin Access Control (OAC)
    // AWS > Cloudfront > Distributions > [enter] > Origins
    // Domain ex: breadth-of-the-wild-app.s3.us-west-2.amazonaws.com
    //      This S3 bucket has static web hosting enabled. 
    //      If you plan to use this distribution as a website, we recommend using the S3 website endpoint rather than the bucket endpoint.
    const oac = new cloudfront.CfnOriginAccessControl(this, `${applicationName}-frontend-OAC`, {
        originAccessControlConfig: {
          name: `${applicationName}-frontend-OAC`,
          originAccessControlOriginType: 's3',
          signingBehavior: 'always',
          signingProtocol: 'sigv4',
        },
      });    
      console.log(`Oac attrId: ${oac.attrId}`);  

    // CloudFront distribution for the frontend bucket
    this.cloudFrontDistribution = new cloudfront.Distribution(this, `${applicationName}-cloudfront-distribution`, {
        defaultBehavior: {
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            // For a standard (non-static) S3 bucket:
            // Use the S3BucketOrigin class. It's recommended to configure Origin Access Control (OAC) for enhanced security. 
            origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket, { originAccessControlId: oac.attrId })
        },
        defaultRootObject: 'index.html',
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,  // Use cheapest edge locations
        domainNames: [`${fullDomainName}`, `www.${fullDomainName}`],
        certificate: props.certificate
    });
    console.log(`CloudFrontDistribution domain name: ${this.cloudFrontDistribution.distributionDomainName}`); 

    // Print output
    new cdk.CfnOutput(this, 'CloudFrontDistributionDomain', {
        value: this.cloudFrontDistribution.distributionDomainName,
        description: 'CloudFront Distribution Domain',
        });
    
    new cdk.CfnOutput(this, 'S3BucketName', {
        value: frontendBucket.bucketName,
        description: 'Frontend S3 Bucket Name',
        });
  }
}
