output "s3_location_runner_distribution" {
  value = local.s3_location_runner_distribution
}

output "launch_template" {
  value = aws_launch_template.runner
}
