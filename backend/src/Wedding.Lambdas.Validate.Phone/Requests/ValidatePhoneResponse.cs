using System.Net;
using Wedding.Abstractions.Dtos;
using Wedding.Common.ThirdParty;

namespace Wedding.Lambdas.Validate.Phone.Requests
{
    public class ValidatePhoneResponse
    {
        public TwilioOtpStatusEnum? VerifiedStatus { get; set; }
        public HttpStatusCode? NotificationServiceStatusCode { get; set; }
        public required VerifiedDto PhoneVerifyState { get; set; }
    }
}
