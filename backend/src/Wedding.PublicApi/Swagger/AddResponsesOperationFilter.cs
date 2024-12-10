using System.Net;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Wedding.PublicApi.Swagger
{
    public class AddResponsesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            operation.Responses[HttpStatusCode.Unauthorized.ToString()] = new OpenApiResponse { Description = "Unauthorized" };
        }
    }
}
