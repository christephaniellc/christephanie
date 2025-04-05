using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Abstractions.Entities;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Payments.Contributions.Commands;
using Wedding.Lambdas.Payments.Contributions.Validation;

namespace Wedding.Lambdas.Payments.Contributions.Handlers
{
    public class GetContributionsHandler : 
        IAsyncQueryHandler<GetContributionsQuery, List<ContributionDto>>
    {
        private readonly ILogger<GetContributionsHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public GetContributionsHandler(ILogger<GetContributionsHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<List<ContributionDto>> GetAsync(GetContributionsQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                List<PaymentIntentEntity> entities;

                var filter = query.Filter;
                var audience = query.AuthContext.Audience;

                if (filter != null)
                {
                    if (!string.IsNullOrEmpty(filter.GuestId))
                    {
                        entities = await _dynamoDBProvider.GetPaymentsByGuestIdAsync(audience, filter.GuestId, cancellationToken);
                    }
                    else if (!string.IsNullOrEmpty(filter.GiftCategory))
                    {
                        entities = await _dynamoDBProvider.GetPaymentsByCategoryAsync(audience, filter.GiftCategory, cancellationToken);
                    }
                    else
                    {
                        entities = await _dynamoDBProvider.GetAllPaymentsSortedByTimestampAsync(audience, cancellationToken);
                    }
                }
                else
                {
                    entities = await _dynamoDBProvider.GetAllPaymentsSortedByTimestampAsync(audience, cancellationToken);
                }

                var dtos = _mapper.Map<List<ContributionDto>>(entities);
                ContributionPrivacyHelper.ApplyPrivacyMask(dtos, query.AuthContext.Roles);

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the stats.");
                throw new UnauthorizedAccessException($"Stats not found. {ex.Message}");
            }
        }
    }
}
