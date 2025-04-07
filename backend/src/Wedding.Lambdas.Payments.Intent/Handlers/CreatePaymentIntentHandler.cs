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
using Wedding.Abstractions.Keys;
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

        public CreatePaymentIntentHandler(ILogger<CreatePaymentIntentHandler> logger, 
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
                    IsAnonymous = command.GiftMetaData?.IsAnonymous ?? false,
                    GiftCategory = command.GiftMetaData?.GiftCategory ?? GiftCategoryEnum.Custom.ToString(),
                    GiftNotes = command.GiftMetaData?.GiftNotes ?? string.Empty
                };

                _logger.LogInformation("Creating payment intent for guest {GuestId} with amount {Amount} and currency {Currency}. Metadata: {MetaData}", 
                                       command.AuthContext.GuestId, command.Amount, command.Currency, JsonSerializer.Serialize(giftMetaData));

                var result = await _stripePaymentProvider.CreatePaymentIntent(
                    guestDto,
                    command.Amount,
                    command.Currency,
                    giftMetaData, 
                    cancellationToken);

                _logger.LogInformation("Payment result: {Result} with amount {Amount} and currency {Currency}. Metadata: {MetaData}",
                    JsonSerializer.Serialize(result), command.Amount, command.Currency, JsonSerializer.Serialize(giftMetaData));

                if (!string.IsNullOrEmpty(result.PaymentIntentId))
                {
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
                        Timestamp = DateTime.UtcNow.ToString()
                    };

                    _logger.LogInformation("Saving payment: {Payment}",
                        JsonSerializer.Serialize(paymentEntity));

                    await _dynamoDBProvider.SavePaymentAsync(command.AuthContext.Audience, paymentEntity, cancellationToken);
                }

                return result;
            }
            catch (Exception ex)
            {
                // TODO: add stripe exceptions here
                _logger.LogError(ex, "An error occurred while creating payment.");
                throw new UnauthorizedAccessException($"{ex.Message}");
            }
        }
    }
}
