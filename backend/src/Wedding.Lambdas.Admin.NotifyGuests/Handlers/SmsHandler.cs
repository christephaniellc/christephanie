// using AutoMapper;
// using Microsoft.Extensions.Logging;
// using System.Threading;
// using System.Threading.Tasks;
// using Amazon.SimpleNotificationService;
// using Wedding.Common.Abstractions;
// using Wedding.Common.Helpers.AWS;
// using Wedding.Lambdas.Admin.NotifyGuests.Commands;
// using Wedding.Lambdas.Admin.NotifyGuests.Validation;
//
// namespace Wedding.Lambdas.Admin.NotifyGuests.Handlers
// {
//     public class SmsHandler : IAsyncQueryHandler<VerifyPhoneNumberCommand, bool>
//     {
//         private readonly ILogger<SmsHandler> _logger;
//         private readonly IDynamoDBProvider _dynamoDbProvider;
//         private readonly IMapper _mapper;
//
//         public SmsHandler(ILogger<SmsHandler> logger, IDynamoDBProvider dynamoDbProvider, IMapper mapper)
//         {
//             _logger = logger;
//             _dynamoDbProvider = dynamoDbProvider;
//             _mapper = mapper;
//         }
//
//         /// <summary>
//         /// Should send a text to 
//         /// </summary>
//         /// <param name="query"></param>
//         /// <param name="cancellationToken"></param>
//         /// <returns></returns>
//         public Task<bool> GetAsync(VerifyPhoneNumberCommand query, CancellationToken cancellationToken = default(CancellationToken))
//         {
//             query.Validate(nameof(query));
//
//             // TODO, send SMS to query.PhoneNumber. Save to DynamoDBProvider if number is verified
//             // Create an SNS client (optionally specify region via client config).
//             using var client = new AmazonSimpleNotificationServiceClient();
//         }
//     }
// }
