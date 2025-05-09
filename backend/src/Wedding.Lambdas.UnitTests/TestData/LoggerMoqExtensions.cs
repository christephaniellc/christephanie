using Microsoft.Extensions.Logging;
using Moq;

namespace Wedding.Lambdas.UnitTests.TestData
{
    public static class LoggerMoqExtensions
    {
        public static void VerifyLogged<T>(this Mock<ILogger<T>> loggerMock, LogLevel level, string containsMessage, Times times)
        {
            loggerMock.Verify(
                x => x.Log(
                    level,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((state, t) => state.ToString()!.Contains(containsMessage)),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                times);
        }
    }

}
