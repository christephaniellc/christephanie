using FluentValidation;
using System.Net.Mail;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    public class EmailValidator : AbstractValidator<string>, IValidate<string>
    {
        public EmailValidator()
        {
            RuleFor(email => email)
                .NotEmpty()
                .WithMessage("Email cannot be empty.")
                .Must(email => BeAValidEmail(email))
                .WithMessage("Invalid email.");
        }

        private bool BeAValidEmail(string email)
        {
            try
            {
                var addr = new MailAddress(email);

                // Check that the domain part contains at least one dot.
                if (!addr.Host.Contains("."))
                {
                    return false;
                }

                // Check that the local part does not contain consecutive dots.
                if (addr.User.Contains(".."))
                {
                    return false;
                }

                return addr.Address == email;
            }
            catch
            {
                return false;
            }
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
