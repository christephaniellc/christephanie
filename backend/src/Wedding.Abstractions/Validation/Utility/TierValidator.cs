using FluentValidation;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    public class TierValidator : AbstractValidator<string>, IValidate<string>
    {
        public TierValidator()
        {
            RuleFor(tier => tier)
                .NotEmpty()
                .Matches(@"^[A-Za-z]+[+-]?$").WithMessage("Invalid tier.");
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
