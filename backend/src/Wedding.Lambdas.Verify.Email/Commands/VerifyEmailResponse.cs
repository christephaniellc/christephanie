using Wedding.Abstractions.Dtos;

namespace Wedding.Lambdas.Verify.Email.Commands
{
    public class VerifyEmailResponse
    {
        public required VerifiedDto EmailVerifyState { get; set; }
    }
}
