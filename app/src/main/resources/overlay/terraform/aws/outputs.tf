output "url" {
  value = "https://${aws_apprunner_service.cas.service_url}"
}
