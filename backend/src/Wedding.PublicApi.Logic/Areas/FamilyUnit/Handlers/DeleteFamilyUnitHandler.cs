using System;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Keys;
using Wedding.Common.Abstractions;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Handlers
{
    public class DeleteFamilyUnitHandler : IAsyncCommandHandler<DeleteFamilyUnitCommand, bool>
    {
        private readonly ILogger<DeleteFamilyUnitHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;

        public DeleteFamilyUnitHandler(ILogger<DeleteFamilyUnitHandler> logger, IDynamoDBContext repository, IMapper mapper)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<bool> ExecuteAsync(DeleteFamilyUnitCommand command,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));

            try
            {
                var familyUnitPartitionKey = DynamoKeys.GetFamilyUnitPartitionKey(command.RsvpCode);

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
