using System.Net;
using Wedding.Abstractions.Dtos;

namespace Wedding.Lambdas.Validate.Email.Requests
{
    public class ValidateEmailResponse
    {
        public HttpStatusCode? NotificationServiceStatusCode { get; set; }
        public required VerifiedDto EmailVerifyState { get; set; }
    }
}
