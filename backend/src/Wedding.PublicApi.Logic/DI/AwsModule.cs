using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using Amazon.Extensions.NETCore.Setup;
using Autofac;
using System.Diagnostics.CodeAnalysis;
using Amazon;
using Wedding.Common.Helpers.AWS;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Amazon.Lambda.APIGatewayEvents;
using Wedding.Common.Abstractions;
using Wedding.Common.Auth.Commands;
using Wedding.Common.Multitenancy;
using Wedding.Lambdas.Authorize.Commands;
using Wedding.PublicApi.Logic.Services.Auth;

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

            builder.Register(c =>
            {
                var logger = c.Resolve<ILogger<DynamoDBProvider>>();
                var context = c.Resolve<IDynamoDBContext>();
                var mapper = c.Resolve<IMapper>();
                var multitenancySettingsProvider = c.Resolve<IMultitenancySettingsProvider>();
                return new DynamoDBProvider(logger, context, mapper, multitenancySettingsProvider);
            }).As<IDynamoDBProvider>()
                .AsImplementedInterfaces() 
                .InstancePerDependency();

            builder.Register(c =>
                {
                    return new MultitenancySettingsProvider();
                }).As<IMultitenancySettingsProvider>()
                .AsImplementedInterfaces()
                .InstancePerDependency();

            builder.Register(ctx =>
            {
                var authHandler = ctx.Resolve<IAsyncQueryHandler<ValidateAuthQuery, APIGatewayCustomAuthorizerResponse>>();
                return new LambdaAuthorizer(authHandler);
            }).As<ILambdaAuthorizer>()
            .AsImplementedInterfaces()
            .InstancePerDependency();
        }
    }
}
