using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Admin.Setup.Commands;

namespace Wedding.Lambdas.Admin.Setup.Validation
{
    /// <summary>
    /// Validator for AdminSetupCommand.
    /// Implements the <see cref="AbstractValidator{ AdminSetupCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class AdminSetupCommandValidator : AbstractValidator<AdminSetupCommand>, IValidate<AdminSetupCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminSetupCommandValidator" /> class.
        /// </summary>
        public AdminSetupCommandValidator()
        {
            RuleFor(query => query.Environment)
                .NotEmpty()
                .Must(env => env == "dev" || env == "prod")
                .WithMessage("Environment must be either 'dev' or 'prod'.");
            RuleFor(query => query.Level)
                .NotEmpty()
                .WithMessage("Missing level (e.g., platinum).");
            RuleFor(query => query.InvitationCode)
                .SetValidator(new InvitationCodeValidator());
        }

        public void IsValid(AdminSetupCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
