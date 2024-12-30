using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation
{
    public class GuestDtoValidator : AbstractValidator<GuestDto>, IValidate<GuestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GuestDtoValidator"/> class.
        /// Checked during RSVP validation
        /// </summary>
        public GuestDtoValidator()
        {
            RuleFor(g => g.FirstName)
                .NotEmpty()
                .WithMessage(ValidationMessages.MustNotBeNullOrWhitespace("First name"))
                ;
            RuleFor(g => g.LastName)
                .NotEmpty()
                .WithMessage(ValidationMessages.MustNotBeNullOrWhitespace("Last name"))
                ;
            RuleFor(e => e.AgeGroup).IsInEnum();
            RuleFor(e => e.GuestNumber)
                .NotEmpty()
                .NotNull()
                .WithMessage("Guest number should be set")
                ;
        }

        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="_">The .</param>
        public void IsValid(GuestDto obj, object? _ = null)
        => this.ValidateAndThrow(obj);
    }
}
