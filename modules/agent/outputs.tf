output "gateway" {
  value = aws_apigatewayv2_api.webhook
}

output "sqs" {
  value = aws_sqs_queue.webhook_events
}
