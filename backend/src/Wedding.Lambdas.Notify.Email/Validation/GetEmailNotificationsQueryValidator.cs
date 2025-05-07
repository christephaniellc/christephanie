using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Notify.Email.Commands;

namespace Wedding.Lambdas.Notify.Email.Validation
{
    /// <summary>
    /// Validator for AdminGetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetEmailNotificationsQueryValidator : AbstractValidator<GetEmailNotificationsQuery>, IValidate<GetEmailNotificationsQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetEmailNotificationsQueryValidator" /> class.
        /// </summary>
        public GetEmailNotificationsQueryValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
        }

        public void IsValid(GetEmailNotificationsQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
