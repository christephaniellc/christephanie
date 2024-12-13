using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;

namespace Wedding.Lambdas.Admin.FamilyUnit.Delete.Validation
{
    /// <summary>
    /// Validator for DeleteFamilyUnitCommand.
    /// Implements the <see cref="AbstractValidator{DeleteFamilyUnitCommand}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class DeleteFamilyUnitCommandValidator : AbstractValidator<DeleteFamilyUnitCommand>, IValidate<DeleteFamilyUnitCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="DeleteSiteCommandValidator" /> class.
        /// </summary>
        public DeleteFamilyUnitCommandValidator()
        {
            RuleFor(cmd => cmd.RsvpCode).SetValidator(new RsvpCodeValidator());
        }

        public void IsValid(DeleteFamilyUnitCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
