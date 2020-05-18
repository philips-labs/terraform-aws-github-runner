module "lambdas" {
  source = "../../../modules/download-lambda"
  lambdas = [
    {
      name = "webhook"
      tag  = "v0.0.0-beta"
    },
    {
      name = "runners"
      tag  = "v0.0.0-beta"
    },
    {
      name = "runner-binaries-syncer"
      tag  = "v0.0.0-beta"
    }
  ]
}

output "files" {
  value = module.lambdas.files
}
