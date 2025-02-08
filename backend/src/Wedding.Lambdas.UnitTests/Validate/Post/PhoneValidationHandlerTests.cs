using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Entities;
using Wedding.Abstractions.Mapping;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.FamilyUnit.Update.Handlers;
using Wedding.Lambdas.UnitTests.TestData;
using Wedding.Lambdas.Validate.Phone.Handlers;

namespace Wedding.Lambdas.UnitTests.Validate.Post
{
    [TestFixture]
    [UnitTestsFor(typeof(PhoneValidationHandler))]
    public class PhoneValidationHandlerTests
    {
        

        [Test]
        public void ShouldWriteTests()
        {
            Assert.Fail();
        }
    }
}
