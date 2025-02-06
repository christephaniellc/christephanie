using FluentValidation;
using System.Text.RegularExpressions;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    /// <summary>
    /// Validator for phone numbers.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    public class PhoneNumberValidator : AbstractValidator<string>, IValidate<string>
    {
        public PhoneNumberValidator()
        {
            RuleFor(phoneNumber => phoneNumber)
                .NotNull()
                .WithMessage("Phone number cannot be null.");
            RuleFor(arn => arn)
                .NotEmpty()
                .WithMessage("Phone number cannot be empty.")
                .Must(BeAValidPhoneNumber)
                .WithMessage("Invalid phone number.");
        }

        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="_">The .</param>
        public void IsValid(string? obj, object? _ = null)
            => this!.ValidateAndThrow(obj);

        private bool BeAValidPhoneNumber(string phoneNumber)
        {
            // Regular expression for validating E.164 phone numbers.
            // E.164 numbers can have an optional '+' followed by up to 15 digits, and must start with a non-zero digit. 
            var regex = new Regex(@"^\+?(?:[0-9]{1,3})?[ .-]?\(?[0-9]{2,4}\)?[ .-]?[0-9]{2,4}[ .-]?[0-9]{3,4}[ .-]?[0-9]{0,4}$");

            return regex.IsMatch(phoneNumber);
        }
    }
}
