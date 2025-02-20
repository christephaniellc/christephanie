using Amazon.Lambda.Core;
using System.Runtime.CompilerServices;
using Wedding.Common.Serialization;

[assembly: LambdaSerializer(typeof(CustomLambdaJsonSerializer))]
[assembly: InternalsVisibleTo("Wedding.Lambdas.UnitTests")]
[assembly: InternalsVisibleTo("Wedding.PublicApi.Logic")]