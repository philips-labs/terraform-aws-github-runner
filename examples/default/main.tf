locals {
  environment = "default-action-runners"
  aws_region  = "eu-west-1"
}

module "runners" {
  source = "../../"

  aws_region = local.aws_region
  vpc_id     = module.vpc.vpc_id

  environment = local.environment
  tags = {
    Project = "ProjectX"
  }

}

