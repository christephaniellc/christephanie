using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Guest.MaskedValues.Get.Commands;

namespace Wedding.Lambdas.Guest.MaskedValues.Get.Validation
{
    /// <summary>
    /// Validator for PatchGuestCommand.
    /// Implements the <see cref="AbstractValidator{ PatchGuestCommand }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetMaskedValueCommandValidator : AbstractValidator<GetMaskedValueCommand>, IValidate<GetMaskedValueCommand>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetMaskedValueCommandValidator" /> class.
        /// </summary>
        public GetMaskedValueCommandValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
            RuleFor(cmd => cmd.GuestId)
                .NotNull()
                .NotEmpty()
                .SetValidator(new GuidValidator());
            RuleFor(cmd => cmd.MaskedValueType)
                .IsInEnum();
        }

        public void IsValid(GetMaskedValueCommand obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
