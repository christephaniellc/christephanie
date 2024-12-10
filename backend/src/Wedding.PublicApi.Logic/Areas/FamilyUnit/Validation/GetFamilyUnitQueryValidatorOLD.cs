// using System;
// using FluentValidation;
// using Wedding.Abstractions.Validation;
// using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
//
// namespace Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation
// {
//     /// <summary>
//     /// Validator for GetFamilyUnitQuery.
//     /// Implements the <see cref="AbstractValidator{GetFamilyUnitQuery}" />
//     /// </summary>
//     /// <seealso cref="AbstractValidator{GetFamilyUnitQuery}" />
//     internal class GetFamilyUnitQueryValidatorOLD : AbstractValidator<GetFamilyUnitQuery>, IValidate<GetFamilyUnitQuery>
//     {
//         const string _message = "Either the `id`, `code`, or `last name + first name` fields of the `GetFamilyUnitQuery` must be non-empty.";
//
//         /// <summary>
//         /// Initializes a new instance of the <see cref="GetFamilyUnitQueryValidatorOLD" /> class.
//         /// </summary>
//         public GetFamilyUnitQueryValidatorOLD()
//         {
//             RuleFor(c => c.Id)
//                 .NotEmpty()
//                 .Unless(c => 
//                     (
//                         (!string.IsNullOrWhiteSpace(c.LastName) && !string.IsNullOrWhiteSpace(c.FirstName)))
//                         || !string.IsNullOrEmpty(c.Code)
//                     )
//                 .WithMessage(_message)
//                 ;
//             RuleFor(c => c.Code)
//                 .NotEmpty()
//                 .Unless(c => 
//                     (
//                         (!string.IsNullOrWhiteSpace(c.LastName) && !string.IsNullOrWhiteSpace(c.FirstName)))
//                         || c.Id != Guid.Empty
//                     )
//                 .WithMessage(_message)
//                 ;
//             RuleFor(c => c.LastName)
//                 .NotEmpty()
//                 .Unless(c => c.Id != Guid.Empty || !string.IsNullOrWhiteSpace(c.Code))
//                 .WithMessage(_message)
//                 ;
//             RuleFor(c => c.FirstName)
//                 .NotEmpty()
//                 .When(c => !string.IsNullOrWhiteSpace(c.LastName))
//                 .Unless(c => c.Id != Guid.Empty || !string.IsNullOrWhiteSpace(c.Code))
//                 .WithMessage(_message)
//                 ;
//         }
//
//         public void IsValid(GetFamilyUnitQuery obj, object? _ = null)
//             => this.ValidateAndThrow(obj);
//     }
// }
