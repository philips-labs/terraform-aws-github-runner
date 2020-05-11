resource "aws_lambda_function" "scale_down" {
  filename         = "${path.module}/lambdas/scale-runners/scale-runners.zip"
  source_code_hash = filebase64sha256("${path.module}/lambdas/scale-runners/scale-runners.zip")
  function_name    = "${var.environment}-scale-down"
  role             = aws_iam_role.scale_down.arn
  handler          = "index.scaleDown"
  runtime          = "nodejs12.x"
  timeout          = 60

  environment {
    variables = {
      ENABLE_ORGANIZATION_RUNNERS = var.enable_organization_runners
      GITHUB_APP_KEY_BASE64       = var.github_app.key_base64
      GITHUB_APP_ID               = var.github_app.id
      GITHUB_APP_CLIENT_ID        = var.github_app.client_id
      GITHUB_APP_CLIENT_SECRET    = var.github_app.client_secret
      ENVIRONMENT                 = var.environment
    }
  }
}

resource "aws_cloudwatch_event_rule" "scale_down" {
  schedule_expression = var.scale_down_schedule_expression
  tags                = var.tags
}

resource "aws_cloudwatch_event_target" "scale_down" {
  rule = aws_cloudwatch_event_rule.scale_down.name
  arn  = aws_lambda_function.scale_down.arn
}

resource "aws_lambda_permission" "scale_down" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scale_down.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.scale_down.arn
}

resource "aws_iam_role" "scale_down" {
  name               = "${var.environment}-action-scale-down-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_policy" "scale_down" {
  name        = "${var.environment}-lambda-scale-down-policy"
  description = "Lambda scale up policy"
  policy      = templatefile("${path.module}/policies/lambda-scale-down.json", {})
}

resource "aws_iam_policy_attachment" "scale_down" {
  name       = "${var.environment}-scale-down"
  roles      = [aws_iam_role.scale_down.name]
  policy_arn = aws_iam_policy.scale_down.arn
}



