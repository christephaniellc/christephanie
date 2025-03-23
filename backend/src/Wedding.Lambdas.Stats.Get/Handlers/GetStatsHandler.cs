using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Stats.Get.Commands;
using Wedding.Lambdas.Stats.Get.Validation;

namespace Wedding.Lambdas.Stats.Get.Handlers
{
    public class GetStatsHandler : 
        IAsyncQueryHandler<GetStatsQuery, List<FamilyUnitViewModel>>
    {
        private readonly ILogger<GetStatsHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public GetStatsHandler(ILogger<GetStatsHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<List<FamilyUnitViewModel>> GetAsync(GetStatsQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var result = await _dynamoDBProvider.GetFamilyUnitsAsync(query.AuthContext.Audience, cancellationToken);

                if (result == null)
                {
                    throw new UnauthorizedAccessException("User not found.");
                }

                var dtos = _mapper.Map<List<FamilyUnitDto>>(result);
                return _mapper.Map<List<FamilyUnitViewModel>>(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the user.");
                throw new UnauthorizedAccessException($"User not found. {ex.Message}");
            }
        }
    }
}
