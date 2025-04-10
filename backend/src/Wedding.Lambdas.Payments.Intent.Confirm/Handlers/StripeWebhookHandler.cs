using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Stripe;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Payments.Intent.Confirm.Commands;
using Wedding.Lambdas.Payments.Intent.Confirm.Validation;
using StripeConfiguration = Wedding.Common.Configuration.StripeConfiguration;

namespace Wedding.Lambdas.Payments.Intent.Confirm.Handlers
{
    public class StripeWebhookHandler :
        IAsyncQueryHandler<GetPaymentIntentStatusQuery, StripePaymentIntentResponseDto>
    {
        private readonly ILogger<StripeWebhookHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;
        private readonly IAwsSesHelper _sesHelper;

        public StripeWebhookHandler(ILogger<StripeWebhookHandler> logger, IDynamoDBProvider dynamoDbProvider, IMapper mapper, IAwsSesHelper sesHelper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDbProvider;
            _mapper = mapper;
            _sesHelper = sesHelper;
        }

        public async Task<StripePaymentIntentResponseDto> GetAsync(GetPaymentIntentStatusQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var config = await AwsParameterCache.GetConfigAsync<StripeConfiguration>();
                var endpointSecret = config.WebhookSecret;
                if (string.IsNullOrEmpty(endpointSecret))
                {
                    throw new Exception("Stripe webhook secret is not configured");
                }

                var stripeEvent = EventUtility.ConstructEvent(
                    query.RequestBodyJson,
                    query.SignatureHeader,
                    endpointSecret
                );

                _logger.LogInformation("Received Stripe event: {Type}", stripeEvent.Type);

                if (stripeEvent.Type == "payment_intent.succeeded")
                {
                    var intent = stripeEvent.Data.Object as PaymentIntent;
                    var metaData = new GiftMetaData
                    {
                        Audience = intent.Metadata["Audience"],
                        GuestId = intent.Metadata["GuestId"],
                        InvitationCode = intent.Metadata["InvitationCode"],
                        GuestName = intent.Metadata["GuestName"],
                        GuestEmail = intent.Metadata["GuestEmail"],
                        GiftCategory = intent.Metadata["GiftCategory"],
                        GiftNotes = intent.Metadata["GiftNotes"],
                        IsAnonymous = bool.TryParse(intent.Metadata["isAnonymous"], out var anon) && anon
                    };

                    _logger.LogInformation("PaymentIntent succeeded: {Id} - audience: {Audience}", intent.Id, metaData.Audience);
                    _logger.LogInformation("Metadata: {Metadata}", JsonSerializer.Serialize(metaData, new JsonSerializerOptions { WriteIndented = true }));

                    var paymentEntity = await _dynamoDBProvider.GetPaymentByIdAsync(metaData.Audience, intent.Id, cancellationToken);

                    // var paymentEntity = new PaymentIntentEntity
                    // {
                    //     PaymentIntentId = intent.Id,
                    //     GuestId = metaData.GuestId,
                    //     InvitationCode = metaData.InvitationCode,
                    //     Amount = intent.Amount,
                    //     Currency = intent.Currency,
                    //     GiftCategory = metaData.GiftCategory,
                    //     GiftNotes = metaData.GiftNotes,
                    //     GuestName = metaData.GuestName,
                    //     IsAnonymous = metaData.IsAnonymous,
                    //     Timestamp = DateTime.UtcNow.ToString("o"),
                    //     Status = intent.Status // Store the payment status
                    // };

                    _logger.LogInformation("Updating payment with status {Status}: (current): {Payment}",
                        intent.Status,
                        JsonSerializer.Serialize(paymentEntity));

                    await _dynamoDBProvider.UpdatePaymentStatusAsync(metaData.Audience, paymentEntity, intent.Status, cancellationToken);

                    try
                    {
                        await SendPaymentConfirmationEmail(
                            metaData.GuestName,
                            metaData.GuestEmail,
                            intent.Id,
                            intent.Amount / 100M, // Convert cents to dollars for email display
                            metaData.GiftCategory,
                            metaData.GiftNotes,
                            paymentEntity.Timestamp,
                            cancellationToken);
                    }
                    catch (Exception emailEx)
                    {
                        _logger.LogError(emailEx, "Failed to send payment confirmation email to {Email}", metaData.GuestEmail);
                    }

                    return _mapper.Map<StripePaymentIntentResponseDto>(paymentEntity);
                }
            }
            catch (StripeException stripeEx)
            {
                _logger.LogError(stripeEx, "Stripe error: {Message}", stripeEx.Message);

                return new StripePaymentIntentResponseDto
                {
                    Error = new PaymentError
                    {
                        Type = "verification_error",
                        Code = "400",
                        Message = stripeEx.Message
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected webhook error: " + ex.Message);
                return new StripePaymentIntentResponseDto
                {
                    Error = new PaymentError
                    {
                        Type = "verification_error",
                        Code = "500",
                        Message = ex.Message
                    }
                };
            }
            return new StripePaymentIntentResponseDto
            {
                Error = new PaymentError
                {
                    Type = "verification_error",
                    Code = "501",
                    Message = "unknown error"
                }
            };
        }

        private async Task SendPaymentConfirmationEmail(
            string name,
            string email,
            string paymentIntentId,
            decimal amount,
            string category,
            string notes,
            string timestamp,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("Cannot send payment confirmation email: email address is empty");
                return;
            }

            try
            {
                _logger.LogInformation("Sending payment confirmation email to {Email}", email);

                var response = await _sesHelper.SendPaymentConfirmationEmail(
                    name,
                    email,
                    paymentIntentId,
                    amount,
                    category,
                    notes,
                    timestamp,
                    cancellationToken);

                _logger.LogInformation("Payment confirmation email sent successfully to {Email}, MessageId: {MessageId}",
                    email, response?.MessageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send payment confirmation email to {Email}", email);
                // Don't rethrow - we don't want to fail the payment if email fails
            }
        }
    }
}
