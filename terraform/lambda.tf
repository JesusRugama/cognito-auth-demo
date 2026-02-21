resource "aws_iam_role" "lambda_exec" {
  name = "demo-cognito-auth-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

locals {
  lambda_handlers = {
    endpoint1 = { description = "Read User's addresses list — customer + admin" }
    endpoint2 = { description = "Create New Address — customer + admin" }
    endpoint3 = { description = "Update Address — admin only" }
    endpoint4 = { description = "List Users — admin only" }
  }
}

resource "aws_lambda_function" "api" {
  for_each = local.lambda_handlers

  function_name = "demo-cognito-auth-${each.key}"
  description   = each.value.description
  role          = aws_iam_role.lambda_exec.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"

  s3_bucket = var.bucket_name
  s3_key    = "server/${each.key}.zip"

  environment {
    variables = {
      FUNCTION_NAME = each.key
    }
  }
}
