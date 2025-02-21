using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Rest.Verify.V2.Service;
using Twilio.Types;
using Wedding.Common.Configuration;

namespace Wedding.Common.ThirdParty
{
    public class TwilioSmsProvider : ITwilioSmsProvider
    {
        private ILogger<TwilioSmsProvider> _logger;
        private TwilioSmsConfiguration _config;

        public TwilioSmsProvider(ILogger<TwilioSmsProvider> logger, TwilioSmsConfiguration config)
        {
            _logger = logger;
            _config = config;
            TwilioClient.Init(_config.ApiSid, _config.ApiSecret);
        }

        public async Task<TwilioOtpStatusEnum> SendOTPCode(string? phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
            {
                _logger.LogWarning("Phone number is empty, could not send code.");
                return TwilioOtpStatusEnum.Failed;
            }

            var sendVerification = await VerificationResource.CreateAsync(
                pathServiceSid: _config.VerifyServiceSid,
                to: phoneNumber,
                channel: TwilioChannelEnum.Sms.ToString().ToLower()
            );
                // customCode: code,
                // sendDigits: code);

            Console.WriteLine($"Verification sent: {sendVerification.Status}");

            Enum.TryParse<TwilioOtpStatusEnum>(sendVerification.Status, true, out var parsedStatus);

            return parsedStatus;
        }

        public async Task<bool> CheckVerification(string? phoneNumber, string code)
        {
            if (string.IsNullOrEmpty(phoneNumber))
            {
                _logger.LogWarning("Phone number is empty, could not send code.");
                return false;
            }

            var checkVerification = await VerificationCheckResource.CreateAsync(
                pathServiceSid: _config.VerifyServiceSid,
                to: phoneNumber, //"+1234567890"
                code: code
            );

            _logger.LogInformation($"Verification Status: {checkVerification.Status}");

            return Enum.TryParse<TwilioOtpStatusEnum>(checkVerification.Status, true, out var parsedStatus) 
                   && parsedStatus == TwilioOtpStatusEnum.Approved;
        }

        public async Task<string?> SendSms(string? phoneNumber, bool verified, bool optedIn, string body)
        {
            if (string.IsNullOrEmpty(phoneNumber))
            {
                _logger.LogWarning("Phone number is empty, could not send code.");
                return null;
            }

            if (!optedIn || !verified)
            {
                return null;
            }

            var message = await MessageResource.CreateAsync(
                messagingServiceSid: _config.MessagingServiceSid,
                //statusCallback: new Uri("http://example.com/MessageStatus"),
                body: body,
                from: new PhoneNumber(_config.TwilioFromPhone),
                to: new PhoneNumber(phoneNumber) //"+1234567890"
            );

            Console.WriteLine($"Message sent: {message.Sid}");

            return message.Sid;
        }
    }
}
