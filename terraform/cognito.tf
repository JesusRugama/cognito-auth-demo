# ---- User Pool ----

resource "aws_cognito_user_pool" "main" {
  name = "demo-cognito-auth"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }

  lambda_config {
    pre_authentication = aws_lambda_function.pre_auth.arn
  }
}

# ---- Groups ----

resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Admin role — full access"
}

# ---- App Clients ----

resource "aws_cognito_user_pool_client" "customer" {
  name         = "customer-app"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  generate_secret = false
}

resource "aws_cognito_user_pool_client" "admin" {
  name         = "admin-app"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  generate_secret = false
}

# ---- Pre-Authentication Lambda ----

resource "aws_lambda_function" "pre_auth" {
  function_name = "demo-cognito-auth-pre-auth"
  description   = "Blocks non-admin users from signing into the admin app client"
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"

  s3_bucket = var.bucket_name
  s3_key    = "lambdas/pre-auth.zip"

  environment {
    variables = {
      ADMIN_CLIENT_NAME = "admin-app"
    }
  }
}

resource "aws_lambda_permission" "cognito_pre_auth" {
  statement_id  = "AllowCognitoInvokePreAuth"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pre_auth.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}

resource "aws_iam_role_policy" "pre_auth_cognito" {
  name = "pre-auth-cognito-list-groups"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:ListUserPoolClients"
        ]
        Resource = aws_cognito_user_pool.main.arn
      }
    ]
  })
}

# ---- Lambda Authorizer ----

resource "aws_lambda_function" "authorizer" {
  function_name = "demo-cognito-auth-authorizer"
  description   = "API Gateway Lambda authorizer — checks cognito:groups and client_id"
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"

  s3_bucket = var.bucket_name
  s3_key    = "lambdas/authorizer.zip"

  environment {
    variables = {
      USER_POOL_ID       = aws_cognito_user_pool.main.id
      CUSTOMER_CLIENT_ID = aws_cognito_user_pool_client.customer.id
      ADMIN_CLIENT_ID    = aws_cognito_user_pool_client.admin.id
    }
  }
}

resource "aws_lambda_permission" "authorizer_api_gateway" {
  statement_id  = "AllowAPIGatewayInvokeAuthorizer"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}