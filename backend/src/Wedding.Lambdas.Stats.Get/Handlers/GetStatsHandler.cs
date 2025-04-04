using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Abstractions.ViewModels;
using Wedding.Common.Abstractions;
using Wedding.Common.FeatureFlags;
using Wedding.Common.Helpers.AWS;
using Wedding.Lambdas.Stats.Get.Commands;
using Wedding.Lambdas.Stats.Get.Validation;

namespace Wedding.Lambdas.Stats.Get.Handlers
{
    public class GetStatsHandler : 
        IAsyncQueryHandler<GetStatsQuery, StatsViewModel>
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

        public async Task<StatsViewModel> GetAsync(GetStatsQuery query, CancellationToken cancellationToken = default(CancellationToken))
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

                var families = _mapper.Map<List<FamilyUnitDto>>(relevantResults);

                var stats = new StatsViewModel();

                foreach (var family in families)
                {
                    var familyInterested = false;
                    var familyAttendingWedding = false;
                    var familyAttending4th= false;
                    var familyDeclined = false;
                    stats.TotalFamilies++;

                    // Process each guest in the family
                    foreach (var guest in family.Guests)
                    {
                        // Always count everyone in the totals for the pixel representation
                        stats.TotalGuests++;

                        // Count by invitationResponse status
                        if (guest.Rsvp == null)
                        {
                            stats.PendingWeddingGuests++;
                        }
                        else
                        {
                            if (guest.Rsvp!.Wedding != null && guest.Rsvp!.Wedding == RsvpEnum.Attending)
                            {
                                stats.AttendingWeddingGuests++;
                                familyAttendingWedding = true;
                            }
                            if (guest.Rsvp!.InvitationResponse == InvitationResponseEnum.Interested)
                            {
                                stats.InterestedGuests++;
                                familyInterested = true;
                            }
                            else if (guest.Rsvp!.InvitationResponse == InvitationResponseEnum.Declined
                                     || (guest.Rsvp!.Wedding != null && guest.Rsvp?.Wedding == RsvpEnum.Declined))
                            {
                                stats.DeclinedGuests++;
                                familyDeclined = true;
                            }
                            if (guest.Rsvp!.InvitationResponse == InvitationResponseEnum.Pending
                                     && (guest.Rsvp?.Wedding == null || guest.Rsvp?.Wedding == RsvpEnum.Pending))
                            {
                                stats.PendingWeddingGuests++;
                            }

                            if (guest.Rsvp?.FourthOfJuly == null || guest.Rsvp?.FourthOfJuly == RsvpEnum.Pending)
                            {
                                stats.Pending4thGuests++;
                            }
                            else if (guest.Rsvp!.FourthOfJuly == RsvpEnum.Attending)
                            {
                                stats.Attending4thGuests++;
                                familyAttending4th = true;
                            }
                            else if (guest.Rsvp!.FourthOfJuly == RsvpEnum.Declined)
                            {
                                stats.Declined4thGuests++;
                            }
                        }

                        // Only count statistics for guests who are not pending
                        if (guest.Rsvp?.InvitationResponse == InvitationResponseEnum.Interested
                            || guest.Rsvp.Wedding == RsvpEnum.Attending)
                        {
                            // Count by age group
                            if (guest.AgeGroup == AgeGroupEnum.Baby) stats.BabyGuests++;
                            else if (guest.AgeGroup == AgeGroupEnum.Under13) stats.Under13Guests++;
                            else if (guest.AgeGroup == AgeGroupEnum.Under21) stats.Under21Guests++;
                            else if (guest.AgeGroup == AgeGroupEnum.Adult) stats.AdultGuests++;

                            // Count by food preference
                            if (guest.Preferences?.FoodPreference == FoodPreferenceEnum.Omnivore) stats.OmnivoreGuests++;
                            else if (guest.Preferences?.FoodPreference == FoodPreferenceEnum.Vegetarian)
                                stats.VegetarianGuests++;
                            else if (guest.Preferences?.FoodPreference == FoodPreferenceEnum.Vegan) stats.VeganGuests++;

                            // Count by accommodation preference
                            if (guest.Preferences?.SleepPreference == SleepPreferenceEnum.Manor) stats.ManorGuests++;
                            else if (guest.Preferences?.SleepPreference == SleepPreferenceEnum.Camping)
                                stats.CampingGuests++;
                            else if (guest.Preferences?.SleepPreference == SleepPreferenceEnum.Hotel) stats.HotelGuests++;
                            else if (guest.Preferences?.SleepPreference == SleepPreferenceEnum.Other)
                                stats.OtherAccommodationGuests++;
                            else if (guest.Preferences?.SleepPreference == SleepPreferenceEnum.Unknown)
                                stats.UnknownAccommodationGuests++;
                        }

                        // Count allergies (only if guest is not pending)
                        if (guest.Rsvp?.InvitationResponse == InvitationResponseEnum.Interested
                            || guest.Rsvp?.Wedding == RsvpEnum.Attending)
                        {
                            foreach (var allergy in guest.Preferences?.FoodAllergies)
                            {
                                stats.AllergiesCount[allergy] = (stats.AllergiesCount.ContainsKey(allergy) 
                                    ? stats.AllergiesCount[allergy] : 0) + 1;
                            }
                        }

                        // Process client info for ALL guests, including pending
                        if (guest.ClientInfos != null && guest.ClientInfos.Count > 0)
                        {
                            foreach (var clientInfo in guest.ClientInfos)
                            {
                                stats.TotalClientInfos++;

                                // Track device types
                                var deviceType  = clientInfo.Device?.Type ?? "unknown";
                                stats.DeviceTypesCount[deviceType] = (stats.DeviceTypesCount.ContainsKey(deviceType) 
                                    ? stats.DeviceTypesCount[deviceType] : 0) + 1;

                                // Track browsers
                                var browserName = clientInfo.Browser?.Name ?? "unknown";
                                stats.Browsers[browserName] = (stats.Browsers.ContainsKey(browserName)
                                    ? stats.Browsers[browserName] : 0) + 1;

                                // Track operating systems
                                var os  = clientInfo.Os ?? "unknown";
                                stats.OperatingSystems[os] = (stats.OperatingSystems.ContainsKey(os)
                                    ? stats.OperatingSystems[os] : 0) + 1;

                                // Track screen sizes (categorize by common breakpoints)
                                var width  = clientInfo.Screen?.Width ?? 0;
                                var screenCategory = "unknown";
                                if (width > 0)
                                {
                                    if (width < 576) screenCategory = "mobile (<576px)";
                                    else if (width < 768) screenCategory = "small tablet (576px-767px)";
                                    else if (width < 992) screenCategory = "tablet (768px-991px)";
                                    else if (width < 1200) screenCategory = "laptop (992px-1199px)";
                                    else if (width < 1600) screenCategory = "desktop (1200px-1599px)";
                                    else screenCategory = "large (1600px+)";
                                }

                                stats.ScreenSizes[screenCategory] = (stats.ScreenSizes.ContainsKey(screenCategory)
                                    ? stats.ScreenSizes[screenCategory] : 0) + 1;

                                // Track languages
                                var language  = clientInfo.Language ?? "unknown";
                                stats.Languages[language] = (stats.Languages.ContainsKey(language)
                                    ? stats.Languages[language] : 0) + 1;

                                // Track connection types
                                var connectionType  = clientInfo.Connection?.EffectiveType ?? "unknown";
                                stats.ConnectionTypes[connectionType] = (stats.ConnectionTypes.ContainsKey(connectionType)
                                    ? stats.ConnectionTypes[connectionType] : 0) + 1;

                                // Approximate unique devices
                                var deviceId  = $"{browserName}-{os}-{width}";
                                stats.DeviceIds.Add(deviceId);
                            }
                        }
                    }

                    // Count family status
                    if (familyAttendingWedding) stats.AttendingWeddingFamilies++;
                    else if (familyDeclined) stats.DeclinedFamilies++;
                    else stats.PendingFamilies++;
                }

                // Calculate total guests who have responded (for meat-a-tarian count)
                stats.TotalRespondedSurveyGuests  = stats.InterestedGuests + stats.DeclinedGuests;
                stats.TotalRespondedRsvpGuests = stats.AttendingWeddingGuests + stats.DeclinedGuests;

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting the stats.");
                throw new UnauthorizedAccessException($"Stats not found. {ex.Message}");
            }
        }
    }
}
