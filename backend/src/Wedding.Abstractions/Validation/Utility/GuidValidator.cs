using FluentValidation;
using System;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    public class GuidValidator : AbstractValidator<string>, IValidate<string>
    {
        public GuidValidator()
        {
            RuleFor(id => id)
                .NotEmpty()
                .WithMessage("Id cannot be empty.")
                .Must(id => BeAValidGuid(id))
                .WithMessage("Invalid id.");
        }

        private bool BeAValidGuid(string guid)
        {
            return Guid.TryParse(guid, out _);
        }

        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="_">The .</param>
        public void IsValid(string? obj, object? _ = null)
            => this!.ValidateAndThrow(obj);
    }
}
