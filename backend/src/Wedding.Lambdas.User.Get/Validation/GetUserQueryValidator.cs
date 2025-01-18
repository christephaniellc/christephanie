using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.User.Get.Commands;

namespace Wedding.Lambdas.User.Get.Validation
{
    /// <summary>
    /// Validator for GetUserQuery.
    /// Implements the <see cref="AbstractValidator{ GetUserQuery }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetUserQueryValidator : AbstractValidator<GetUserQuery>, IValidate<GetUserQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetUserQueryValidator" /> class.
        /// </summary>
        public GetUserQueryValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(GetUserQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
