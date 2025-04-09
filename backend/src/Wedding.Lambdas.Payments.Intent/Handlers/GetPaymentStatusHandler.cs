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
                if (string.IsNullOrEmpty(query.PaymentIntentId))
                {
                    _logger.LogWarning("GetPaymentStatus called with empty PaymentIntentId");
                    return new StripePaymentIntentResponseDto
                    {
                        Error = new PaymentError
                        {
                            Type = "validation_error",
                            Code = "missing_payment_intent",
                            Message = "Payment intent ID is required"
                        }
                    };
                }

                _logger.LogInformation("Getting payment status for PaymentIntentId: {PaymentIntentId}", query.PaymentIntentId);
                
                // First try to get from our database
                var paymentEntity = await _dynamoDBProvider.GetPaymentByIdAsync(
                    query.AuthContext.Audience, 
                    query.PaymentIntentId, 
                    cancellationToken);

                if (paymentEntity == null)
                {
                    _logger.LogWarning("Payment with ID {PaymentIntentId} not found in database", query.PaymentIntentId);
                    
                    // If not in our database, we could try to get it directly from Stripe
                    // However, for now we'll just return a clear error
                    return new StripePaymentIntentResponseDto
                    {
                        Error = new PaymentError
                        {
                            Type = "resource_missing",
                            Code = "payment_intent_not_found",
                            Message = $"No payment intent found with ID: {query.PaymentIntentId}"
                        }
                    };
                }

                // Return the payment information
                return new StripePaymentIntentResponseDto
                {
                    PaymentIntentId = paymentEntity.PaymentIntentId,
                    Amount = paymentEntity.Amount,
                    Currency = paymentEntity.Currency
                    // We don't have the client secret here since it was only used during initial creation
                };
            }
            catch (Stripe.StripeException stripeEx)
            {
                // Handle Stripe-specific exceptions
                _logger.LogError(stripeEx, 
                    "Stripe exception getting payment status: Type={ErrorType}, Code={ErrorCode}, Message={ErrorMessage}", 
                    stripeEx.StripeError?.Type, 
                    stripeEx.StripeError?.Code,
                    stripeEx.Message);
                
                return new StripePaymentIntentResponseDto
                {
                    Error = new PaymentError
                    {
                        Type = stripeEx.StripeError?.Type,
                        Code = stripeEx.StripeError?.Code,
                        DeclineCode = stripeEx.StripeError?.DeclineCode,
                        Message = stripeEx.Message
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting payment status for {PaymentIntentId}: {ErrorMessage}", 
                    query.PaymentIntentId, ex.Message);
                
                return new StripePaymentIntentResponseDto
                {
                    Error = new PaymentError
                    {
                        Type = "server_error",
                        Code = "internal_error",
                        Message = "Failed to retrieve payment status. Please try again."
                    }
                };
            }
        }
    }
}
