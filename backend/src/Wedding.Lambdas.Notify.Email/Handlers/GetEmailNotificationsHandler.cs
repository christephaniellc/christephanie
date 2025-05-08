using System;
using System.Collections.Generic;
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
        IAsyncQueryHandler<GetEmailNotificationsQuery, Dictionary<CampaignTypeEnum, GuestEmailLogDto>>
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

        public async Task<Dictionary<CampaignTypeEnum, GuestEmailLogDto>> GetAsync(GetEmailNotificationsQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));
            var results = new Dictionary<CampaignTypeEnum, GuestEmailLogDto>();


            try
            {
                foreach (var campaign in Enum.GetValues(typeof(CampaignTypeEnum)))
                {
                    _logger.LogInformation($"Getting emails of campaign type: {campaign}");

                    var resultLogs = await
                        _dynamoDBProvider.GetEmailLogsByCampaignTypeAsync(query.AuthContext.Audience, (CampaignTypeEnum) campaign);

                    _logger.LogInformation($"Found {resultLogs.Count} logs");

                    foreach (var result in resultLogs)
                    {
                        _logger.LogInformation($"Log: {JsonSerializer.Serialize(result)}");
                        results.Add((CampaignTypeEnum)campaign, result);
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
