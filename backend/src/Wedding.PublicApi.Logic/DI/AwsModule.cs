using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using Amazon.Extensions.NETCore.Setup;
using Autofac;
using System.Diagnostics.CodeAnalysis;
using Amazon;

namespace Wedding.PublicApi.Logic.DI
{
    [ExcludeFromCodeCoverage]
    public class AwsModule : Module
    {
        AWSOptions _awsOptions;

        public AwsModule(AWSOptions awsOptions)
        {
            _awsOptions = awsOptions;
        }

        protected override void Load(ContainerBuilder builder)
        {
            AWSConfigs.LoggingConfig.LogTo = LoggingOptions.Console;
            AWSConfigs.LoggingConfig.LogResponses = ResponseLoggingOption.Always;

            builder.Register(ctx =>
            {
                return _awsOptions.CreateServiceClient<IAmazonDynamoDB>();
            }).As<IAmazonDynamoDB>();

            builder.Register(c =>
            {
                var client = c.Resolve<IAmazonDynamoDB>();
                return new DynamoDBContext(client);
            }).As<IDynamoDBContext>().SingleInstance();
        }
    }
}
