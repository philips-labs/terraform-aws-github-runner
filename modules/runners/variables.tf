variable "aws_region" {
  description = "AWS region."
  type        = string
}

variable "vpc_id" {
  description = "The VPC to spin up instances in"
}


variable "overrides" {
  description = "This maps provides the possibility to override some defaults. The following attributes are supported: `name_sg` overwrite the `Name` tag for all security groups created by this module. `name_runner_agent_instance` override the `Name` tag for the ec2 instance defined in the auto launch configuration. `name_docker_machine_runners` ovverrid the `Name` tag spot instances created by the runner agent."
  type        = map(string)

  default = {
    name_sg = ""
  }
}

variable "tags" {
  description = "Map of tags that will be added to created resources. By default resources will be tagged with name and environment."
  type        = map(string)
  default     = {}
}

variable "environment" {
  description = "A name that identifies the environment, used as prefix and for tagging."
  type        = string
}

variable "distribution_bucket_name" {
  type = string
}

variable "block_device_mappings" {
  description = "The EC2 instance block device configuration. Takes the following keys: `delete_on_termination`, `volume_type`, `volume_size`, `encrypted`, `iops`"
  type        = map(string)
  default     = {}
}

variable "market_options" {
  default = "spot"
}

variable "instance_type" {
  default = "m5.large"
}

variable "associate_public_ip_address" {
  type    = bool
  default = false
}

variable "action_runner_dist_bucket_location" {
  default = "actions-runner-linux.tar.gz"
}


variable "ami_filter" {
  description = "List of maps used to create the AMI filter for the runner AMI. Currently Amazon Linux 2 `amzn2-ami-hvm-2.0.????????-x86_64-ebs` looks to *not* be working for this configuration."
  type        = map(list(string))

  default = {
    name = ["amzn2-ami-hvm-2.*-x86_64-ebs"]
  }
}

variable "ami_owners" {
  description = "The list of owners used to select the AMI of runner instances."
  type        = list(string)
  default     = ["amazon"]
}
