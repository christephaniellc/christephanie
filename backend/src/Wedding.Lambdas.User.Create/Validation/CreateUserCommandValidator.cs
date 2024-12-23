// using FluentValidation;
// using Wedding.Abstractions.Validation.Common;
// using Wedding.Abstractions.Validation.Utility;
// using Wedding.Lambdas.User.Create.Commands;
//
// namespace Wedding.Lambdas.User.Create.Validation
// {
//     /// <summary>
//     /// Validator for CreateFamilyUnitCommand.
//     /// Implements the <see cref="AbstractValidator{T}" />
//     /// </summary>
//     /// <seealso cref="AbstractValidator{T}" />
//     internal class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>, IValidate<CreateUserCommand>
//     {
//         /// <summary>
//         /// Initializes a new instance of the <see cref="CreateUserCommandValidator" /> class.
//         /// </summary>
//         public CreateUserCommandValidator()
//         {
//             RuleFor(cmd => cmd.Auth0Id)
//                 .NotEmpty()
//                 .WithMessage("Identity cannot be empty.");
//             RuleFor(cmd => cmd.InvitationCode)
//                 .NotEmpty()
//                 .WithMessage("InvitationCode cannot be empty.")
//                 .SetValidator(new RsvpCodeValidator());
//             RuleFor(cmd => cmd.FirstName)
//                 .NotEmpty()
//                 .WithMessage("FirstName cannot be empty.");
//         }
//
//         public void IsValid(CreateUserCommand obj, object? _ = null)
//             => this.ValidateAndThrow(obj);
//     }
// }
