using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using Twilio.Http;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Configuration.Identity;

namespace Wedding.Common.Helpers.AWS
{
    public class AwsSesHelper : IAwsSesHelper
    {
        private readonly ApplicationConfiguration _config;

        public AwsSesHelper(ApplicationConfiguration config)
        {
            _config = config;
        }

        protected virtual IAmazonSimpleEmailService CreateSesClient()
        {
            return new AmazonSimpleEmailServiceClient();
        }

        public async Task<SendEmailResponse?> SendEmail(List<string> toAddresses, string subject, string body, CancellationToken cancellationToken)
        {
            using (var sesClient = CreateSesClient())
            {
                var senderEmail = _config.MailFromAddress;
                var sendRequest = new SendEmailRequest
                {
                    Source = senderEmail,
                    Destination = new Destination
                    {
                        ToAddresses = toAddresses
                    },
                    Message = new Message
                    {
                        Subject = new Content(_config.ApplicationName + " " + subject),
                        Body = new Body
                        {
                            Text = new Content(body)
                        }
                    }
                };
                var response = await sesClient.SendEmailAsync(sendRequest, cancellationToken);
                Console.WriteLine($"SES response: {JsonSerializer.Serialize(response)}");
                Console.WriteLine($"Email sent using Amazon SES. Message ID: {response.MessageId}");

                return response;
            }
        }

        public async Task<SendEmailResponse?> SendVerificationCode(VerifiedDto email, CancellationToken cancellationToken)
        {
            Console.WriteLine($"Sending verification email using Amazon SES. Email: {email.Value} Code: {email.VerificationCode}");

            var result = await SendEmail(toAddresses: new List<string> { email.Value }, 
               subject: "Wedding Email Verification Code", 
               body: $"Your wedding email verification code is: {email.VerificationCode}", 
               cancellationToken);

            Console.WriteLine($"SES response: {JsonSerializer.Serialize(result)}");
            Console.WriteLine($"Send email result: {result.HttpStatusCode} {JsonSerializer.Serialize(result.ResponseMetadata)}");
            return result;
        }
    }
}
