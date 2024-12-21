using System.Linq;
using System.Net;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Wedding.PublicApi.Swagger
{
    public class AddResponsesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // if (operation.Responses.ContainsKey("Unauthorized"))
            // {
            //     operation.Responses[HttpStatusCode.Unauthorized.ToString()] = new OpenApiResponse { Description = "Unauthorized" };
            //     operation.Responses.Remove("Unauthorized");
            // }
            if (!operation.Responses.ContainsKey("401"))
            {
                operation.Responses.Add("401", new OpenApiResponse { Description = "Unauthorized" });
            }

            foreach (var response in operation.Responses)
            {
                var jsonContent = response.Value.Content.FirstOrDefault(c => c.Key == "application/json");
                response.Value.Content.Clear();

                if (jsonContent.Key != null)
                {
                    response.Value.Content.Add(jsonContent.Key, jsonContent.Value);
                }
            }
        }
    }
}
