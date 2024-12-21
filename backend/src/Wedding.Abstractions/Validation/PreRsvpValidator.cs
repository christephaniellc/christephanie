// using FluentValidation;
// using Wedding.Abstractions.Dtos;
// using Wedding.Abstractions.Validation.Common;
//
// namespace Wedding.Abstractions.Validation
// {
//     public class PreRsvpValidator : AbstractValidator<RsvpDto>, IValidate<RsvpDto>
//     {
//         /// <summary>
//         /// Initializes a new instance of the <see cref="PreRsvpValidator"/> class.
//         /// </summary>
//         public PreRsvpValidator()       
//         {
//             RuleFor(p => p.SleepPreference).IsInEnum();
//         }
//
//         public void IsValid(RsvpDto obj, object? _ = null)
//             => this.ValidateAndThrow(obj);
//     }
// }
