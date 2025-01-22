using System;
using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation
{
    public class GuestDtoPreRsvpValidator : AbstractValidator<GuestDto>, IValidate<GuestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GuestDtoValidator"/> class.
        /// </summary>
        public GuestDtoPreRsvpValidator()
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
            RuleFor(p => p.Preferences)
                .Must(prefs => prefs == null 
                               || (
                                   Enum.IsDefined(typeof(SleepPreferenceEnum), prefs.SleepPreference!)
                                   && Enum.IsDefined(typeof(FoodPreferenceEnum), prefs.FoodPreference!)
                                   ))
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
