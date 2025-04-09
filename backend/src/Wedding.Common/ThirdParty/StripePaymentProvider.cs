using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Stripe;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Stripe;
using StripeConfiguration = Wedding.Common.Configuration.StripeConfiguration;

namespace Wedding.Common.ThirdParty
{
    public class StripePaymentProvider : IStripePaymentProvider
    {
        private ILogger<StripePaymentProvider> _logger;
        private StripeConfiguration _config;
        private StripeClient _stripeClient;

        public StripePaymentProvider(ILogger<StripePaymentProvider> logger, StripeConfiguration config)
        {
            _logger = logger;
            _config = config;
            _stripeClient = new Stripe.StripeClient(_config.SecretKey);
            _logger.LogInformation($"Stripe public key: {_config.PublicKey}");
        }

        public async Task<StripePaymentIntentResponseDto> CreatePaymentIntent(
            GuestDto guest, 
            int amount, 
            string currency, 
            GiftMetaData giftMetaData, 
            CancellationToken cancellationToken = default(CancellationToken))
        {
            try
            {
                _logger.LogInformation("Initializing Stripe payment intent creation for guest {GuestId}", guest.GuestId);
                _logger.LogDebug("Stripe configuration: PublicKey={PublicKey}, Environment={Environment}", 
                    _config.PublicKey, 
                    _config.SecretKey.StartsWith("sk_test") ? "Dev" : "Production");

                var customerService = new CustomerService(_stripeClient);
                var paymentIntentService = new PaymentIntentService(_stripeClient);

                // 1. Create Stripe customer (if not already created and stored)
                var idempotencyKey = Guid.NewGuid().ToString();
                _logger.LogInformation("Creating Stripe customer for guest {GuestId} with email {Email} and idempotencyKey {IdempotencyKey}", 
                    guest.GuestId, guest.Email.Value, idempotencyKey);
                
                var customer = await customerService.CreateAsync(new CustomerCreateOptions
                {
                    Email = guest.Email.Value,
                    Metadata = new Dictionary<string, string>
                    {
                        { "GuestId", guest.GuestId },
                        { "GuestName", $"{guest.FirstName} {guest.LastName}" }
                    }
                }, new RequestOptions { IdempotencyKey = idempotencyKey });

                _logger.LogInformation("Successfully created Stripe customer {CustomerId} for guest {GuestId}", 
                    customer.Id, guest.GuestId);

                // 2. Create PaymentIntent
                _logger.LogInformation("Creating payment intent for amount {Amount} {Currency} with customerId {CustomerId}", 
                    amount, currency, customer.Id);
                
                var metadata = new Dictionary<string, string>
                {
                    { "GuestId", guest.GuestId },
                    { "GuestEmail", guest.Email.Value },
                    { "GuestName", $"{guest.FirstName} {guest.LastName}" },
                    { "IsAnonymous", giftMetaData.IsAnonymous.ToString() },
                    { "GiftCategory", giftMetaData.GiftCategory },
                    { "GiftNotes", giftMetaData.GiftNotes }
                };
                
                var paymentIntentOptions = new PaymentIntentCreateOptions
                {
                    Amount = amount,
                    Currency = currency,
                    Customer = customer.Id,
                    Metadata = metadata,
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true
                    }
                };

                var paymentIntent = await paymentIntentService.CreateAsync(
                    paymentIntentOptions, 
                    new RequestOptions { IdempotencyKey = $"pi_{Guid.NewGuid().ToString()}" }, 
                    cancellationToken: cancellationToken);

                _logger.LogInformation("Successfully created payment intent {PaymentIntentId} for guest {GuestId}", 
                    paymentIntent.Id, guest.GuestId);

                return new StripePaymentIntentResponseDto
                {
                    ClientSecret = paymentIntent.ClientSecret,
                    PaymentIntentId = paymentIntent.Id,
                    Amount = paymentIntent.Amount,
                    Currency = paymentIntent.Currency
                };
            }
            catch (StripeException ex)
            {
                // Enhanced logging for Stripe exceptions
                _logger.LogError(ex, 
                    "Stripe error during payment intent creation. Error Type: {ErrorType}, Code: {ErrorCode}, DeclineCode: {DeclineCode}, " + 
                    "Message: {ErrorMessage}, Request ID: {RequestId}",
                    ex.StripeError?.Type,
                    ex.StripeError?.Code,
                    ex.StripeError?.DeclineCode,
                    ex.Message,
                    ex.StripeError?.PaymentIntent?.Id ?? "unknown");
                
                // Log debugging information about API keys
                _logger.LogDebug("Stripe configuration check: API Key starts with {KeyPrefix}, Environment: {Environment}", 
                    _config.SecretKey.Substring(0, Math.Min(7, _config.SecretKey.Length)), 
                    _config.SecretKey.StartsWith("sk_test") ? "Test" : "Production");
                
                return new StripePaymentIntentResponseDto
                {
                    Error = new PaymentError
                    {
                        Message = ex.Message,
                        Code = ex.StripeError?.Code,
                        Type = ex.StripeError?.Type,
                        DeclineCode = ex.StripeError?.DeclineCode
                    }
                };
            }
            catch (Exception ex)
            {
                // Handle other exceptions
                _logger.LogError(ex, "Non-Stripe exception during payment intent creation: {ErrorMessage}", ex.Message);
                
                return new StripePaymentIntentResponseDto
                {
                    Error = new PaymentError
                    {
                        Message = "An unexpected error occurred while processing your payment.",
                        Type = "server_error",
                        Code = "unexpected_error"
                    }
                };
            }
        }

        public async Task<Customer> CreateCustomer(GuestDto guest)
        {
            var options = new CustomerCreateOptions
            {
                Email = guest.Email.Value,
                Metadata = new Dictionary<string, string>
                {
                    { "GuestId", guest.GuestId },
                    { "GuestFirstName", guest.FirstName },
                    { "GuestLastName", guest.LastName },
                    { "TransactionId", Guid.NewGuid().ToString() }
                }
            };
            var requestOptions = new RequestOptions
            {
                IdempotencyKey = Guid.NewGuid().ToString(),
            };

            var service = new CustomerService();
            return await service.CreateAsync(options, requestOptions);
        }

        public async Task<Customer> GetCustomer(string customerId)
        {
            var service = new CustomerService();
            var customer = await service.GetAsync(customerId);
            return customer;
        }

        public async Task<Customer> UpdateCustomer(string customerId, string updatedGuestEmail)
        {
            var options = new CustomerUpdateOptions
            {
                Email = updatedGuestEmail
            };

            var service = new CustomerService();
            var customer = await service.UpdateAsync(customerId, options);

            return customer;
        }

        public async Task DeleteCustomer(string customerId)
        {
            var service = new CustomerService();
            var deletedCustomer = await service.DeleteAsync(customerId);

            // The deleted customer is returned
            Console.WriteLine(deletedCustomer.Deleted);
        }
    }
}
