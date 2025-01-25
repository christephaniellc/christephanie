import * as cdk from 'aws-cdk-lib';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';

interface DatabaseStackProps extends EnvStackProps {
}

export class DatabaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName } = ApplicationProps;

    const table = new Table(this, `${applicationName}-table-${environment}`, {
      tableName: `${applicationName}-table-${environment}`,
      partitionKey: { name: 'PartitionKey', type: AttributeType.STRING },
      sortKey: { name: 'SortKey', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
    });

    table.addGlobalSecondaryIndex({
        indexName: 'GuestIdIndex',
        partitionKey: { name: 'GuestId', type: AttributeType.STRING },
        projectionType: cdk.aws_dynamodb.ProjectionType.ALL,
    });
  }
}
