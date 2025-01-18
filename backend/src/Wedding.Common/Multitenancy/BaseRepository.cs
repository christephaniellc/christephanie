using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using System.Threading.Tasks;

namespace Wedding.Common.Multitenancy
{
    public class BaseRepository<T>
    {
        private readonly IAmazonDynamoDB _dynamoDbClient;
        private readonly DynamoDBContext _context;
        private readonly IMultitenancySettingsProvider _multitenancySettingsProvider;

        public BaseRepository(IAmazonDynamoDB dynamoDbClient, DynamoDBContext context, IMultitenancySettingsProvider multitenancySettingsProvider)
        {
            _dynamoDbClient = dynamoDbClient;
            _multitenancySettingsProvider = multitenancySettingsProvider;
            _context = new DynamoDBContext(dynamoDbClient);
        }

        public async Task SaveAsync(T entity, string tenantId)
        {
            var tableName = _multitenancySettingsProvider.GetTableName(tenantId);
            var config = new DynamoDBOperationConfig
            {
                OverrideTableName = tableName
            };

            await _context.SaveAsync(entity, config);
        }
    }
}
