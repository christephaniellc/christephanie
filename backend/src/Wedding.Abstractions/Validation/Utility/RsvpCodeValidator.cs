using FluentValidation;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    public class RsvpCodeValidator : AbstractValidator<string>, IValidate<string>
    {
        public RsvpCodeValidator()
        {
            RuleFor(rsvpCode => rsvpCode)
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
            => this.ValidateAndThrow(obj);
    }
}
