using FluentValidation;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    public class MailingAddressValidator : AbstractValidator<string>, IValidate<string>
    {
        public MailingAddressValidator()
        {
            RuleFor(rsvpCode => rsvpCode)
                .NotEmpty()
                .WithMessage("Mailing address is empty.")
                ;
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
