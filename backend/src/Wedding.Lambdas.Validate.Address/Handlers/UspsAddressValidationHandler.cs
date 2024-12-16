using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Common.Abstractions;
using Wedding.Common.ThirdParty;
using Wedding.Lambdas.Validate.Address.Commands;
using Wedding.Lambdas.Validate.Address.Validation;

namespace Wedding.Lambdas.Validate.Address.Handlers
{
    public class UspsAddressValidationHandler : IAsyncQueryHandler<ValidateUspsAddressQuery, AddressDto>
    {
        private readonly ILogger<UspsAddressValidationHandler> _logger;
        private readonly IDynamoDBContext _repository;
        private readonly IMapper _mapper;
        private readonly IUspsMailingAddressValidationProvider _uspsMailingAddressValidationProvider;

        public UspsAddressValidationHandler(ILogger<UspsAddressValidationHandler> logger, 
            IDynamoDBContext repository, 
            IMapper mapper, 
            IUspsMailingAddressValidationProvider uspsMailingAddressValidationProvider)
        {
            _logger = logger;
            _repository = repository;
            _mapper = mapper;
            _uspsMailingAddressValidationProvider = uspsMailingAddressValidationProvider;
        }

        public async Task<AddressDto> GetAsync(ValidateUspsAddressQuery query, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logger.LogInformation($"Raw Query: {query.EnteredAddress}");

            query.Validate(nameof(query));

            var dto = _mapper.Map<AddressDto>(query.EnteredAddress);

            _logger.LogInformation($"Raw DTO: {dto}");

            return await _uspsMailingAddressValidationProvider.ValidateAddress(dto);
        }
    }
}
