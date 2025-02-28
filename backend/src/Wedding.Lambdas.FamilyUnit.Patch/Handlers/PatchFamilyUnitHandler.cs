using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.FamilyUnit.Patch.Commands;
using Wedding.Lambdas.FamilyUnit.Patch.Validation;

namespace Wedding.Lambdas.FamilyUnit.Patch.Handlers
{
    public class PatchFamilyUnitHandler : IAsyncCommandHandler<PatchFamilyUnitCommand, FamilyUnitViewModel>
    {
        private readonly ILogger<PatchFamilyUnitHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDbProvider;
        private readonly IMapper _mapper;

        public PatchFamilyUnitHandler(ILogger<PatchFamilyUnitHandler> logger, IDynamoDBProvider dynamoDbProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDbProvider = dynamoDbProvider;
            _mapper = mapper;
        }

        public async Task<FamilyUnitViewModel> ExecuteAsync(PatchFamilyUnitCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation("PatchFamilyUnitHandler");
            command.Validate(nameof(command));

            try
            {
                var existingFamilyUnitEntity = await _dynamoDbProvider.LoadFamilyUnitOnlyAsync(command.AuthContext.Audience, command.AuthContext.InvitationCode, cancellationToken);
                if (existingFamilyUnitEntity == null)
                {
                    throw new InvalidOperationException($"Family unit with Invitation code '{command.AuthContext.InvitationCode}' does not exist.");
                }

                _logger.LogInformation($"Table audience: {command.AuthContext.Audience}");
                _logger.LogInformation($"Invitation code: {command.AuthContext.InvitationCode}");
                _logger.LogInformation($"Found family unit: {JsonSerializer.Serialize(existingFamilyUnitEntity)}");

                if (command.MailingAddress != null)
                {
                    _logger.LogInformation($"Updating MailingAddress from '{existingFamilyUnitEntity.MailingAddress ?? "<empty>"}' to '{command.MailingAddress.ToString()}'");
                    existingFamilyUnitEntity.MailingAddress = command.MailingAddress.ToString();
                }

                if (command.InvitationResponseNotes != null)
                {
                    _logger.LogInformation($"Updating InvitationResponseNotes from '{existingFamilyUnitEntity.InvitationResponseNotes ?? "<empty>"}' to '{command.InvitationResponseNotes}'");
                    existingFamilyUnitEntity.InvitationResponseNotes = command.InvitationResponseNotes;
                }

                await _dynamoDbProvider.SaveAsync(command.AuthContext.Audience, existingFamilyUnitEntity, cancellationToken);
                _logger.LogInformation($"Patched Family Unit: {JsonSerializer.Serialize(existingFamilyUnitEntity)}");

                var result = await _dynamoDbProvider.GetFamilyUnitAsync(command.AuthContext.Audience, command.AuthContext.InvitationCode);
                return _mapper.Map<FamilyUnitViewModel>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the family unit:" + ex.Message);
                _logger.LogError(ex, "Stacktrace:" + ex.StackTrace);
                throw new ApplicationException("An error occurred while getting the family unit.", ex);
            }
        }
    }
}
