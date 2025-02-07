// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading;
// using System.Threading.Tasks;
// using AutoMapper;
// using Microsoft.Extensions.Logging;
// using Wedding.Abstractions.Dtos;
// using Wedding.Abstractions.Enums;
// using Wedding.Abstractions.Flags;
// using Wedding.Abstractions.Specifications;
// using Wedding.Common.Abstractions;
// using Wedding.Common.Helpers.AWS;
// using Wedding.Lambdas.Admin.NotifyGuests.Commands;
// using Wedding.Lambdas.Admin.NotifyGuests.Validation;
//
// namespace Wedding.Lambdas.Admin.NotifyGuests.Handlers
// {
//     public class AdminNotifyGuestsHandler : IAsyncQueryHandler<AdminNotifyGuestsCommand, bool>
//     {
//         private readonly ILogger<AdminNotifyGuestsHandler> _logger;
//         private readonly IDynamoDBProvider _dynamoDbProvider;
//         private readonly IMapper _mapper;
//
//         public AdminNotifyGuestsHandler(ILogger<AdminNotifyGuestsHandler> logger, IDynamoDBProvider dynamoDbProvider, IMapper mapper)
//         {
//             _logger = logger;
//             _dynamoDbProvider = dynamoDbProvider;
//             _mapper = mapper;
//         }
//
//         public async Task<bool> GetAsync(AdminNotifyGuestsCommand query, CancellationToken cancellationToken = default(CancellationToken))
//         {
//             query.Validate(nameof(query));
//
//             try
//             {
//                 //List<GuestDto> affectedGuests;
//                 ISpecification<GuestDto> spec;
//                 switch (query.NotificationType)
//                 {
//                     case (NotificationTypeEnum.SaveTheDateAvailable):
//                     {
//                         // Returns everyone
//                         var guestStateFlags = new GuestStateFlags();
//                         //affectedGuests = await _dynamoDbProvider.GetAffectedGuests(query.AuthContext.Audience, guestStateFlags, cancellationToken);
//
//                         spec = new AlwaysTrueSpecification<GuestDto>();
//                             break;
//                     }
//                     case (NotificationTypeEnum.SaveTheDateResponseRemind):
//                     {
//                         // Returns everyone with missing information in STD, or no response yet
//                         var guestStateFlags = new GuestStateFlags
//                         {
//                             // TODO
//                         };
//                         affectedGuests = await _dynamoDbProvider.GetAffectedGuests(query.AuthContext.Audience, guestStateFlags, cancellationToken);
//
//                         // Define specifications for a guest.
//                         var respondedSpec = new HasRespondedStdSpecification();
//                         var completedSpec = new HasCompletedStdSpecification();
//
//                         // Compose them using AND.
//                         var receivingInvitationSpec = respondedSpec.And(completedSpec);
//
//                         // Then apply the specification to filter guest lists.
//                         List<GuestDto> FilterGuests(List<GuestDto> guests, ISpecification<GuestDto> spec)
//                         {
//                             return guests.Where(g => spec.IsSatisfiedBy(g)).ToList();
//                         }
//                             break;
//                     }
//                     case (NotificationTypeEnum.RsvpAvailable):
//                     {
//                         // Returns everyone that has at least 1 member responded "Interested" (maybe Pending?) during STD
//                         break;
//                     }
//                     case (NotificationTypeEnum.RsvpRemind):
//                     {
//                         // Returns everyone with Invitation Sent, has not declined, and has missing information to update information
//                         break;
//                     }
//                     default:
//
//                         spec = new AlwaysTrueSpecification<GuestDto>();
//                         break;
//                 }
//                 var affectedGuests = (await _dynamoDbProvider.GetAffectedGuests(query.AuthContext.Audience, new GuestStateFlags(), cancellationToken))
//                     .Where(g => spec.IsSatisfiedBy(g))
//                     .ToList();
//
//                // var results = await _dynamoDbProvider.GetFamilyUnitAsync(query.AuthContext.Audience, query.AuthContext.InvitationCode, cancellationToken);
//                 
//                 if (results == null)
//                 {
//                     throw new KeyNotFoundException($"Family unit with invitation code '{query.AuthContext.InvitationCode}' not found.");
//                 }
//
//                 if (results.Guests.Any(result => result.GuestId == query.AuthContext.GuestId) == null && !query.AuthContext.ParseRoles().Contains(RoleEnum.Admin))
//                 {
//                     throw new UnauthorizedAccessException("Access denied");
//                 }
//
//                 return results;
//             }
//             catch (KeyNotFoundException ex)
//             {
//                 throw new KeyNotFoundException(ex.Message);
//             }
//             catch (UnauthorizedAccessException ex)
//             {
//                 throw new UnauthorizedAccessException(ex.Message);
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "An error occurred while getting the family unit.");
//                 throw new ApplicationException("An error occurred while getting the family unit.", ex);
//             }
//         }
//     }
// }
