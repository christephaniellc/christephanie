using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Handlers;

namespace Wedding.PublicApi.Logic.Services
{
    public class DependencyDebuggingService : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;

        public DependencyDebuggingService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            try
            {
                var dynamoDbClient = _serviceProvider.GetRequiredService<IAmazonDynamoDB>();
                Console.WriteLine("DynamoDB Client resolved: " + dynamoDbClient);

                var dynamoDbContext = _serviceProvider.GetRequiredService<IDynamoDBContext>();
                Console.WriteLine("DynamoDB Context resolved: " + dynamoDbContext);

                var handler = _serviceProvider.GetRequiredService<CreateFamilyUnitHandler>();
                Console.WriteLine("CreateFamilyUnitHandler resolved: " + handler);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Dependency resolution failed: " + ex);
            }

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

}
