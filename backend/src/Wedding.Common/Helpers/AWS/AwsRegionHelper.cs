using System;
using Amazon;

namespace Wedding.Common.Helpers.AWS
{
    public static class AwsRegionHelper
    {
        public static RegionEndpoint GetRegionEndpointFromEnvironment()
        {
            var awsRegion = Environment.GetEnvironmentVariable("AWS_REGION");

            if (string.IsNullOrWhiteSpace(awsRegion))
            {
                throw new InvalidOperationException("AWS_REGION environment variable is not set.");
            }

            return RegionEndpoint.GetBySystemName(awsRegion);
        }
    }
}
