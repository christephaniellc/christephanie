using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Abstractions;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.FamilyUnit.Get.Commands;
using Wedding.Lambdas.FamilyUnit.Get.Validation;

namespace Wedding.Lambdas.FamilyUnit.Get.Handlers
{
    public class GetFamilyUnitHandler : IAsyncQueryHandler<GetFamilyUnitQuery, FamilyUnitDto>
    {
        private readonly ILogger<GetFamilyUnitHandler> _logger;
        private readonly IDynamoDBProvider _dynamoDbProvider;
        private readonly IMapper _mapper;

        public GetFamilyUnitHandler(ILogger<GetFamilyUnitHandler> logger, IDynamoDBProvider dynamoDbProvider, IMapper mapper)
        {
            _logger = logger;
            _dynamoDbProvider = dynamoDbProvider;
            _mapper = mapper;
        }

        public async Task<FamilyUnitDto> GetAsync(GetFamilyUnitQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            query.Validate(nameof(query));

            try
            {
                var results = await _dynamoDbProvider.GetFamilyUnitAsync(query.InvitationCode, cancellationToken);
                
                if (results == null)
                {
                    throw new KeyNotFoundException($"Family unit with invitation code '{query.InvitationCode}' not found.");
                }

                if (results.Guests.Any(result => result.GuestId == query.GuestId) == null && !query.Roles.Contains(RoleEnum.Admin))
                {
                    throw new UnauthorizedAccessException("Access denied");
                }

                return results;
            }
            catch (KeyNotFoundException ex)
            {
                throw new KeyNotFoundException(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                throw new UnauthorizedAccessException(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the family unit.");
                throw new ApplicationException("An error occurred while getting the family unit.", ex);
            }
        }
    }
}
