using System;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Entities;
using Wedding.Common.Abstractions;
using Wedding.Lambdas.User.Get.Commands;
using Wedding.Lambdas.User.Get.Validation;

namespace Wedding.Lambdas.User.Get.Handlers
{
    public class GetUserHandler : IAsyncQueryHandler<GetUserQuery, GuestDto>
    {
        private readonly ILogger<GetUserHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;

        public GetUserHandler(ILogger<GetUserHandler> logger, IDynamoDBContext repository, IMapper mapper)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<GuestDto> GetAsync(GetUserQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            var queryRequest = new DynamoDBOperationConfig
            {
                IndexName = "Auth0IdIndex" // Specify the GSI name
            };

            try
            {
                var result = await _repository.QueryAsync<WeddingEntity>(query.Auth0Id, queryRequest).GetRemainingAsync();

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
