using System.Net;
using System.Threading.Tasks;

namespace Wedding.Common.Helpers.AWS
{
    public interface IAwsSmsHelper
    {
        Task<HttpStatusCode?> SendVerificationCode(string phoneNumber, string message);
    }
}
