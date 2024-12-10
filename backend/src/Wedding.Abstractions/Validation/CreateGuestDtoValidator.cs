using FluentValidation;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation
{
    public class CreateGuestDtoValidator : AbstractValidator<GuestDto>, IValidate<GuestDto>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="GuestDtoValidator"/> class.
        /// </summary>
        public CreateGuestDtoValidator()
        {
            // RuleFor(d => d.PackageUri)
            //     .NotEmpty()
            //     .WithMessage("Package URI cannot be null, empty or consist of only whitespace characters.")
            //     .Must(u => IsValidPackageUri(u))
            //     .WithMessage("The argument is not a valid Delinea Engine Pool Deployment package URI.")
            //     ;
            RuleFor(g => g.FirstName)
                .NotEmpty()
                .WithMessage(ValidationMessages.MustNotBeNullOrWhitespace("First name"))
                ;
            RuleFor(g => g.LastName)
                .NotEmpty()
                .WithMessage(ValidationMessages.MustNotBeNullOrWhitespace("Last name"))
                ;
            RuleFor(e => e.AgeGroup).IsInEnum();
            RuleForEach(g => g.Roles)
                .IsInEnum();

            // // TODO: SKS can I get email from Auth0?
            // if (!create && isPrimaryGuest)
            // {
            //     RuleFor(g => g.Email).NotEmpty()   
            //         .WithMessage(ValidationMessages.MustNotBeNullOrWhitespace("Email"))
            //         ;
            // }
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
