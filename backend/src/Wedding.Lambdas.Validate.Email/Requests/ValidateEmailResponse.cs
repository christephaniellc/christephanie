using System.Net;
using Wedding.Abstractions.Dtos;
using Wedding.Common.ThirdParty;

namespace Wedding.Lambdas.Validate.Email.Requests
{
    public class ValidateEmailResponse
    {
        public TwilioOtpStatusEnum? VerifiedStatus { get; set; }
        public HttpStatusCode? NotificationServiceStatusCode { get; set; }
        public required VerifiedDto EmailVerifyState { get; set; }
    }
}
