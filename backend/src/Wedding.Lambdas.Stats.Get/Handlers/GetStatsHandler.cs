using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Abstractions;
using Wedding.Common.FeatureFlags;
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
                var relevantResults = result
                    .Where(family => FeatureFlags.TiersToIncludeInStats.Contains(family.Tier))
                    .ToList();

                if (result == null)
                {
                    throw new UnauthorizedAccessException("Stats not found.");
                }

                var dtos = _mapper.Map<List<FamilyUnitDto>>(relevantResults);
                return _mapper.Map<List<FamilyUnitViewModel>>(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the stats.");
                throw new UnauthorizedAccessException($"Stats not found. {ex.Message}");
            }
        }
    }
}
