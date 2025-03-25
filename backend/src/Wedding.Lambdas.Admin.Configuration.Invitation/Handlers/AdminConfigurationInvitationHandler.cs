using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Keys;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Admin.Configuration.Invitation.Commands;
using Wedding.Lambdas.Admin.InvitationDesign.Validation;

namespace Wedding.Lambdas.Admin.Configuration.Invitation.Handlers
{
    public class AdminConfigurationInvitationHandler : 
        IAsyncQueryHandler<AdminGetPhotoConfigurationQuery, InvitationDesignDto>,
        IAsyncQueryHandler<AdminGetPhotoConfigurationsQuery, List<InvitationDesignDto>>,
        IAsyncCommandHandler<AdminSavePhotoConfigurationCommand, InvitationDesignDto>,
        IAsyncCommandHandler<AdminDeletePhotoConfigurationCommand, bool>
    {
        private readonly ILogger<AdminConfigurationInvitationHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public AdminConfigurationInvitationHandler(ILogger<AdminConfigurationInvitationHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<InvitationDesignDto> GetAsync(AdminGetPhotoConfigurationQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var result = await _dynamoDBProvider.GetPhotoConfigurationAsync(query.AuthContext.Audience,
                    query.AuthContext.GuestId, 
                    query.DesignId,
                    cancellationToken);

                if (result == null)
                {
                    throw new UnauthorizedAccessException("Invitation design not found.");
                }

                return _mapper.Map<InvitationDesignDto>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the invitation design.");
                throw new UnauthorizedAccessException($"Invitation design not found. {ex.Message}");
            }
        }

        public async Task<List<InvitationDesignDto>> GetAsync(AdminGetPhotoConfigurationsQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var result = await _dynamoDBProvider.GetPhotoConfigurationsAsync(query.AuthContext.Audience, cancellationToken);

                if (result == null)
                {
                    throw new UnauthorizedAccessException("Invitation designs not found.");
                }

                return _mapper.Map<List<InvitationDesignDto>>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the invitation designs.");
                throw new UnauthorizedAccessException($"Invitation designs not found. {ex.Message}");
            }
        }

        public async Task<InvitationDesignDto> ExecuteAsync(AdminSavePhotoConfigurationCommand command,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));

            try
            {
                string designId;
                DesignConfigurationEntity? design;
                if (command.InvitationDesign.DesignId != null)
                {
                    designId = command.InvitationDesign.DesignId;
                    design = await _dynamoDBProvider.GetPhotoConfigurationAsync(command.AuthContext.Audience,
                        command.AuthContext.GuestId,
                        command.InvitationDesign.DesignId,
                        cancellationToken);

                    _logger.LogInformation($"Serialized existing design: {JsonSerializer.Serialize(design)}");

                    if (command.InvitationDesign.Name != null)
                    {
                        _logger.LogInformation($"Updating name from '{design.Name}' to '{command.InvitationDesign.Name}'");
                        design.Name = command.InvitationDesign.Name;
                    }

                    design.ConfigurationData = command.InvitationDesign.ToString();

                    design.DateUpdated = new LastUpdateAuditDto
                    {
                        LastUpdate = DateTime.UtcNow,
                        Username = command.AuthContext.Name
                    }.ToString();
                }

                else
                {
                    var now = DateTime.UtcNow;
                    designId = Guid.NewGuid().ToString();
                    design = _mapper.Map<DesignConfigurationEntity>(command.InvitationDesign);

                    design.DesignId = designId;
                    design.SortKey = DynamoKeys.GetConfigurationInvitationSortKey(DesignConfigurationTypeEnum.Invitation, designId);
                    design.DateCreated = new LastUpdateAuditDto
                    {
                        LastUpdate = now,
                        Username = command.AuthContext.Name
                    }.ToString();
                    design.DateUpdated = new LastUpdateAuditDto
                    {
                        LastUpdate = now,
                        Username = command.AuthContext.Name
                    }.ToString();
                }

                // Save new or updated design
                await _dynamoDBProvider.SaveDesignAsync(command.AuthContext.Audience, design, cancellationToken);
                
                // Return updated design
                var result = await _dynamoDBProvider.GetPhotoConfigurationAsync(command.AuthContext.Audience,
                    command.AuthContext.GuestId,
                    designId,
                    cancellationToken);
                
                return _mapper.Map<InvitationDesignDto>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while saving the invitation designs.");
                throw new UnauthorizedAccessException($"Invitation designs not found. {ex.Message}");
            }
        }

        public async Task<bool> ExecuteAsync(AdminDeletePhotoConfigurationCommand command,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            throw new NotImplementedException();
        }
    }
}
