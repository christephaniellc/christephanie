using FluentValidation.TestHelper;
using System.Collections.Generic;
using Wedding.Abstractions.Dtos;
using Wedding.Abstractions.Enums;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Commands;
using Wedding.PublicApi.Logic.Areas.FamilyUnit.Validation;

namespace Wedding.PublicApi.Logic.UnitTests.Areas.FamilyUnit.Validation
{
    [TestFixture]
    [UnitTestsFor(typeof(FamilyUnitInvitationResponseCommandValidator))]
    public class FamilyUnitInvitationResponseCommandValidatorTests
    {
        private FamilyUnitInvitationResponseCommandValidator _validator;

        [SetUp]
        public void Setup()
        {
            _validator = new FamilyUnitInvitationResponseCommandValidator();
        }

        [Test]
        public void Should_Have_Error_When_MailingAddress_Is_Empty_And_Guest_Is_Interested()
        {
            var command = new RsvpFamilyUnitCommand(
                new FamilyUnitDto
                {
                    RsvpCode = "ABCDE",
                    Tier = "B",
                    MailingAddress = string.Empty,
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            FirstName = "Johann",
                            LastName = "Sebastian",
                            Rsvp = new RsvpDto
                            {
                                InvitationResponse = InvitationResponseEnum.Interested
                            }
                        }
                    }
                }
            );

            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(cmd => cmd.FamilyUnit.MailingAddress);
        }

        [Test]
        public void Should_Have_Error_When_MailingAddress_Is_Empty_And_AtLeast_One_Guest_Is_Interested()
        {
            var command = new RsvpFamilyUnitCommand(
                new FamilyUnitDto
                {
                    RsvpCode = "ABCDE",
                    Tier = "B",
                    MailingAddress = string.Empty,
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            FirstName = "Johann",
                            LastName = "Bach",
                            Rsvp = new RsvpDto
                            {
                                InvitationResponse = InvitationResponseEnum.Declined
                            }
                        },
                        new GuestDto
                        {
                            FirstName = "Heinrich",
                            LastName = "Knudson",
                            Rsvp = new RsvpDto
                            {
                                InvitationResponse = InvitationResponseEnum.Interested
                            }
                        }
                    }
                }
            );

            var result = _validator.TestValidate(command);
            result.ShouldHaveValidationErrorFor(cmd => cmd.FamilyUnit.MailingAddress);
        }

        [Test]
        public void Should_Not_Have_Error_When_MailingAddress_Is_Not_Empty_And_Guest_Is_Interested()
        {
            var command = new RsvpFamilyUnitCommand(
                new FamilyUnitDto
                {
                    MailingAddress = "123 Main St",
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            Rsvp = new RsvpDto
                            {
                                InvitationResponse = InvitationResponseEnum.Interested
                            }
                        }
                    }
                }
            );

            var result = _validator.TestValidate(command);
            result.ShouldNotHaveValidationErrorFor(cmd => cmd.FamilyUnit.MailingAddress);
        }

        [Test]
        public void Should_Not_Have_Error_When_MailingAddress_Is_Not_Empty_And_At_Least_One_Guest_Is_Interested()
        {
            var command = new RsvpFamilyUnitCommand(
                new FamilyUnitDto
                {
                    MailingAddress = "123 Main St",
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            Rsvp = new RsvpDto
                            {
                                InvitationResponse = InvitationResponseEnum.Interested
                            }
                        },
                        new GuestDto
                        {
                            Rsvp = new RsvpDto
                            {
                                InvitationResponse = InvitationResponseEnum.Declined
                            }
                        }
                    }
                }
            );

            var result = _validator.TestValidate(command);
            result.ShouldNotHaveValidationErrorFor(cmd => cmd.FamilyUnit.MailingAddress);
        }

        [Test]
        public void Should_Not_Have_Error_When_Guest_Is_Not_Interested()
        {
            var command = new RsvpFamilyUnitCommand(
                new FamilyUnitDto
                {
                    MailingAddress = string.Empty,
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            Rsvp = new RsvpDto
                            {
                                InvitationResponse = InvitationResponseEnum.Declined
                            }
                        }
                    }
                }
            );

            var result = _validator.TestValidate(command);
            result.ShouldNotHaveValidationErrorFor(cmd => cmd.FamilyUnit.MailingAddress);
        }

        [Test]
        public void Should_Not_Have_Error_When_All_Guests_Are_Not_Interested()
        {
            var command = new RsvpFamilyUnitCommand(
                new FamilyUnitDto
                {
                    MailingAddress = string.Empty,
                    Guests = new List<GuestDto>
                    {
                        new GuestDto
                        {
                            Rsvp = new RsvpDto
                            {
                                InvitationResponse = InvitationResponseEnum.Declined
                            }
                        },
                        new GuestDto
                        {
                            Rsvp = new RsvpDto
                            {
                                InvitationResponse = InvitationResponseEnum.Declined
                            }
                        }
                    }
                }
            );

            var result = _validator.TestValidate(command);
            result.ShouldNotHaveValidationErrorFor(cmd => cmd.FamilyUnit.MailingAddress);
        }

        [Test]
        public void Should_Not_Have_Error_When_AdditionalAddresses_Is_Empty()
        {
            var command = new RsvpFamilyUnitCommand(
                new FamilyUnitDto
                {
                    MailingAddress = "213 Main St",
                    AdditionalAddresses = new List<string>()
                }
            );

            var result = _validator.TestValidate(command);
            result.ShouldNotHaveValidationErrorFor(cmd => cmd.FamilyUnit.AdditionalAddresses);
        }

        [Test]
        public void Should_Not_Have_Error_When_AdditionalAddresses_Is_Valid()
        {
            var command = new RsvpFamilyUnitCommand(new FamilyUnitDto
                {
                    AdditionalAddresses = new List<string>
                    {
                        "456 Elm St"
                    }
                }
            );

            var result = _validator.TestValidate(command);
            result.ShouldNotHaveValidationErrorFor("FamilyUnit.AdditionalAddresses[0]");
        }
    }
}
