import { Construct } from 'constructs';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

interface DatabaseStackProps extends EnvStackProps {
}

export class DatabaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName } = ApplicationProps;
    console.log("------------------------");
    console.log("DatabaseStack");

    console.log(`Environment account: ${props.env.account}`);

    const dynamoTable = new dynamodb.Table(this, `${applicationName}-table-${environment}`, {
      tableName: `${applicationName}-table-${environment}`,
      partitionKey: { name: 'PartitionKey', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SortKey', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED
    });

    dynamoTable.addGlobalSecondaryIndex({
        indexName: 'GuestIdIndex',
        partitionKey: { name: 'GuestId', type: dynamodb.AttributeType.STRING },
        projectionType: cdk.aws_dynamodb.ProjectionType.ALL,
    });

    // Print outputs
    new cdk.CfnOutput(this, 'DynamoDBTableArn', {
        value: `${dynamoTable.tableArn}`,
        description: 'DynamoDBTable ARN',
    });
  }
}
