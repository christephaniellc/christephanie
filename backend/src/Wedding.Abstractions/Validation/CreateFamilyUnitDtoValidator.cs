using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;

namespace Wedding.Abstractions.Validation
{
    public class CreateFamilyUnitDtoValidator : AbstractValidator<FamilyUnitDto>, IValidate<FamilyUnitDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CreateFamilyUnitDtoValidator"/> class.
        /// </summary>
        public CreateFamilyUnitDtoValidator()
        {
            RuleFor(f => f.InvitationCode).SetValidator(new InvitationCodeValidator());
            RuleFor(f => f.Tier).SetValidator(new TierValidator());
            RuleFor(f => f.Guests)
                .NotNull()
                .NotEmpty()
                .Must(guests => guests?.Count > 0)
                .WithMessage("Must include at least one guest");
            RuleForEach(f => f.Guests).SetValidator(new CreateGuestDtoValidator());
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
