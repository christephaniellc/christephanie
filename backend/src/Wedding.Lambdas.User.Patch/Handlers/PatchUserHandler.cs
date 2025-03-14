using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos.ClientInfo;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.User.Patch.Commands;
using Wedding.Lambdas.User.Patch.Validation;

namespace Wedding.Lambdas.User.Patch.Handlers
{
    public class PatchUserHandler : IAsyncCommandHandler<PatchUserCommand, bool>
    {
        private readonly ILogger<PatchUserHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public PatchUserHandler(ILogger<PatchUserHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<bool> ExecuteAsync(PatchUserCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));

            try
            {
                command.ClientInfo.DateRecorded = DateTime.UtcNow;

                var matchingGuest = await _dynamoDBProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience, command.AuthContext.InvitationCode, command.AuthContext.GuestId);
                if (matchingGuest == null)
                {
                    throw new KeyNotFoundException($"Could not find invitation {command.AuthContext.InvitationCode} with guestId {command.AuthContext.GuestId}. No items.");
                }
                ;

                if (matchingGuest.ClientInfos == null)
                {
                    matchingGuest.ClientInfos = new List<string>();
                }

                var infos = _mapper.Map<List<ClientInfoDto>>(matchingGuest.ClientInfos);
                var similarInfo = infos.FirstOrDefault(clientInfo =>
                    string.Equals(clientInfo.Os, command.ClientInfo.Os, StringComparison.OrdinalIgnoreCase) &&
                        clientInfo.Browser != null &&
                        string.Equals(clientInfo.Browser.Name, command.ClientInfo.Browser.Name,
                            StringComparison.OrdinalIgnoreCase) &&
                        string.Equals(clientInfo.Browser.Version, command.ClientInfo.Browser.Version,
                            StringComparison.OrdinalIgnoreCase) &&
                        clientInfo.Screen != null &&
                        clientInfo.Screen.Width == command.ClientInfo.Screen.Width &&
                        clientInfo.Screen.Height == command.ClientInfo.Screen.Height
                );

                if (similarInfo != null)
                {
                    _logger.LogInformation("Existing similar client info detected; replacing with latest client info.");
                    infos.Remove(similarInfo);
                    infos.Add(command.ClientInfo);
                    matchingGuest.ClientInfos = infos.Select(info => info.ToString()).ToList();
                }
                else
                {
                    _logger.LogInformation("New client info detected; adding to GuestDto.");
                    matchingGuest.ClientInfos.Add(command.ClientInfo.ToString());
                }

                await _dynamoDBProvider.SaveAsync(command.AuthContext.Audience, matchingGuest, cancellationToken);

                return true;
            }
            catch (KeyNotFoundException ex)
            {
                throw new KeyNotFoundException(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the user.");
                throw new Exception($"User not found. {ex.Message}");
            }
        }
    }
}
