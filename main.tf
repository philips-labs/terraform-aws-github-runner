resource "random_string" "random" {
  length  = 24
  special = false
  upper   = false
}

module "runners" {
  source = "./modules/runners"

  aws_region = var.aws_region
  vpc_id     = var.vpc_id

  environment              = var.environment
  tags                     = var.tags
  distribution_bucket_name = random_string.random.result
}

