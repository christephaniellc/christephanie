using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;

namespace Wedding.Abstractions.Validation
{
    public class GetFamilyUnitDtoValidator : AbstractValidator<FamilyUnitDto>, IValidate<FamilyUnitDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetFamilyUnitDtoValidator"/> class.
        /// </summary>
        public GetFamilyUnitDtoValidator()
        {
            RuleFor(f => f.RsvpCode).SetValidator(new RsvpCodeValidator());
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
