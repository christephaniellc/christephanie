using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
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

        public FindUserHandler(ILogger<FindUserHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
        }

        public async Task<string> GetAsync(FindUserQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var items = await _dynamoDBProvider.QueryAsync(query.InvitationCode);
                if (items == null || items.Count == 0)
                {
                    throw new KeyNotFoundException($"Could not find invitation {query.InvitationCode} with first name {query.FirstName}. No items.");
                }

                var matchingGuest = items.FirstOrDefault(item =>
                    item.FirstName?.ToUpper() == query.FirstName.ToUpper() ||
                    (
                        item.AdditionalFirstNames != null
                        && item.AdditionalFirstNames.Select(firstName => firstName.ToUpper())
                            .Contains(query.FirstName.ToUpper()))
                );

                if (matchingGuest == null)
                {
                    throw new KeyNotFoundException($"Could not find invitation {query.InvitationCode} with first name {query.FirstName}. Family exists, guest does not.");
                }

                return matchingGuest.GuestId;
            }
            catch (KeyNotFoundException ex)
            {
                throw new KeyNotFoundException(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the user.");
                throw new Exception($"User not found. {ex.Message}");
            }
        }
    }
}
