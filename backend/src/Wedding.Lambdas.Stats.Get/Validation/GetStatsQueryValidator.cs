using FluentValidation;
using Wedding.Abstractions.Validation.Common;
using Wedding.Abstractions.Validation.Utility;
using Wedding.Lambdas.Stats.Get.Commands;

namespace Wedding.Lambdas.Stats.Get.Validation
{
    /// <summary>
    /// Validator for AdminGetFamilyUnitQuery.
    /// Implements the <see cref="AbstractValidator{T}" />
    /// </summary>
    /// <seealso cref="AbstractValidator{T}" />
    internal class GetStatsQueryValidator : AbstractValidator<GetStatsQuery>, IValidate<GetStatsQuery>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GetStatsQueryValidator" /> class.
        /// </summary>
        public GetStatsQueryValidator()
        {
            RuleFor(cmd => cmd.AuthContext)
                .NotNull()
                .SetValidator(new AuthContextValidator(false));
        }

        public void IsValid(GetStatsQuery obj, object? _ = null)
            => this.ValidateAndThrow(obj);
    }
}
