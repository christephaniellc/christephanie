using Amazon.SimpleEmail.Model;
using System.Threading.Tasks;
using System.Threading;
using Wedding.Abstractions.Dtos;
using System.Collections.Generic;

namespace Wedding.Common.Helpers.AWS
{
    public interface IAwsSesHelper
    {
        Task<SendEmailResponse?> SendEmail(List<string> toAddresses, string subject, string body, CancellationToken cancellationToken);
        Task<SendEmailResponse?> SendVerificationCode(VerifiedDto email, CancellationToken cancellationToken);
    }
}
