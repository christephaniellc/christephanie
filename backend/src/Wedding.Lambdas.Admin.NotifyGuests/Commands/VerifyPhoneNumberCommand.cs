using Wedding.Abstractions.Dtos.Auth;
using Wedding.Common.Dispatchers;

namespace Wedding.Lambdas.Admin.NotifyGuests.Commands
{
    /// <summary>
    /// Class VerifyPhoneNumberCommand used to verify a phone number.
    /// Implements the <see cref="IWeddingQuery" />
    /// </summary>
    /// <seealso cref="IWeddingQuery" />
    /// <param name="PhoneNumber">Phone number to verify</param>
    public record VerifyPhoneNumberCommand(AuthContext AuthContext, string PhoneNumber) : IWeddingQuery;
}
