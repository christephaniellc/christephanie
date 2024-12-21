# Publish from Visual Studio:
[YouTube: publish with Lambda](https://www.youtube.com/watch?v=VKGzlXLmFmg&list=PLJqiLzcLjcTlj-fpUfPpisaC4ZBqsrJJ9&ab_channel=MukeshMurugan)

0. Set Api project type as Lambda:

	```
	<PropertyGroup>
		<TargetFramework>net8.0</TargetFramework>
		<AWSProjectType>Lambda</AWSProjectType>
	</PropertyGroup>
	```

---
## With AWS Toolkit Extension
1. Right click `Wedding.PublicApi` project > Publish to AWS Lambda

OR

---

## With AWS CLI
cmd: 
```
D:
cd "D:\dev\github\christephanie\backend\src\Wedding.PublicApi"
dotnet lambda deploy-function -c Release 
-o ./publish
OLD:  dotnet publish -c Release -o ./publish

Runtime: dotnet8
Name: christephanie-rest-api-dev
IAM role: 
4) Create new IAM role named: christephanie-api-role, 
Select 
	4) AWSLambdaBasicExecutionRole
			
Memory size: 256
Timeout: 500 secs
Handler: 
	Wedding.PublicApi.Amazon.LambdaEntryPoint::Wedding.PublicApi.Amazon.LambdaEntryPoint::FunctionHandlerAsync
	<assembly>::<type>::<method>
```
christephanie-rest-api-dev-role-zj365xlg  
New christephanie-api-role needs Dynamo access, too.
	
### Add dynamo access permission to role:
AWS > Lambda > API > Configuration > Permissions > api-role 
```
Add Permissions 
Create Inline policy: 
	DynamoDB 
		All DynamoDB actions 
		Resources: All 
	Policy name: ddb-permissions 
	Create Policy 
```

AWS > Lambda > Functions > Configuration > Function URL
```
Create new Function URL 
Auth type: NONE (jwt tokens)
SAVE 

```

(click Function URL)
https://ett442kyhd53x2rzm25qhkvylq0ovxir.lambda-url.us-east-1.on.aws/

```
	/helloworld
	/swagger (error)
		create new ENV VAR in Lambda for development to show swagger 
Environment Variable
	ASPNETCORE_ENVIRONMENT=Development
```
	
---------
## Deploy Automation
To automate deploy, create `aws-lambda-tools-defaults.json` inside API project
```
{
	"profile": "",
	"region": "",
	"configuration": "Release",
	"function-runtime": "dotnet8",
	"function-memory-size": 256,
	"function-timeout": 30,
	"function-handler": "handler",
	"function-name": "simpleAPI",
	"environment-variables": "ASPNETCORE_ENVIRONMENT=Development;sldkfjslkdfj=value",
	"function-url-enable": true
}
```

then CLI cmd: 
```
dotnet lambda deploy-function 
```

---
## Testing with Postman

URL is function URL (https://slkdjflskdjf.lambda-url.us-east-1.on.aws/ (GET) 

Another tab for POST endpoint 
	Body tab 
		Fill out data as json 
---
# Process with ChatGPT
Publish:
	cd D:\dev\github\christephanie\backend\src\Wedding.PublicApi
	dotnet publish -c Release -o ./publish

Zip:
	zip -r ../lambda-deployment.zip publish/.

		zips to: D:\dev\github\christephanie\backend\src\Wedding.PublicApi\lambda-deployment.zip
	
First Push:
	aws lambda create-function --function-name christephanie-rest-api --runtime dotnet8 --role arn:aws:iam::502723119948:role/lambda-deploy-role --function-handler Wedding.PublicApi.Amazon.LambdaEntryPoint::Wedding.PublicApi.Amazon.LambdaEntryPoint::FunctionHandlerAsync --zip-file fileb://../lambda-deployment.zip
	
	aws lambda create-function --function-name christephanie-rest-api --runtime dotnet8 --role arn:aws:iam::502723119948:role/lambda-deploy-role --handler Wedding.PublicApi.Amazon.LambdaEntryPoint::Wedding.PublicApi.Amazon.LambdaEntryPoint::FunctionHandlerAsync --zip-file fileb://../lambda-deployment.zip
	
		OLD
		aws lambda create-function \
			--function-name christephanie-rest-api \
			--runtime dotnet8 \
			--role arn:aws:iam::502723119948:role/LambdaDynamoRole \
			--handler Wedding.PublicApi.Amazon.LambdaEntryPoint::Wedding.PublicApi.Amazon.LambdaEntryPoint::FunctionHandlerAsync \
			--zip-file fileb://../lambda-deployment.zip
	
### Adding API GATEWAY INTEGRATIONS:
	lambda ARN: 
		arn:aws:lambda:us-east-1:502723119948:function:christephanie-rest-api
	execution role: 
		arn:aws:iam::502723119948:role/lambda-deploy-role
		
		arn:aws:iam::502723119948:policy/api-gateway-allow-assume-and-invokeLambda
	
TEST:
aws lambda invoke --function-name christephanie-rest-api output.json

CONSOLE LINK:
	https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/christephanie-rest-api?tab=code
FUNCTION ARN:
	arn:aws:lambda:us-east-1:502723119948:function:christephanie-rest-api
	
Following pushes:
	aws lambda update-function-code \
		--function-name ChristephaniRestAPI \
		--zip-file fileb://../lambda-deployment.zip
		
		
---
Step 5: Set Up API Gateway (Optional)
https://us-east-1.console.aws.amazon.com/apigateway/main/apis/pk17th6rie/resources?api=pk17th6rie&region=us-east-1
```
	Go to API Gateway in the AWS Console.
	Create a new REST API or use an existing one.
	Create a new resource and method (e.g., POST, GET).
	Integrate it with your Lambda function:
		Select Integration type: Lambda Function.
		Choose your Lambda function.
	Deploy the API:
		Go to the Deployments section.
		Create a new deployment stage (e.g., prod).
```
	
Step 6:
Test your API using tools like Postman or curl:

bash
curl -X POST https://your-api-gateway-url/prod/resource \
    -H "Content-Type: application/json" \
    -d '{"key": "value"}'
	
Step 7:
7. Automate Deployment
```
	Once the Swagger file is Lambda-compatible:

	Include it in your deployment pipeline to be used by API Gateway.
	Automate the import process using AWS CLI or SDK.
	For example, you can use the AWS CLI to update the API Gateway:

	bash
		aws apigateway import-rest-api --body 'file://path-to-swagger.json'
```