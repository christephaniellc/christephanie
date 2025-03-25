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
    internal class AdminSavePhotoConfigurationCommandValidator : AbstractValidator<AdminSavePhotoConfigurationCommand>, IValidate<AdminSavePhotoConfigurationCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AdminSavePhotoConfigurationCommandValidator" /> class.
        /// </summary>
        public AdminSavePhotoConfigurationCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(true));
            // RuleFor(cmd => cmd.)
            //     .NotEmpty()
            //     .SetValidator(new InvitationCodeValidator());
        }

        public void IsValid(AdminSavePhotoConfigurationCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
