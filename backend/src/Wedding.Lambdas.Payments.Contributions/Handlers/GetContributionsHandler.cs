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
                        // Get all payments for the guest
                        var allEntities = await _dynamoDBProvider.GetPaymentsByGuestIdAsync(audience, filter.GuestId, cancellationToken);
                        
                        // Filter to only include "succeeded" payments
                        // Include historical payments that don't have a status field (for backwards compatibility)
                        entities = allEntities
                            .FindAll(payment => payment.Status == "succeeded" || payment.Status == null);
                        
                        _logger.LogInformation("Filtered payments for guest {GuestId}: {TotalCount} total, {SucceededCount} with succeeded status", 
                            filter.GuestId, allEntities.Count, entities.Count);
                    }
                    else if (!string.IsNullOrEmpty(filter.GiftCategory))
                    {
                        // Get all payments for the category
                        var allEntities = await _dynamoDBProvider.GetPaymentsByCategoryAsync(audience, filter.GiftCategory, cancellationToken);
                        
                        // Filter to only include "succeeded" payments
                        // Include historical payments that don't have a status field (for backwards compatibility)
                        entities = allEntities
                            .FindAll(payment => payment.Status == "succeeded" || payment.Status == null);
                        
                        _logger.LogInformation("Filtered payments for category {Category}: {TotalCount} total, {SucceededCount} with succeeded status", 
                            filter.GiftCategory, allEntities.Count, entities.Count);
                    }
                    else
                    {
                        // Get all payments
                        var allEntities = await _dynamoDBProvider.GetAllPaymentsSortedByTimestampAsync(audience, cancellationToken);
                        
                        // Filter to only include "succeeded" payments
                        // Include historical payments that don't have a status field (for backwards compatibility)
                        entities = allEntities
                            .FindAll(payment => payment.Status == "succeeded" || payment.Status == null);
                        
                        _logger.LogInformation("Filtered all payments: {TotalCount} total, {SucceededCount} with succeeded status", 
                            allEntities.Count, entities.Count);
                    }
                }
                else
                {
                    // Get all payments (no filter)
                    var allEntities = await _dynamoDBProvider.GetAllPaymentsSortedByTimestampAsync(audience, cancellationToken);
                    
                    // Filter to only include "succeeded" payments
                    // Include historical payments that don't have a status field (for backwards compatibility)
                    entities = allEntities
                        .FindAll(payment => payment.Status == "succeeded" || payment.Status == null);
                    
                    _logger.LogInformation("Filtered all payments (no filter): {TotalCount} total, {SucceededCount} with succeeded status", 
                        allEntities.Count, entities.Count);
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
