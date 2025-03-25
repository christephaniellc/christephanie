using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Admin.Configuration.Invitation.Commands;

namespace Wedding.Lambdas.Admin.Configuration.Invitation.Validation
{
    /// <summary>
    /// Validator for AdminGetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class AdminGetPhotoConfigurationQueryValidator : AbstractValidator<AdminGetPhotoConfigurationQuery>, IValidate<AdminGetPhotoConfigurationQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminGetPhotoConfigurationsQueryValidator" /> class.
        /// </summary>
        public AdminGetPhotoConfigurationQueryValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
            RuleFor(cmd => cmd.DesignId)
                .NotNull()
                .SetValidator(new GuidValidator());
        }

        public void IsValid(AdminGetPhotoConfigurationQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
