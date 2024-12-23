// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading;
// using System.Threading.Tasks;
// using Amazon.DynamoDBv2.DataModel;
// using Amazon.DynamoDBv2.DocumentModel;
// using AutoMapper;
// using Microsoft.Extensions.Logging;
// using Wedding.Abstractions.Dtos;
// using Wedding.Abstractions.Entities;
// using Wedding.Abstractions.Keys;
// using Wedding.Common.Abstractions;
// using Wedding.Common.ThirdParty;
// using Wedding.Lambdas.User.Create.Commands;
// using Wedding.Lambdas.User.Create.Validation;
//
// namespace Wedding.Lambdas.User.Create.Handlers
// {
//     /// <summary>
//     /// After authorization validation lambda, create user. Return FamilyUnitDto as next screen shows family
//     /// </summary>
//     public class CreateUserHandler : IAsyncCommandHandler<CreateUserCommand, FamilyUnitDto>
//     {
//         private readonly ILogger<CreateUserHandler> _logger;
//         private readonly IDynamoDBContext _repository;
//         private readonly IMapper _mapper;
//
//         public CreateUserHandler(ILogger<CreateUserHandler> logger, IDynamoDBContext repository, IMapper mapper)
//         {
//             _logger = logger;
//             _repository = repository;
//             _mapper = mapper;
//         }
//
//         public async Task<FamilyUnitDto> ExecuteAsync(CreateUserCommand command, CancellationToken cancellationToken = default(CancellationToken))
//         {
//             command.Validate(nameof(command));
//
//             try
//             {
//                 var token = command.Token;
//
//                 // TODO get auth0 UserInfo from this token.
//
//                 var invitationCode = command.InvitationCode.ToUpper();
//                 var partitionKey = DynamoKeys.GetFamilyUnitPartitionKey(invitationCode);
//
//                 var dynamoQuery = new QueryOperationConfig()
//                 {
//                     KeyExpression = new Expression
//                     {
//                         ExpressionStatement = "PartitionKey = :pk",
//                         ExpressionAttributeValues =
//                         {
//                             { ":pk", partitionKey },
//                         }
//                     }
//                 };
//
//                 var result = await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery).GetRemainingAsync();
//
//                 var matchingGuestEntity = result.FirstOrDefault(guest =>
//                     string.Equals(guest.FirstName, command.FirstName, StringComparison.OrdinalIgnoreCase) ||
//                         (guest.AdditionalFirstNames?.Any(additionalName =>
//                         string.Equals(additionalName, command.FirstName, StringComparison.OrdinalIgnoreCase)) ?? false));
//
//                 if (matchingGuestEntity == null)
//                 {
//                     throw new UnauthorizedAccessException("Guest not found.");
//                 }
//                 // TODO SKS 12/22 need to grab all the UserInfo from Auth0 and save here
//
//                 matchingGuestEntity.Auth0Id = command.Auth0Id;
//                 await _repository.SaveAsync(matchingGuestEntity, cancellationToken);
//
//                 var updatedResult = await _repository.FromQueryAsync<WeddingEntity>(dynamoQuery).GetRemainingAsync();
//
//                 var familyUnit =
//                     updatedResult.FirstOrDefault(unit => unit.SortKey == DynamoKeys.GetFamilyInfoSortKey());
//                 var guests = updatedResult
//                     .Where(unit => unit.SortKey != DynamoKeys.GetFamilyInfoSortKey())
//                     .Select(unit => _mapper.Map<GuestDto>(unit)).ToList();
//
//                 var familyUnitDto = _mapper.Map<FamilyUnitDto>(familyUnit);
//                 familyUnitDto.Guests = guests;
//
//                 return familyUnitDto;
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "An error occurred while creating the user.");
//                 throw new ApplicationException("An error occurred while creating the user.", ex);
//             }
//         }
//     }
// }
