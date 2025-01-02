using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Wedding.Abstractions.Entities;
using Wedding.Common.Helpers.AWS;
using Wedding.Common.Utility.Testing.TestChain;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Commands;
using Wedding.Lambdas.Admin.FamilyUnit.Delete.Handlers;

namespace Wedding.Lambdas.UnitTests.Admin.FamilyUnit.Delete
{
    [TestFixture]
    [UnitTestsFor(typeof(AdminDeleteFamilyUnitHandler))]
    public class AdminDeleteFamilyUnitHandlerTests
    {
        private Mock<ILogger<AdminDeleteFamilyUnitHandler>> _mockLogger;
        private Mock<IDynamoDBProvider> _mockDynamoDBProvider;
        private Mock<IMapper> _mockMapper;
        private AdminDeleteFamilyUnitHandler _handler;

        [SetUp]
        public void SetUp()
        {
            _mockLogger = new Mock<ILogger<AdminDeleteFamilyUnitHandler>>();
            _mockDynamoDBProvider = new Mock<IDynamoDBProvider>();
            _mockMapper = new Mock<IMapper>();

            _handler = new AdminDeleteFamilyUnitHandler(_mockLogger.Object, _mockDynamoDBProvider.Object, _mockMapper.Object);
        }

        [Test]
        public async Task ExecuteAsync_DeletesFamilyUnit_ReturnsTrue()
        {
            // Arrange
            var command = new AdminDeleteFamilyUnitCommand("ABCDE");
            var cancellationToken = CancellationToken.None;

            var weddingEntities = new List<WeddingEntity>
            {
                new WeddingEntity { PartitionKey = "PK1", SortKey = "SK1" },
                new WeddingEntity { PartitionKey = "PK2", SortKey = "SK2" }
            };

            _mockDynamoDBProvider
                .Setup(r => r.QueryAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(weddingEntities);

            _mockDynamoDBProvider
                .Setup(r => r.DeleteAsync(It.IsAny<string>(), It.IsAny<string>(), cancellationToken))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.ExecuteAsync(command, cancellationToken);

            // Assert
            Assert.IsTrue(result);
            _mockDynamoDBProvider.Verify(r => r.QueryAsync("ABCDE", cancellationToken), Times.Once);
            _mockDynamoDBProvider.Verify(r => r.DeleteAsync("ABCDE", "SK1", cancellationToken), Times.Once);
            _mockDynamoDBProvider.Verify(r => r.DeleteAsync("ABCDE", "SK2", cancellationToken), Times.Once);
        }

        [Test]
        public void ExecuteAsync_WhenRepositoryThrowsException_ThrowsApplicationException()
        {
            // Arrange
            var command = new AdminDeleteFamilyUnitCommand("ABCDE");
            var cancellationToken = CancellationToken.None;

            _mockDynamoDBProvider
                .Setup(r => r.QueryAsync("ABCDE", It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Repository failure"));

            // Act & Assert
            var exception = Assert.ThrowsAsync<ApplicationException>(async () =>
                await _handler.ExecuteAsync(command, cancellationToken));

            Assert.AreEqual("An error occurred while deleting the family unit.", exception.Message);
        }

        [Test]
        public void ExecuteAsync_InvalidCommand_ThrowsArgumentException()
        {
            // Arrange
            var command = new AdminDeleteFamilyUnitCommand(null);
            var cancellationToken = CancellationToken.None;

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _handler.ExecuteAsync(command, cancellationToken));
        }
    }
}
