using System;
using Amazon.DynamoDBv2.DataModel;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation;

namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Handlers
{
    public class UpdateFamilyUnitHandler : IAsyncCommandHandler<UpdateFamilyUnitCommand, FamilyUnitDto>
    {
        private readonly ILogger<UpdateFamilyUnitHandler> _logger;
        private readonly IDynamoDBContext _repository;

        public UpdateFamilyUnitHandler(ILogger<UpdateFamilyUnitHandler> logger, IDynamoDBContext repository)
        {
            _logger = logger;
            _repository = repository;
        }

        public async Task<FamilyUnitDto> ExecuteAsync(UpdateFamilyUnitCommand command,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            var familyUnit = command.FamilyUnit;

            try
            {

            }
            catch (Exception ex)
            {

            }

            return familyUnit;
        }
    }
}
