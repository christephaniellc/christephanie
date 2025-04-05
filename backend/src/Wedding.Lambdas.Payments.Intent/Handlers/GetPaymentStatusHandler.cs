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
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Payments.Intent.Commands;
using Wedding.Lambdas.Payments.Intent.Validation;

namespace Wedding.Lambdas.Payments.Intent.Handlers
{
    public class GetPaymentStatusHandler : 
        IAsyncQueryHandler<GetPaymentStatusQuery, StripePaymentIntentResponseDto>
    {
        private readonly ILogger<GetPaymentStatusHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;
        private readonly IStripePaymentProvider _stripePaymentProvider;

        public GetPaymentStatusHandler(ILogger<GetPaymentStatusHandler> logger, 
            IDynamoDBProvider dynamoDBProvider, 
            IMapper mapper, 
            IStripePaymentProvider stripePaymentProvider)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
            _stripePaymentProvider = stripePaymentProvider;
        }

        public async Task<StripePaymentIntentResponseDto> GetAsync(GetPaymentStatusQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {

                if (!string.IsNullOrEmpty(query.PaymentIntentId))// && !string.IsNullOrEmpty(filter.GuestId))
                {
                    // You may want to store or retrieve Timestamp from frontend to fully use GetPaymentByIdAsync.
                    // For now, just scan and find the match:
                    var result = await _dynamoDBProvider.GetPaymentByIdAsync(query.AuthContext.Audience, query.PaymentIntentId, cancellationToken);
                }
                // var result = await _dynamoDBProvider.GetFamilyUnitsAsync(query.AuthContext.Audience, cancellationToken);
                // var relevantResults = result
                //     .Where(family => FeatureFlags.TiersToIncludeInStats.Contains(family.Tier))
                //     .ToList();
                //
                // if (result == null)
                // {
                //     throw new UnauthorizedAccessException("Stats not found.");
                // }
                //
                // var dtos = _mapper.Map<List<FamilyUnitDto>>(relevantResults);
                // return _mapper.Map<List<FamilyUnitViewModel>>(dtos);
                throw new NotImplementedException();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the stats.");
                throw new UnauthorizedAccessException($"Stats not found. {ex.Message}");
            }
        }
    }
}
