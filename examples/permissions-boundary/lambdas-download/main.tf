module "lambdas" {
  source = "../../../modules/download-lambda"
  lambdas = [
    {
      name = "webhook"
      tag  = "v0.6.0"
    },
    {
      name = "runners"
      tag  = "v0.6.0"
    },
    {
      name = "runner-binaries-syncer"
      tag  = "v0.6.0"
    }
  ]
}

output "files" {
  value = module.lambdas.files
}
