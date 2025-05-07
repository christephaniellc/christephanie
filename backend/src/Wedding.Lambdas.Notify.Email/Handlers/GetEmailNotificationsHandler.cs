using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Notify.Email.Commands;

namespace Wedding.Lambdas.Notify.Email.Handlers
{
    public class GetEmailNotificationsHandler :
        IAsyncQueryHandler<GetEmailNotificationsQuery, List<GuestEmailLogDto>>
    {
        private readonly ILogger<GetEmailNotificationsHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public GetEmailNotificationsHandler(ILogger<GetEmailNotificationsHandler> logger,
            IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public Task<List<GuestEmailLogDto>> GetAsync(GetEmailNotificationsQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            throw new System.NotImplementedException();
        }
    }
}
