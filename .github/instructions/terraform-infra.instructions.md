---
applyTo: "infra/**/*.tf"
---

- Declara las variables en `variables.tf` con `type` explícito y los recursos y el provider en `main.tf`.
- Mantén el provider AWS fijado a `~> 5.0` y usa `var.prefix` para los nombres de los recursos.
- Todo bucket S3 nuevo debe ir acompañado de su `aws_s3_bucket_public_access_block`, con los cuatro bloqueos (`block_public_acls`, `block_public_policy`, `ignore_public_acls`, `restrict_public_buckets`) a `true`.
- Ejecuta `terraform validate` después de cada cambio.
