using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Lambdas.Authorize.Commands;

namespace Wedding.Lambdas.Authorize.Validation
{
    /// <summary>
    /// Validator for ValidateAuthorizationQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class AuthorizationQueryValidator : AbstractValidator<ValidateAuthorizationQuery>, IValidate<ValidateAuthorizationQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AuthorizationQueryValidator" /> class.
        /// </summary>
        public AuthorizationQueryValidator()
        {
            RuleFor(cmd => cmd.Token)
                .SetValidator(cmd => new JwtTokenValidator(cmd.JwtAuthority, cmd.JwtAudience));
            RuleFor(cmd => cmd.MethodArn)
                .SetValidator(new ArnValidator());
        }

        public void IsValid(ValidateAuthorizationQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
