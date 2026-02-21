locals {
  endpoints = {
    endpoint1 = { method = "GET",    scope = "myapi/read" }
    endpoint2 = { method = "POST",   scope = "myapi/write" }
    endpoint3 = { method = "PUT",    scope = "myapi/write" }
    endpoint4 = { method = "GET",    scope = "myapi/admin" }
  }
}

# ---- REST API ----

resource "aws_api_gateway_rest_api" "main" {
  name        = "demo-cognito-scopes"
  description = "API demonstrating Cognito custom OAuth scope enforcement"

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

# ---- Methods ----

resource "aws_api_gateway_method" "endpoint" {
  for_each = local.endpoints

  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.endpoint[each.key].id
  http_method   = each.value.method
  authorization = "NONE" # Will be updated to COGNITO_USER_POOLS after Cognito is created
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
