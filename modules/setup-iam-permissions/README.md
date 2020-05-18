# IAM setup for terraform execution the root module

This module is optional and only added as example. You can deploy the root terraform module via you own IAM user with the right credentials. Alternatively you can create a role to deploy the root module with a limit boundary set.

This module will create an AWS IAM role that is required to use permission boundaries. The created rol can be used to deploy the root module.

## Usages

See below or check out [this example](../../examples/permissions-boundary/README.md)
Create a workspace and add the following terraform code.

```
module "iam" {
  source = "../../"

  environemnt = "default"
  account_id  = "123456789

  namespaces = {
    boundary_namespace         = "bounaries"
    role_namespace             = "runners"
    policy_namespace           = "runners"
    instance_profile_namespace = "runners"
  }
}

output "role" {
  value = module.iam.role
}

output "boundary" {
  value = module.iam.boundary
}

```

Next execute the created Terraform code `terraform init && terraform apply` The module will. You can use the created role in your terraform provider with assume role and the boundary as well the namespace needs to be set to the root module.
