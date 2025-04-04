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

                var customerService = new CustomerService(_stripeClient);
                var paymentIntentService = new PaymentIntentService(_stripeClient);

                // 1. Create Stripe customer (if not already created and stored)
                var customer = await customerService.CreateAsync(new CustomerCreateOptions
                {
                    Email = guest.Email.Value,
                    Metadata = new Dictionary<string, string>
                    {
                        { "GuestId", guest.GuestId },
                        { "GuestName", $"{guest.FirstName} {guest.LastName}" }
                    }
                }, new RequestOptions { IdempotencyKey = Guid.NewGuid().ToString() });

                // 2. Create PaymentIntent
                var paymentIntentOptions = new PaymentIntentCreateOptions
                {
                    Amount = amount,
                    Currency = currency,
                    Customer = customer.Id,
                    Metadata = new Dictionary<string, string>
                    {
                        { "GuestId", guest.GuestId },
                        { "GuestEmail", guest.Email.Value },
                        { "GuestName", $"{guest.FirstName} {guest.LastName}" },
                        { "IsAnonymous", giftMetaData.IsAnonymous.ToString() },
                        { "GiftCategory", giftMetaData.GiftCategory },
                        { "GiftNotes", giftMetaData.GiftNotes }
                    },
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true
                    }
                };

                var paymentIntent = await paymentIntentService.CreateAsync(paymentIntentOptions, cancellationToken: cancellationToken);

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
                _logger.LogError(ex, "Stripe error during payment intent creation.");
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
            var customer = service.Update(customerId, options);

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
