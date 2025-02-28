using System;
using System.Net;
using System.Threading.Tasks;
using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;

namespace Wedding.Common.Helpers.AWS
{
    public class AwsSmsHelper : IAwsSmsHelper
    {
        public async Task<HttpStatusCode?> SendVerificationCode(string phoneNumber, string message)
        {
            Console.WriteLine($"Sending SMS to number: {phoneNumber}");
            using (AmazonSimpleNotificationServiceClient snsClient = new AmazonSimpleNotificationServiceClient())
            {
                var snsRequest = new PublishRequest
                {
                    PhoneNumber = phoneNumber,
                    Message = message
                };

                var result = await snsClient.PublishAsync(snsRequest);
                return result.HttpStatusCode;
            }
        }
    }
}
