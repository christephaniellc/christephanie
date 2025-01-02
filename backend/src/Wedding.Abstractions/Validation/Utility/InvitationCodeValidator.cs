using FluentValidation;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    public class InvitationCodeValidator : AbstractValidator<string>, IValidate<string>
    {
        public InvitationCodeValidator()
        {
            RuleFor(invitationCode => invitationCode.ToUpper())
                .NotEmpty()
                .Length(5).WithMessage("Invalid code.")
                .Matches(@"^[A-HJ-NP-TV-Y]{5}$").WithMessage("Invalid code.");
        }

        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="_">The .</param>
        public void IsValid(string? obj, object? _ = null)
            => this!.ValidateAndThrow(obj);
    }
}
