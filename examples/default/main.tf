locals {
  environment = "test.default"
  aws_region  = "eu-west-1"
}

resource "random_string" "random" {
  length  = 24
  special = false
  upper   = false
}

module "runners" {
  source = "../../modules/runners"

  aws_region = local.aws_region
  vpc_id     = module.vpc.vpc_id

  environment = local.environment
  tags = {
    Project = "ProjectX"
  }
  distribution_bucket_name = random_string.random.result
}

