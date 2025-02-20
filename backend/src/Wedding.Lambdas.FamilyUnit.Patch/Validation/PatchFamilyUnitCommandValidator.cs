using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.FamilyUnit.Patch.Commands;

namespace Wedding.Lambdas.FamilyUnit.Patch.Validation
{
    /// <summary>
    /// Validator for PatchFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{ PatchFamilyUnitCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class PatchFamilyUnitCommandValidator : AbstractValidator<PatchFamilyUnitCommand>, IValidate<PatchFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PatchFamilyUnitCommandValidator" /> class.
        /// </summary>
        public PatchFamilyUnitCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
            RuleFor(cmd => cmd.MailingAddress!.ToString())
                .SetValidator(new MailingAddressValidator())
                .When(cmd => cmd.MailingAddress != null);
        }

        public void IsValid(PatchFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
