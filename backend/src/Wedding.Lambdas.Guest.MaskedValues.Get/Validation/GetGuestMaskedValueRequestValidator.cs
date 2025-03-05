using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Guest.MaskedValues.Get.Requests;

namespace Wedding.Lambdas.Guest.MaskedValues.Get.Validation
{
    /// <summary>
    /// Validator for PatchGuestCommand.
    /// Implements the <see cref="AbstractValidator{ GetGuestMaskedValuesRequest }" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetGuestMaskedValueRequestValidator : AbstractValidator<GetGuestMaskedValuesRequest>, IValidate<GetGuestMaskedValuesRequest>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PatchGuestCommandValidator" /> class.
        /// </summary>
        public GetGuestMaskedValueRequestValidator()
        {
            RuleFor(cmd => cmd.GuestId)
                .NotNull()
                .NotEmpty()
                .SetValidator(new GuidValidator());
            RuleFor(cmd => cmd.MaskedValueType)
                .IsInEnum();
        }

        public void IsValid(GetGuestMaskedValuesRequest obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
