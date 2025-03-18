using Amazon.SimpleEmail.Model;
using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Dtos;
using System.Collections.Generic;
using Wedding.Abstractions.Dtos.Auth;

namespace Wedding.Common.Helpers.AWS
{
    public interface IAwsSesHelper
    {
        Task<SendEmailResponse?> SendValidationEmail(AuthContext authContext, VerifiedDto email, CancellationToken cancellationToken);
        Task<SendEmailResponse?> SendEmail(List<string> toAddresses, string subject, string textBody, string htmlBody, CancellationToken cancellationToken);
    }
}
