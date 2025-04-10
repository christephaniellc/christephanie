using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.Extensions.Logging;
using Stripe;
using Wedding.Abstractions.Dtos.Stripe;
using Wedding.Abstractions.Entities;
using Wedding.Common.Helpers.AWS;
using StripeConfiguration = Wedding.Common.Configuration.StripeConfiguration;

namespace Wedding.Lambdas.Payments.Intent.Handlers
{
    public class StripeWebhookHandler
    {
        private readonly ILogger<StripeWebhookHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IAwsSesHelper _sesHelper;

        public StripeWebhookHandler(ILogger<StripeWebhookHandler> logger, IDynamoDBProvider dynamoDbProvider, IAwsSesHelper sesHelper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDbProvider;
            _sesHelper = sesHelper;
        }

        public async Task<APIGatewayProxyResponse> HandleAsync(APIGatewayProxyRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var json = request.Body;
                var signatureHeader = request.Headers["Stripe-Signature"];

                var config = await AwsParameterCache.GetConfigAsync<StripeConfiguration>();
                var endpointSecret = config.WebhookSecret;
                if (string.IsNullOrEmpty(endpointSecret))
                {
                    throw new Exception("Stripe webhook secret is not configured");
                }

                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    signatureHeader,
                    endpointSecret
                );

                _logger.LogInformation("Received Stripe event: {Type}", stripeEvent.Type);

                if (stripeEvent.Type == "payment_intent.succeeded")
                {
                    var intent = stripeEvent.Data.Object as PaymentIntent;
                    var metaData = new GiftMetaData
                    {
                        Audience = intent.Metadata["audience"],
                        GuestId = intent.Metadata["guestId"],
                        InvitationCode = intent.Metadata["invitationCode"],
                        GuestName = intent.Metadata["guestName"],
                        GuestEmail = intent.Metadata["guestEmail"],
                        GiftCategory = intent.Metadata["giftCategory"],
                        GiftNotes = intent.Metadata["giftNotes"],
                        IsAnonymous = bool.TryParse(intent.Metadata["isAnonymous"], out var anon) && anon
                    };

                    _logger.LogInformation("PaymentIntent succeeded: {Id} - audience: {Audience}", intent.Id, metaData.Audience);
                    _logger.LogInformation("Metadata: {Metadata}", JsonSerializer.Serialize(metaData, new JsonSerializerOptions { WriteIndented = true }));

                    var paymentEntity = new PaymentIntentEntity
                    {
                        PaymentIntentId = intent.Id,
                        GuestId = metaData.GuestId,
                        InvitationCode = metaData.InvitationCode,
                        Amount = intent.Amount,
                        Currency = intent.Currency,
                        GiftCategory = metaData.GiftCategory,
                        GiftNotes = metaData.GiftNotes,
                        GuestName = metaData.GuestName,
                        IsAnonymous = metaData.IsAnonymous,
                        Timestamp = DateTime.UtcNow.ToString("o"),
                        Status = intent.Status // Store the payment status
                    };

                    _logger.LogInformation("Saving payment with status {Status}: {Payment}",
                        paymentEntity.Status,
                        JsonSerializer.Serialize(paymentEntity));

                    await _dynamoDBProvider.SavePaymentAsync(metaData.Audience, paymentEntity, cancellationToken);

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
                }

                return new APIGatewayProxyResponse
                {
                    StatusCode = 200,
                    Body = "Webhook handled successfully"
                };
            }
            catch (StripeException stripeEx)
            {
                _logger.LogError(stripeEx, "Stripe error: {Message}", stripeEx.Message);
                return new APIGatewayProxyResponse
                {
                    StatusCode = 400,
                    Body = $"Stripe error: {stripeEx.Message}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected webhook error");
                return new APIGatewayProxyResponse
                {
                    StatusCode = 500,
                    Body = $"Webhook error: {ex.Message}"
                };
            }
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
