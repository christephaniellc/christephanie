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
    internal class AdminDeletePhotoConfigurationCommandValidator : AbstractValidator<AdminDeletePhotoConfigurationCommand>, IValidate<AdminDeletePhotoConfigurationCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminDeletePhotoConfigurationCommandValidator" /> class.
        /// </summary>
        public AdminDeletePhotoConfigurationCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
            RuleFor(cmd => cmd.DesignId)
                .NotEmpty()
                .SetValidator(new InvitationCodeValidator());
        }

        public void IsValid(AdminDeletePhotoConfigurationCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
