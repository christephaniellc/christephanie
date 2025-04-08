using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Dtos.Auth;
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

        public async Task<SendEmailResponse?> SendValidationEmail(AuthContext authContext, VerifiedDto email, CancellationToken cancellationToken)
        {
            var token = EmailTemplateHelper.GenerateTokenVerificationLink(_config, authContext.Audience, authContext.InvitationCode, authContext.GuestId, email.VerificationCode);
            var bodies = EmailTemplateHelper.SendVerificationCodeTemplate(_config, email, token, cancellationToken);

            var result = await SendEmail(toAddresses: new List<string> { email.Value },
                subject: "Email Verification Link",
                textBody: bodies.textBody,
                htmlBody: bodies.htmlBody,
                cancellationToken);

            Console.WriteLine($"SES response: {JsonSerializer.Serialize(result)}");
            Console.WriteLine($"Send email result: {result.HttpStatusCode} {JsonSerializer.Serialize(result.ResponseMetadata)}");
            return result;
        }
        
        public async Task<SendEmailResponse?> SendPaymentConfirmationEmail(string name, string email, string paymentIntentId, decimal amount, string category, string notes, string timestamp, CancellationToken cancellationToken)
        {
            var bodies = EmailTemplateHelper.SendPaymentConfirmationTemplate(
                _config,
                name,
                email,
                paymentIntentId,
                amount,
                category,
                notes,
                timestamp,
                cancellationToken);

            var result = await SendEmail(
                toAddresses: new List<string> { email },
                subject: "Payment Confirmation - Thank You for Your Contribution",
                textBody: bodies.textBody,
                htmlBody: bodies.htmlBody,
                cancellationToken);

            Console.WriteLine($"Payment Confirmation SES response: {JsonSerializer.Serialize(result)}");
            Console.WriteLine($"Payment Confirmation email sent. Message ID: {result.MessageId}");
            return result;
        }

        public async Task<SendEmailResponse?> SendEmail(List<string> toAddresses, string subject, string textBody, string htmlBody, CancellationToken cancellationToken)
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
                            Html = new Content { Charset = "UTF-8", Data = htmlBody },
                            Text = new Content { Charset = "UTF-8", Data = textBody },
                        }
                    }
                };
                var response = await sesClient.SendEmailAsync(sendRequest, cancellationToken);
                Console.WriteLine($"SES response: {JsonSerializer.Serialize(response)}");
                Console.WriteLine($"Email sent using Amazon SES. Message ID: {response.MessageId}");

                return response;
            }
        }
    }
}
