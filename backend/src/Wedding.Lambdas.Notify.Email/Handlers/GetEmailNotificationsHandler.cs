using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Notify.Email.Commands;
using Wedding.Lambdas.Notify.Email.Validation;

namespace Wedding.Lambdas.Notify.Email.Handlers
{
    public class GetEmailNotificationsHandler :
        IAsyncQueryHandler<GetEmailNotificationsQuery, Dictionary<CampaignTypeEnum, List<GuestEmailLogDto>>>
    {
        private readonly ILogger<GetEmailNotificationsHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public GetEmailNotificationsHandler(ILogger<GetEmailNotificationsHandler> logger,
            IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<Dictionary<CampaignTypeEnum, List<GuestEmailLogDto>>> GetAsync(GetEmailNotificationsQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));
            var results = new Dictionary<CampaignTypeEnum, List<GuestEmailLogDto>>();

            try
            {
                foreach (var campaign in Enum.GetValues(typeof(CampaignTypeEnum)))
                {
                    var campaignEnum = (CampaignTypeEnum)campaign;
                    var resultLogs = await _dynamoDBProvider.GetEmailLogsByCampaignTypeAsync(query.AuthContext.Audience, campaignEnum);

                    if (resultLogs.Any())
                    {
                        results[campaignEnum] = resultLogs;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the notifications.");
                throw new UnauthorizedAccessException($"Notifications not found. {ex.Message}");
            }

            return results;
        }
    }
}
