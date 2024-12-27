using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;

namespace Wedding.Abstractions.Validation
{
    /// <summary>
    /// Used by admin controllers to validate the request to update a family unit.
    /// </summary>
    public class UpdateFamilyUnitDtoValidator : AbstractValidator<FamilyUnitDto>, IValidate<FamilyUnitDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UpdateFamilyUnitDtoValidator"/> class.
        /// </summary>
        public UpdateFamilyUnitDtoValidator()
        {
            //RuleFor(s => s.Id).NotEmpty();
            RuleFor(s => s.RsvpCode).SetValidator(new InvitationCodeValidator());
            RuleFor(f => f.Tier).SetValidator(new TierValidator());
            RuleFor(f => f.Guests)
                .NotNull()
                .NotEmpty()
                .Must(guests => guests?.Count > 0)
                .WithMessage("Must include at least one guest");

            //RuleForEach(s => s.Guests).SetValidator(new GuestDtoValidator());
            RuleForEach(f => f.Guests).SetValidator(new UpdateGuestDtoValidator());
        }

        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="_">The .</param>
        public void IsValid(FamilyUnitDto obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
