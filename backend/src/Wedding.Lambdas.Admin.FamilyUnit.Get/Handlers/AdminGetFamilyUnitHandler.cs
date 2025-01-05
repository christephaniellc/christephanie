using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Get.Validation;

namespace Wedding.Lambdas.Admin.FamilyUnit.Get.Handlers
{
    public class AdminGetFamilyUnitHandler : 
        IAsyncQueryHandler<AdminGetFamilyUnitQuery, FamilyUnitDto>,
        IAsyncQueryHandler<AdminGetFamilyUnitsQuery, List<FamilyUnitDto>>
    {
        private readonly ILogger<AdminGetFamilyUnitHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDBProvider;
        private readonly IMapper _mapper;

        public AdminGetFamilyUnitHandler(ILogger<AdminGetFamilyUnitHandler> logger, IDynamoDBProvider dynamoDBProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDBProvider = dynamoDBProvider;
            _mapper = mapper;
        }

        public async Task<FamilyUnitDto> GetAsync(AdminGetFamilyUnitQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var result = await _dynamoDBProvider.GetFamilyUnitAsync(query.InvitationCode, cancellationToken);

                if (result == null)
                {
                    throw new UnauthorizedAccessException("User not found.");
                }

                return _mapper.Map<FamilyUnitDto>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the user.");
                throw new UnauthorizedAccessException($"User not found. {ex.Message}");
            }
        }

        public async Task<List<FamilyUnitDto>> GetAsync(AdminGetFamilyUnitsQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var result = await _dynamoDBProvider.GetFamilyUnitsAsync(cancellationToken);

                if (result == null)
                {
                    throw new UnauthorizedAccessException("User not found.");
                }

                return _mapper.Map<List<FamilyUnitDto>>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the user.");
                throw new UnauthorizedAccessException($"User not found. {ex.Message}");
            }
        }
    }
}
