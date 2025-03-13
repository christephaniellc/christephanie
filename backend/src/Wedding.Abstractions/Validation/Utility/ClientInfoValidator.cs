using FluentValidation;
using Wedding.Abstractions.Dtos.ClientInfo;
using Wedding.Abstractions.Validation.Common;

namespace Wedding.Abstractions.Validation.Utility
{
    public class ClientInfoValidator : AbstractValidator<ClientInfoDto>, IValidate<ClientInfoDto>
    {
        public ClientInfoValidator()
        {
            RuleFor(clientInfo => clientInfo.IpAddress)
                .NotEmpty()
                .WithMessage("Ipaddress is empty.");
        }

        /// <summary>
        /// Validates the specified object.
        /// </summary>
        /// <param name="obj">The object.</param>
        /// <param name="_">The .</param>
        public void IsValid(ClientInfoDto? obj, object? _ = null)
            => this!.ValidateAndThrow(obj);
    }
}
