using System.Net;
using Wedding.Abstractions.Dtos;

namespace Wedding.Lambdas.Validate.Phone.Requests
{
    public class ValidatePhoneResponse
    {
        public HttpStatusCode? NotificationServiceStatusCode { get; set; }
        public required VerifiedDto PhoneVerifyState { get; set; }
    }
}
