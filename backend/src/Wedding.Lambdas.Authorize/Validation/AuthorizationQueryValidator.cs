using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Authorize.Commands;

namespace Wedding.Lambdas.Authorize.Validation
{
    /// <summary>
    /// Validator for ValidateAuthQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class AuthorizationQueryValidator : AbstractValidator<ValidateAuthQuery>, IValidate<ValidateAuthQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AuthorizationQueryValidator" /> class.
        /// </summary>
        public AuthorizationQueryValidator()
        {
            RuleFor(cmd => cmd.Token)
                .SetValidator(cmd => new JwtTokenValidator(cmd.JwtAuthority, cmd.JwtAudience));
            RuleFor(cmd => cmd.MethodArn)
                .NotEmpty();
            // .SetValidator(new ArnValidator());
        }

        public void IsValid(ValidateAuthQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
