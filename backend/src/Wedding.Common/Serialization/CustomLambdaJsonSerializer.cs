using Amazon.Lambda.Serialization.SystemTextJson;

namespace Wedding.Common.Serialization
{
    public class CustomLambdaJsonSerializer : DefaultLambdaJsonSerializer
    {
        public CustomLambdaJsonSerializer()
            : base(options =>
            {
                options.PropertyNameCaseInsensitive = true;
            })
        {
        }
    }
}
