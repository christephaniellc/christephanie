using Wedding.Abstractions.Enums;

namespace Wedding.Lambdas.Validate.Phone.Requests
{
    public class ValidatePhoneRequest
    {
        public string? PhoneNumber { get; set; }
        public string? Code { get; set; }
        public VerifyEnum? Action { get; set; }
    }
}
