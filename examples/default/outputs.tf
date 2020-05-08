output "runners" {
  value = {
    runners = module.runners.runners
  }
}

# output "binaries_syncer" {
#   value = {
#     binaries_syncer = module.runners.binaries_syncer
#   }
# }

output "webhook" {
  value = {
    gateway = module.runners.webhook.gateway
  }
}
