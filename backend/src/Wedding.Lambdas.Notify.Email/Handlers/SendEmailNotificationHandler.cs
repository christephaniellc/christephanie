using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Amazon.SimpleEmail.Model;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Enums;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Notify.Email.Commands;
using Wedding.Lambdas.Notify.Email.Validation;

namespace Wedding.Lambdas.Notify.Email.Handlers
{
    public class SendEmailNotificationHandler : 
        IAsyncCommandHandler<SendEmailNotificationCommand, List<GuestEmailLogDto>>
    {
        private readonly ILogger<SendEmailNotificationHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;
        private readonly IAwsSesHelper _sesHelper;

        public SendEmailNotificationHandler(ILogger<SendEmailNotificationHandler> logger, 
            IDynamoDBProvider dynamoDBProvider, 
            IMapper mapper, 
            IAwsSesHelper sesHelper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
            _sesHelper = sesHelper;
        }

        public async Task<List<GuestEmailLogDto>> ExecuteAsync(SendEmailNotificationCommand command,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            command.Validate(nameof(command));
            var emailResults = new List<GuestEmailLogDto>();
            var guestsWithEmails = new List<GuestDto>();

            try
            {
                if (command.GuestId != null)
                {
                    _logger.LogInformation($"Sending notification email to specific guest ID: {command.GuestId}");

                    var guests = await _dynamoDBProvider.QueryByGuestIdIndex(command.AuthContext.Audience, command.GuestId,
                        cancellationToken);

                    guestsWithEmails = 
                        guests
                        .Select(g => _mapper.Map<GuestDto>(g))
                        .Where(g => g.Email != null && g.Email.Verified)      // Filter by verified emails
                        .ToList();
                }
                else
                {
                    var allFamilies =
                        await _dynamoDBProvider.GetFamilyUnitsAsync(command.AuthContext.Audience, cancellationToken);
                    guestsWithEmails = allFamilies
                        .Where(f => f.Guests != null)
                        .SelectMany(f => f.Guests!)                       // Flatten all guests
                        .Where(g => g.Email != null && g.Email.Verified)      // Filter by verified emails
                        .ToList();
                }

                if (guestsWithEmails == null)
                {
                    throw new UnauthorizedAccessException("Guests with emails not found.");
                }

                foreach (var guest in guestsWithEmails)
                {
                    try
                    {
                        SendEmailResponse? sendMessageResult = null;

                        switch (command.CampaignType)
                        {
                            case (CampaignTypeEnum.RsvpNotify):
                                sendMessageResult = await _sesHelper.SendRsvpNotificationEmail(
                                    guest.FirstName + " " + guest.LastName,
                                    guest.Email.Value,
                                    (guest.Rsvp != null && guest.Rsvp.InvitationResponse ==
                                        InvitationResponseEnum.Interested),
                                    guest.InvitationCode,
                                    cancellationToken);
                                break;
                            default:
                                throw new NotImplementedException("Campaign not yet implemented.");
                        }

                        var emailLog = new GuestEmailLogDto
                        {
                            GuestEmailLogId = sendMessageResult?.MessageId ?? Guid.NewGuid().ToString(),
                            CampaignId = Guid.NewGuid().ToString(),
                            DeliveryStatus = sendMessageResult != null ? "SUCCESS" : "FAILED",
                            EmailAddress = guest.Email.Value,
                            CampaignType = command.CampaignType,
                            GuestId = guest.GuestId,
                            Verified = guest.Email.Verified,
                            Timestamp = DateTime.UtcNow.ToString("o"),
                            Metadata = new Dictionary<string, string>
                            {
                                { "Interest", guest.Rsvp?.InvitationResponse.ToString() ?? "UNKNOWN" },
                                { "Wedding", guest.Rsvp?.Wedding.ToString() ?? "UNKNOWN" }
                            }
                        };

                        _logger.LogInformation(
                            "Adding notification with status {Status} : CampaignType : {CampaignType} : Email: {EmailAddress}",
                            emailLog.DeliveryStatus,
                            emailLog.CampaignType,
                            emailLog.EmailAddress);

                        var entity = _mapper.Map<NotificationDataEntity>(emailLog);
                        await _dynamoDBProvider.SaveNotificationAsync(command.AuthContext.Audience, entity,
                            cancellationToken);
                        emailResults.Add(emailLog);
                    }
                    catch (NotImplementedException ex)
                    {
                        _logger.LogError(ex, "An error occurred while sending email notifications.");
                        throw new UnauthorizedAccessException($"Notification sending failed. {ex.Message}");
                    }
                    catch (Exception ex)
                    {
                        var failedLog = new GuestEmailLogDto
                        {
                            GuestEmailLogId = Guid.NewGuid().ToString(),
                            CampaignId = Guid.NewGuid().ToString(),
                            DeliveryStatus = "FAILED",
                            EmailAddress = guest.Email?.Value ?? "unknown",
                            CampaignType = CampaignTypeEnum.RsvpNotify,
                            GuestId = guest.GuestId,
                            Verified = guest.Email?.Verified ?? false,
                            Timestamp = DateTime.UtcNow.ToString("o"),
                            Metadata = new Dictionary<string, string>
                            {
                                { "Error", ex.Message },
                                { "Interest", guest.Rsvp?.InvitationResponse.ToString() ?? "UNKNOWN" },
                                { "Wedding", guest.Rsvp?.Wedding.ToString() ?? "UNKNOWN" }
                            }
                        };

                        _logger.LogError(ex, "Failed to send email to GuestId {GuestId} ({Email})", guest.GuestId, guest.Email?.Value);

                        var entity = _mapper.Map<NotificationDataEntity>(failedLog);
                        await _dynamoDBProvider.SaveNotificationAsync(command.AuthContext.Audience, entity, cancellationToken);
                        emailResults.Add(failedLog);
                    }
                }

                _logger.LogInformation("Email send summary: {SuccessCount} succeeded, {FailureCount} failed.",
                    emailResults.Count(e => e.DeliveryStatus == "SUCCESS"),
                    emailResults.Count(e => e.DeliveryStatus == "FAILED"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while sending email notifications.");
                throw new UnauthorizedAccessException($"Notification sending failed. {ex.Message}");
            }

            return emailResults;
        }
    }
}
