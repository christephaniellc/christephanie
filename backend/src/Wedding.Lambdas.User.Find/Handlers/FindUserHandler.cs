using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Keys;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.User.Find.Commands;
using Wedding.Lambdas.User.Find.Validation;

namespace Wedding.Lambdas.User.Find.Handlers
{
    public class FindUserHandler : IAsyncQueryHandler<FindUserQuery, string>
    {
        private readonly ILogger<FindUserHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public FindUserHandler(ILogger<FindUserHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<string> GetAsync(FindUserQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));
            
            try
            {
                var items = await _dynamoDBProvider.QueryAsync(query.InvitationCode);

                var matchingGuest = items.FirstOrDefault(item =>
                    item.FirstName?.ToUpper() == query.FirstName.ToUpper() ||
                    (
                        item.AdditionalFirstNames != null
                        && item.AdditionalFirstNames.Select(firstName => firstName.ToUpper()).Contains(query.FirstName.ToUpper()))
                );

                if (matchingGuest == null)
                {
                    throw new UnauthorizedAccessException($"Could not find invitation {query.InvitationCode} with first name {query.FirstName}");
                }
                
                return matchingGuest.GuestId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the user.");
                throw new UnauthorizedAccessException($"User not found. {ex.Message}");
            }
        }
    }
}
