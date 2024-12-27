// using FluentValidation;
// using Wedding.Abstractions.Validation.Common;
// using Wedding.Abstractions.Validation.Utility;
// using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
//
// namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation
// {
//     /// <summary>
//     /// Validator for GetFamilyUnitQuery.
//     /// Implements the <see cref="AbstractValidator{ GetFamilyUnitQuery }" />
//     /// </summary>
//     /// <seealso cref="AbstractValidator{T}" />
//     internal class GetFamilyUnitQueryValidator : AbstractValidator<GetFamilyUnitQuery>, IValidate<GetFamilyUnitQuery>
//     {
//         /// <summary>
//         /// Initializes a new instance of the <see cref="GetFamilyUnitQueryValidator" /> class.
//         /// </summary>
//         public GetFamilyUnitQueryValidator()
//         {
//             RuleFor(query => query.RsvpCode)
//                 .NotNull()
//                 .NotEmpty()
//                 .SetValidator(new InvitationCodeValidator());
//         }
//
//         public void IsValid(GetFamilyUnitQuery obj, object? _ = null)
//             => this.ValidateAndThrow(obj);
//     }
// }
