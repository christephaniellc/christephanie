import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';

export interface ThrottleStackProps extends EnvStackProps {
}

export class ThrottleStack extends cdk.Stack {
    public readonly rateLimitTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: ThrottleStackProps) {
        super(scope, id, { ...props, description: "Creates Dynamo tables for route rate limit tracking and integration tests" });

        const environment = this.node.tryGetContext('env') || 'dev';
        const { applicationName } = ApplicationProps;
        console.log("------------------------");
        console.log("ThrottleStack");

        this.rateLimitTable = new dynamodb.Table(this, `${applicationName}-table-rate-limit-${environment}`, {
            tableName: `${applicationName}-rate-limit`,
            partitionKey: { name: 'Route', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'IpAddress', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            timeToLiveAttribute: 'ExpirationTime', // Cleanup old records
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        const rateLimitTableTests = new dynamodb.Table(this, `${applicationName}-table-rate-limit-unittests`, {
            tableName: `${applicationName}-unittests-rate-limit`,
            partitionKey: { name: 'Route', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'IpAddress', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            timeToLiveAttribute: 'ExpirationTime', // Cleanup old records
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        const tableTests = new dynamodb.Table(this, `${applicationName}-table-unittests`, {
            tableName: `${applicationName}-unittests`,
            partitionKey: { name: 'PartitionKey', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SortKey', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            timeToLiveAttribute: 'ExpirationTime', // Cleanup old records
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        // Output table name for use in Lambda
        new cdk.CfnOutput(this, 'RateLimitTableName', {
            value: this.rateLimitTable.tableName,
            description: 'DynamoDB table for rate limiting API gateway routes',
        });
        new cdk.CfnOutput(this, 'UnitTestTableName', {
            value: tableTests.tableName,
            description: 'DynamoDB table for rate limiting API gateway routes',
        });
        new cdk.CfnOutput(this, 'RateLimitUnitTestTableName', {
            value: rateLimitTableTests.tableName,
            description: 'DynamoDB table for rate limiting API gateway routes',
        });
    }
}
