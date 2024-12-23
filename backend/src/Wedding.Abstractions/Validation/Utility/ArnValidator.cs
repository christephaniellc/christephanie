using FluentValidation;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    /// <summary>
    /// Validator for Arns.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    public class ArnValidator : AbstractValidator<string>, IValidate<string>
    {
        public ArnValidator()
        {
            RuleFor(arn => arn)
                .NotEmpty()
                .WithMessage("Arn cannot be empty.")
                .Must(BeAValidArn)
                .WithMessage("Invalid arn.");
        }

        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="_">The .</param>
        public void IsValid(string? obj, object? _ = null)
            => this!.ValidateAndThrow(obj);

        private bool BeAValidArn(string methodArn)
        {
            return !string.IsNullOrWhiteSpace(methodArn) &&
                   methodArn.StartsWith("arn:aws:lambda:") &&
                   methodArn.Contains("function:");
        }
    }
}
