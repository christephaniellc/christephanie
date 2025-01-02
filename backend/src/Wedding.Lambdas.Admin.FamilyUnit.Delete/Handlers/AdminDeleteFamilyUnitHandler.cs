using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Entities;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Validation;

namespace Wedding.Lambdas.Admin.FamilyUnit.Delete.Handlers
{
    public class AdminDeleteFamilyUnitHandler : IAsyncCommandHandler<AdminDeleteFamilyUnitCommand, bool>
    {
        private readonly ILogger<AdminDeleteFamilyUnitHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public AdminDeleteFamilyUnitHandler(ILogger<AdminDeleteFamilyUnitHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<bool> ExecuteAsync(AdminDeleteFamilyUnitCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));

            try
            {
                var items = await _dynamoDBProvider.QueryAsync(command.InvitationCode);

                foreach (var item in items)
                {
                    await _dynamoDBProvider.DeleteAsync(command.InvitationCode, item.SortKey, cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting the family unit.");
                throw new ApplicationException("An error occurred while deleting the family unit.", ex);
            }

            return true;
        }
    }
}
