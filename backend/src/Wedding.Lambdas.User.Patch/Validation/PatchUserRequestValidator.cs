using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.User.Patch.Commands;

namespace Wedding.Lambdas.User.Patch.Validation
{
    /// <summary>
    /// Validator for PatchUserRequest.
    /// Implements the <see cref="AbstractValidator{ PatchUserRequest }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class PatchUserRequestValidator : AbstractValidator<PatchUserRequest>, IValidate<PatchUserRequest>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PatchUserRequestValidator" /> class.
        /// </summary>
        public PatchUserRequestValidator()
        {
            RuleFor(query => query.ClientInfo)
                .NotNull()
                .WithMessage("ClientInfo is required.")
                .SetValidator(new ClientInfoValidator());
        }

        public void IsValid(PatchUserRequest obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
