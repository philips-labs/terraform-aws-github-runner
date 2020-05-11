data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "${var.environment}-lamda-runners-logging-policy"
  description = "Lambda logging policy"

  policy = templatefile("${path.module}/policies/lambda-cloudwatch.json", {})
}

resource "aws_iam_policy_attachment" "lambda_logging" {
  name       = "${var.environment}-lambda-logging"
  roles      = [aws_iam_role.scale_down.name, aws_iam_role.scale_runners_lambda.name]
  policy_arn = aws_iam_policy.lambda_logging.arn
}
