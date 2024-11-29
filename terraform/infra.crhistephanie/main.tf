provider "aws" {
  region = "us-west-2"
}

resource "aws_s3_bucket" "wedding_media" {
  bucket = "wedding-media-bucket"
}

resource "aws_dynamodb_table" "guest_preferences" {
  name           = "GuestPreferences"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "guest_id"

  attribute {
    name = "guest_id"
    type = "S"
  }
}

resource "aws_lambda_function" "api_lambda" {
  function_name = "wedding_api"
  runtime       = "python3.11"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "app.main.handler"
  filename      = "../backend/app.zip"
  source_code_hash = filebase64sha256("../backend/app.zip")
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.guest_preferences.name
    }
  }
}

resource "aws_api_gateway_rest_api" "api_gateway" {
  name        = "wedding_api_gateway"
  description = "API Gateway for Wedding FastAPI Lambda"
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway.id
  parent_id   = aws_api_gateway_rest_api.api_gateway.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.api_gateway.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_method.http_method
  type        = "AWS_PROXY"
  uri         = aws_lambda_function.api_lambda.invoke_arn
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api_gateway.execution_arn}/*/*"
}