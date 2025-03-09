using Wedding.Abstractions.Enums;

namespace Wedding.Lambdas.Validate.Email.Requests
{
    public class ValidateEmailRequest
    {
        public string? Email { get; set; }
        public string? Code { get; set; }
        public VerifyEnum? Action { get; set; }
    }
}
