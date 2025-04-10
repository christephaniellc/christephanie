using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Payments.Intent.Commands;
using Wedding.Lambdas.Payments.Intent.Validation;

namespace Wedding.Lambdas.Payments.Intent.Handlers
{
    public class CreatePaymentIntentHandler :
            IAsyncCommandHandler<CreatePaymentIntentCommand, StripePaymentIntentResponseDto>
    {
        private readonly ILogger<CreatePaymentIntentHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;
        private readonly IStripePaymentProvider _stripePaymentProvider;

        public CreatePaymentIntentHandler(
            ILogger<CreatePaymentIntentHandler> logger, 
            IDynamoDBProvider dynamoDbProvider, 
            IMapper mapper, 
            IStripePaymentProvider stripePaymentProvider)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDbProvider;
            _mapper = mapper;
            _stripePaymentProvider = stripePaymentProvider;
        }

        public async Task<StripePaymentIntentResponseDto> ExecuteAsync(CreatePaymentIntentCommand command, CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));

            try
            {
                var guest = await _dynamoDBProvider.LoadGuestByGuestIdAsync(command.AuthContext.Audience, 
                    command.AuthContext.InvitationCode, 
                    command.AuthContext.GuestId, 
                    cancellationToken);

                if (guest == null)
                {
                    throw new UnauthorizedAccessException("Guest not found.");
                }

                var guestDto = _mapper.Map<GuestDto>(guest);

                if (string.IsNullOrEmpty(guestDto.Email?.Value))
                {
                    guestDto.Email = new VerifiedDto
                    {
                        Value = command.GuestEmail
                    };
                    var updatedGuest = _mapper.Map<WeddingEntity>(guestDto);
                    await _dynamoDBProvider.SaveAsync(command.AuthContext.Audience, updatedGuest, cancellationToken);
                }

                var giftMetaData = new GiftMetaData
                {
                    GuestId = command.AuthContext.GuestId,
                    GuestName = $"{guestDto.FirstName} {guestDto.LastName}",
                    GuestEmail = guestDto.Email.Value,
                    InvitationCode = guestDto.InvitationCode,
                    Audience = command.AuthContext.Audience,
                    IsAnonymous = command.GiftMetaData?.IsAnonymous ?? false,
                    GiftCategory = command.GiftMetaData?.GiftCategory ?? GiftCategoryEnum.Custom.ToString(),
                    GiftNotes = command.GiftMetaData?.GiftNotes ?? string.Empty
                };

                _logger.LogInformation("Creating payment intent for guest {GuestId} with amount {Amount} and currency {Currency}. Metadata: {MetaData}", 
                                       command.AuthContext.GuestId, command.Amount, command.Currency, JsonSerializer.Serialize(giftMetaData));

                var result = await _stripePaymentProvider.CreatePaymentIntent(
                    command.AuthContext.Audience,
                    guestDto,
                    command.Amount,
                    command.Currency,
                    giftMetaData, 
                    cancellationToken);

                _logger.LogInformation("Payment result: {Result} with amount {Amount} and currency {Currency}. Metadata: {MetaData}",
                    JsonSerializer.Serialize(result), command.Amount, command.Currency, JsonSerializer.Serialize(giftMetaData));

                // Check for Stripe-specific errors from the payment provider
                if (result.Error != null)
                {
                    _logger.LogError("Stripe error occurred: Type={ErrorType}, Code={ErrorCode}, Message={ErrorMessage}",
                        result.Error.Type, result.Error.Code, result.Error.Message);
                    
                    // Return the error directly instead of throwing an exception
                    // This allows the client to get detailed error information
                    return result;
                }

                if (!string.IsNullOrEmpty(result.PaymentIntentId))
                {
                    try 
                    {
                        // Verify the payment intent exists and is valid before proceeding
                        var checkResult = await _stripePaymentProvider.GetPaymentIntent(result.PaymentIntentId, cancellationToken);
                        
                        if (checkResult.Error != null)
                        {
                            _logger.LogError("Payment intent verification failed: {ErrorMessage}", checkResult.Error.Message);
                            return checkResult;
                        }
                        
                        var paymentEntity = new PaymentIntentEntity
                        {
                            PaymentIntentId = result.PaymentIntentId,
                            GuestId = command.AuthContext.GuestId,
                            InvitationCode = command.AuthContext.InvitationCode,
                            Amount = (long)command.Amount,
                            Currency = command.Currency,
                            GiftCategory = giftMetaData.GiftCategory,
                            GiftNotes = giftMetaData.GiftNotes,
                            GuestName = giftMetaData.GuestName,
                            IsAnonymous = giftMetaData.IsAnonymous,
                            Timestamp = DateTime.UtcNow.ToString("o"),
                            Status = checkResult.Status // Store the payment status
                        };

                        _logger.LogInformation("Saving payment with status {Status}: {Payment}",
                            paymentEntity.Status,
                            JsonSerializer.Serialize(paymentEntity));

                        await _dynamoDBProvider.SavePaymentAsync(command.AuthContext.Audience, paymentEntity, cancellationToken);
                        
                        // Only send confirmation email if payment is successful or processing
                        // Don't send for failed, canceled, or other statuses
                        if (checkResult.Status == "succeeded" || checkResult.Status == "processing")
                        {
                            if (checkResult.Error != null)
                            {
                                _logger.LogError("Payment intent verification failed: {ErrorMessage}", checkResult.Error.Message);
                                return checkResult;
                            }
                        }
                        else 
                        {
                            _logger.LogWarning("Skipping confirmation email for payment {PaymentId} with status {Status}", 
                                result.PaymentIntentId, checkResult.Status);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error verifying payment intent {PaymentId}", result.PaymentIntentId);
                        return new StripePaymentIntentResponseDto
                        {
                            Error = new PaymentError
                            {
                                Type = "verification_error",
                                Code = "payment_verification_failed",
                                Message = "Could not verify payment status. Please check your payment method."
                            }
                        };
                    }
                }
                else
                {
                    _logger.LogWarning("No payment intent ID was returned from Stripe. This indicates a potential issue with the Stripe integration.");
                }

                return result;
            }
            catch (Stripe.StripeException stripeEx)
            {
                // Handle Stripe-specific exceptions with detailed logging and appropriate error response
                _logger.LogError(stripeEx, 
                    "Stripe exception occurred: Type={ErrorType}, Code={ErrorCode}, DeclineCode={DeclineCode}, Message={ErrorMessage}", 
                    stripeEx.StripeError?.Type, 
                    stripeEx.StripeError?.Code, 
                    stripeEx.StripeError?.DeclineCode,
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
                _logger.LogError(ex, "An unexpected error occurred while creating payment. Error: {ErrorMessage}, Stack: {StackTrace}", ex.Message, ex.StackTrace);
                
                // Return a structured error object instead of throwing an exception
                // This allows the frontend to display a more specific error message
                return new StripePaymentIntentResponseDto
                {
                    Error = new PaymentError
                    {
                        Type = "server_error",
                        Code = "internal_error",
                        Message = "An unexpected error occurred while processing your payment. Please try again."
                    }
                };
            }
        }
    }
}
