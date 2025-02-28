import { Construct } from 'constructs';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

interface DatabaseStackProps extends EnvStackProps {
}

export class DatabaseStack extends cdk.Stack {
  public readonly guestTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, {...props, description: "Creates DynamoDB table with index. (Destroy does not delete table)"});

    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName } = ApplicationProps;
    console.log("------------------------");
    console.log("DatabaseStack");

    console.log(`Environment account: ${props.env.account}`);

    this.guestTable = new dynamodb.Table(this, `${applicationName}-table-${environment}`, {
      tableName: `${applicationName}-guests-${environment}`,
      partitionKey: { name: 'PartitionKey', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SortKey', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    this.guestTable.addGlobalSecondaryIndex({
        indexName: 'GuestIdIndex',
        partitionKey: { name: 'GuestId', type: dynamodb.AttributeType.STRING },
        projectionType: cdk.aws_dynamodb.ProjectionType.ALL,
    });

    // Print outputs
    new cdk.CfnOutput(this, 'DynamoDBTableArn', {
        value: `${this.guestTable.tableArn}`,
        description: 'DynamoDBTable ARN',
    });
  }
}
