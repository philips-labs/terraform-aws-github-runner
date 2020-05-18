resource "aws_lambda_function" "webhook" {
  filename         = local.lambda_zip
  source_code_hash = filebase64sha256(local.lambda_zip)
  function_name    = "${var.environment}-webhook"
  role             = aws_iam_role.webhook_lambda.arn
  handler          = "index.githubWebhook"
  runtime          = "nodejs12.x"
  timeout          = var.lambda_timeout

  environment {
    variables = {
      GITHUB_APP_WEBHOOK_SECRET = var.github_app_webhook_secret
      SQS_URL_WEBHOOK           = var.sqs_build_queue.id
    }
  }

  tags = var.tags
}

resource "aws_lambda_permission" "webhook" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.webhook.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.webhook.execution_arn}/*/*/${local.webhook_endpoint}"
}

data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "webhook_lambda" {
  name                 = "${var.environment}-action-webhook-lambda-role"
  assume_role_policy   = data.aws_iam_policy_document.lambda_assume_role_policy.json
  path                 = local.role_path
  permissions_boundary = var.role_permissions_boundary
  tags                 = var.tags
}

resource "aws_iam_role_policy" "webhook_logging" {
  name   = "${var.environment}-lamda-logging-policy"
  role   = aws_iam_role.webhook_lambda.name
  policy = templatefile("${path.module}/policies/lambda-cloudwatch.json", {})
}

resource "aws_iam_role_policy" "webhook_sqs" {
  name = "${var.environment}-lambda-webhook-publish-sqs-policy"
  role = aws_iam_role.webhook_lambda.name

  policy = templatefile("${path.module}/policies/lambda-publish-sqs-policy.json", {
    sqs_resource_arn = var.sqs_build_queue.arn
  })
}
