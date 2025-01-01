using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Common.Abstractions;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Validation;

namespace Wedding.Lambdas.Admin.FamilyUnit.Delete.Handlers
{
    public class AdminDeleteFamilyUnitHandler : IAsyncCommandHandler<AdminDeleteFamilyUnitCommand, bool>
    {
        private readonly ILogger<AdminDeleteFamilyUnitHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;

        public AdminDeleteFamilyUnitHandler(ILogger<AdminDeleteFamilyUnitHandler> logger, IDynamoDBContext repository, IMapper mapper)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<bool> ExecuteAsync(AdminDeleteFamilyUnitCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));

            try
            {
                var familyUnitPartitionKey = DynamoKeys.GetFamilyUnitPartitionKey(command.InvitationCode);

                var items = await _repository.QueryAsync<WeddingEntity>(familyUnitPartitionKey).GetRemainingAsync();

                foreach (var item in items)
                {
                    await _repository.DeleteAsync<WeddingEntity>(item.PartitionKey, item.SortKey, cancellationToken);
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
