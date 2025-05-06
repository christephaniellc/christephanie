import { Construct } from 'constructs';
import { EnvStackProps } from './config/env-config';
import { ApplicationProps } from './config/application-config';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

interface DatabaseStackProps extends EnvStackProps {
}

export class DatabaseStack extends cdk.Stack {
  public readonly guestTable: dynamodb.Table;
  public readonly designTable: dynamodb.Table;
  public readonly paymentTable: dynamodb.Table;
  public readonly emailTrackingTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, {...props, description: "Creates DynamoDB table with index. (Destroy does not delete table)"});

    const environment = this.node.tryGetContext('env') || 'dev';
    const { applicationName } = ApplicationProps;
    console.log("------------------------");
    console.log("DatabaseStack");

    console.log(`Environment account: ${props.env.account}`);

    
    if (!props.env.existingGuestTableArn) {
      // GUEST TABLE
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
      
      new cdk.CfnOutput(this, 'DynamoDBGuestTableArn', {
          value: `${this.guestTable.tableArn}`,
          description: 'DynamoDBTable guestTable ARN',
      });
    };

    // DESIGN CONFIG TABLE
    this.designTable = new dynamodb.Table(this, `${applicationName}-design-configuration`, {
      tableName: `${applicationName}-design-configuration`,
      partitionKey: { name: 'PartitionKey', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SortKey', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    this.designTable.addGlobalSecondaryIndex({
        indexName: 'AllConfigsIndex',
        partitionKey: { name: 'ConfigPK', type: dynamodb.AttributeType.STRING }, // ex: CONFIG#invitation#modern
        sortKey: { name: 'ConfigSK', type: dynamodb.AttributeType.STRING }, // ex: GuestId
        projectionType: cdk.aws_dynamodb.ProjectionType.ALL,
    });

    // PAYMENT TABLE
    this.paymentTable = new dynamodb.Table(this, `${applicationName}-payments`, {
      tableName: `${applicationName}-payments`,
      partitionKey: { name: 'PartitionKey', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SortKey', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // NOTE! Must comment one of these out for each deploy, cannot deploy two GSIs at the same time
    this.paymentTable.addGlobalSecondaryIndex({
        indexName: 'AllByGuestIndex',
        partitionKey: { name: 'GuestIdGSI', type: dynamodb.AttributeType.STRING },
        sortKey: { name: 'GuestSortKey', type: dynamodb.AttributeType.STRING },
        projectionType: cdk.aws_dynamodb.ProjectionType.ALL,
    });
    // this.paymentTable.addGlobalSecondaryIndex({
    //   indexName: 'AllByCategoryIndex',
    //   partitionKey: { name: 'GiftCategoryGSI', type: dynamodb.AttributeType.STRING },
    //   sortKey: { name: 'CategorySortKey', type: dynamodb.AttributeType.STRING },
    //     projectionType: cdk.aws_dynamodb.ProjectionType.ALL,
    // });

    // EMAIL TRACKING TABLE
    this.emailTrackingTable = new dynamodb.Table(this, `${applicationName}-notifications`, {
      tableName: `${applicationName}-notification-tracking-${environment}`,
      partitionKey: { name: 'PartitionKey', type: dynamodb.AttributeType.STRING }, // ex: EMAIL#<GuestId>
      sortKey: { name: 'SortKey', type: dynamodb.AttributeType.STRING },           // ex: <Timestamp>#<EmailType>
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI: Group emails by campaign (e.g., RSVP-Nudge-May19)
    this.emailTrackingTable.addGlobalSecondaryIndex({
      indexName: 'CampaignIndex',
      partitionKey: { name: 'CampaignId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GuestId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Output ARN for reference
    new cdk.CfnOutput(this, 'DynamoDBEmailTrackingTableArn', {
      value: this.emailTrackingTable.tableArn,
      description: 'DynamoDBTable emailTrackingTable ARN',
});


    // Print outputs
    new cdk.CfnOutput(this, 'DynamoDBDesignTableArn', {
        value: `${this.designTable.tableArn}`,
        description: 'DynamoDBTable designTable ARN',
    });
    new cdk.CfnOutput(this, 'DynamoDBPaymentTableArn', {
        value: `${this.paymentTable.tableArn}`,
        description: 'DynamoDBTable paymentTable ARN',
    });
  }
}
