locals {
  endpoints = {
    endpoint1 = { method = "GET",  required_group = "customer | admin" }
    endpoint2 = { method = "POST", required_group = "customer | admin" }
    endpoint3 = { method = "PUT",  required_group = "admin" }
    endpoint4 = { method = "GET",  required_group = "admin" }
  }
}

# ---- REST API ----

resource "aws_api_gateway_rest_api" "main" {
  name        = "demo-cognito-auth"
  description = "API demonstrating Cognito authentication and authorization patterns"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# ---- Resources (paths) ----

resource "aws_api_gateway_resource" "endpoint" {
  for_each = local.endpoints

  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = each.key
}

# ---- Lambda Authorizer ----

resource "aws_api_gateway_authorizer" "lambda" {
  name                             = "lambda-authorizer"
  rest_api_id                      = aws_api_gateway_rest_api.main.id
  authorizer_uri                   = aws_lambda_function.authorizer.invoke_arn
  authorizer_result_ttl_in_seconds = 0
  type                             = "TOKEN"
  identity_source                  = "method.request.header.Authorization"
}

# ---- Methods ----

resource "aws_api_gateway_method" "endpoint" {
  for_each = local.endpoints

  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.endpoint[each.key].id
  http_method   = each.value.method
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.lambda.id
}

# ---- OPTIONS methods (CORS preflight) ----

resource "aws_api_gateway_method" "options" {
  for_each = local.endpoints

  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.endpoint[each.key].id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  for_each = local.endpoints

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.endpoint[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options" {
  for_each = local.endpoints

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.endpoint[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  for_each = local.endpoints

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.endpoint[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Authorization,Content-Type'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'https://cognito-auth.demos.jesusrugama.com'"
  }

  depends_on = [
    aws_api_gateway_integration.options,
    aws_api_gateway_method_response.options,
  ]
}

# ---- Lambda integrations ----

resource "aws_api_gateway_integration" "endpoint" {
  for_each = local.endpoints

  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.endpoint[each.key].id
  http_method             = aws_api_gateway_method.endpoint[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api[each.key].invoke_arn
}

# ---- Lambda permissions (allow API Gateway to invoke each function) ----

resource "aws_lambda_permission" "api_gateway" {
  for_each = local.endpoints

  statement_id  = "AllowAPIGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# ---- Deployment + Stage ----

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.endpoint,
      aws_api_gateway_method.endpoint,
      aws_api_gateway_integration.endpoint,
      aws_api_gateway_authorizer.lambda,
      aws_api_gateway_method.options,
      aws_api_gateway_integration.options,
      aws_api_gateway_integration_response.options,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_api_gateway_integration.endpoint]
}

resource "aws_api_gateway_stage" "prod" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  deployment_id = aws_api_gateway_deployment.main.id
  stage_name    = "prod"

}

resource "aws_api_gateway_method_settings" "throttling" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.prod.stage_name
  method_path = "*/*"

  settings {
    throttling_rate_limit  = 10
    throttling_burst_limit = 20
  }
}
