using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.User.Patch.Commands;

namespace Wedding.Lambdas.User.Patch.Validation
{
    /// <summary>
    /// Validator for UpdateUserCommand.
    /// Implements the <see cref="AbstractValidator{ UpdateUserCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class PatchUserCommandValidator : AbstractValidator<PatchUserCommand>, IValidate<PatchUserCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PatchUserCommandValidator" /> class.
        /// </summary>
        public PatchUserCommandValidator()
        {
            RuleFor(query => query.AuthContext)
                .SetValidator(new AuthContextValidator(false));
            RuleFor(query => query.ClientInfo)
                .NotNull()
                .WithMessage("ClientInfo cannot be null.")
                .SetValidator(new ClientInfoValidator());
        }

        public void IsValid(PatchUserCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
