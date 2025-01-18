using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.User.Get.Commands;
using Wedding.Lambdas.User.Get.Validation;

namespace Wedding.Lambdas.User.Get.Handlers
{
    public class GetUserHandler : IAsyncQueryHandler<GetUserQuery, GuestDto>
    {
        private readonly ILogger<GetUserHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public GetUserHandler(ILogger<GetUserHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<GuestDto> GetAsync(GetUserQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var result = await _dynamoDBProvider.QueryByGuestIdIndex(query.AuthContext.Audience, query.AuthContext.GuestId, cancellationToken);

                if (result == null || result.Count == 0)
                {
                    throw new UnauthorizedAccessException("User not found.");
                }

                return _mapper.Map<GuestDto>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the user.");
                throw new UnauthorizedAccessException($"User not found. {ex.Message}");
            }
        }
    }
}
