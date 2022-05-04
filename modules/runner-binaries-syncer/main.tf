locals {
  action_runner_distribution_object_key = "actions-runner-${var.runner_os}.${var.runner_os == "linux" ? "tar.gz" : "zip"}"
}

resource "aws_s3_bucket" "action_dist" {
  bucket        = var.distribution_bucket_name
  force_destroy = true
  tags          = var.tags
}

resource "aws_s3_bucket_acl" "action_dist_acl" {
  bucket = aws_s3_bucket.action_dist.id
  acl    = "private"
}

resource "aws_s3_bucket_lifecycle_configuration" "bucket-config" {
  bucket = aws_s3_bucket.action_dist.id

  rule {
    id     = "lifecycle_config"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }

    transition {
      days          = 35
      storage_class = "INTELLIGENT_TIERING"
    }


  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "action_dist" {
  bucket = aws_s3_bucket.action_dist.id
  count  = length(keys(lookup(var.server_side_encryption_configuration, "rule", {}))) == 0 ? 0 : 1

  dynamic "rule" {
    for_each = [lookup(var.server_side_encryption_configuration, "rule", {})]

    content {
      bucket_key_enabled = lookup(rule.value, "bucket_key_enabled", null)

      dynamic "apply_server_side_encryption_by_default" {
        for_each = length(keys(lookup(rule.value, "apply_server_side_encryption_by_default", {}))) == 0 ? [] : [
        lookup(rule.value, "apply_server_side_encryption_by_default", {})]

        content {
          sse_algorithm     = apply_server_side_encryption_by_default.value.sse_algorithm
          kms_master_key_id = lookup(apply_server_side_encryption_by_default.value, "kms_master_key_id", null)
        }
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "action_dist" {
  bucket                  = aws_s3_bucket.action_dist.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
