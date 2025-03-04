using FluentValidation;
using PhoneNumbers;
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
        private readonly PhoneNumberUtil _phoneNumberUtil = PhoneNumberUtil.GetInstance();

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
            try
            {
                var parsedNumber = _phoneNumberUtil.Parse(phoneNumber, "US"); // Change "US" if necessary
                return _phoneNumberUtil.IsValidNumber(parsedNumber);
            }
            catch (NumberParseException)
            {
                return false;
            }
        }
    }
}
